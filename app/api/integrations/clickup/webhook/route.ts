import crypto from 'node:crypto';
import { NextResponse } from 'next/server';

import { CLICKUP_FIELD_IDS } from '@/lib/clickup-performance';
import { db, databaseConfigured } from '@/lib/db';
import { people } from '@/lib/people';
import { decideRatingAuthority } from '@/lib/rating-authority';

export const dynamic = 'force-dynamic';

const CLICKUP_API_URL = 'https://api.clickup.com/api/v2';

const scoreMap: Record<string, number> = {
  Exceptional: 10, Strong: 8, Effective: 6, 'Needs Improvement': 4, 'Significant Improvement Needed': 2,
  'Exceptional Impact': 10, 'Strong Impact': 8, 'Expected Impact': 6, 'Limited Impact': 4, 'No Meaningful Impact': 2,
  'On Time': 10, 'Minor Delay': 7, Late: 4,
};

const performanceFieldIds = new Set<string>(Object.values(CLICKUP_FIELD_IDS));

type WebhookHistoryItem = {
  field?: string;
  date?: string;
  user?: { id?: number | string; username?: string };
  after?: unknown;
  data?: { field_id?: string };
  custom_field?: { id?: string; name?: string; type?: string };
};

type ClickUpWebhook = {
  event?: string;
  task_id?: string;
  history_items?: WebhookHistoryItem[];
};

type TaskField = {
  id: string;
  value?: string | number | null;
  type_config?: { options?: Array<{ id: string; name: string }> };
};

type ClickUpTask = {
  id: string;
  name: string;
  url: string;
  date_closed?: string | null;
  assignees?: Array<{ id: number | string; username?: string }>;
  custom_fields?: TaskField[];
};

function secureWebhook(raw: string, signature: string | null) {
  const secret = process.env.CLICKUP_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  if (!signature || signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function optionLabel(field: TaskField | undefined) {
  if (!field || field.value === null || field.value === undefined) return null;
  const options = field.type_config?.options ?? [];
  if (typeof field.value === 'number') return options[field.value]?.name ?? null;
  if (/^\d+$/.test(String(field.value))) return options[Number(field.value)]?.name ?? null;
  return options.find((option) => option.id === field.value)?.name ?? null;
}

async function fetchTask(taskId: string): Promise<ClickUpTask | null> {
  const token = process.env.CLICKUP_API_TOKEN;
  if (!token) return null;
  const response = await fetch(`${CLICKUP_API_URL}/task/${taskId}`, {
    headers: { Authorization: token },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  return response.json() as Promise<ClickUpTask>;
}

function employeeSlugs(task: ClickUpTask) {
  const ids = new Set((task.assignees ?? []).map((assignee) => String(assignee.id)));
  return people.filter((person) => person.clickupUserId && ids.has(person.clickupUserId)).map((person) => person.slug);
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!secureWebhook(raw, request.headers.get('x-signature'))) {
    return NextResponse.json({ ok: false, message: 'Invalid webhook signature.' }, { status: 401 });
  }
  if (!databaseConfigured) return NextResponse.json({ ok: false, message: 'Database is not configured.' }, { status: 503 });

  const payload = JSON.parse(raw) as ClickUpWebhook;
  if (payload.event !== 'taskUpdated' || !payload.task_id) return NextResponse.json({ ok: true, ignored: true });

  const history = payload.history_items ?? [];
  const relevant = history.filter((item) => {
    if (item.field !== 'custom_field') return false;
    // ClickUp's documented custom-field webhook payload identifies the field
    // under history_items[].custom_field.id. Keep data.field_id as a fallback
    // for compatibility with older/alternate payload shapes.
    const fieldId = item.custom_field?.id ?? item.data?.field_id;
    return Boolean(fieldId && performanceFieldIds.has(fieldId));
  });
  const statusChanged = history.some((item) => item.field === 'status');
  if (!relevant.length && !statusChanged) return NextResponse.json({ ok: true, ignored: true });

  const task = await fetchTask(payload.task_id);
  if (!task) return NextResponse.json({ ok: false, message: 'Unable to load changed task.' }, { status: 502 });

  const slugs = employeeSlugs(task);
  if (!slugs.length) return NextResponse.json({ ok: true, ignored: true, message: 'No mapped employee assignee.' });

  // Ratings are often entered before the reviewer closes the task. A later
  // status webhook therefore updates completion eligibility without requiring
  // the reviewer to touch the KPI fields again.
  if (statusChanged) {
    await db.query(
      `update task_rating_integrity
          set completed_at=$2, updated_at=now()
        where task_id=$1`,
      [task.id, task.date_closed ? new Date(Number(task.date_closed)).toISOString() : null],
    );
  }

  for (const item of relevant) {
    const fieldId = (item.custom_field?.id ?? item.data?.field_id) as string;
    const actorId = item.user?.id === undefined ? '' : String(item.user.id);
    const actorName = item.user?.username ?? null;
    const field = task.custom_fields?.find((candidate) => candidate.id === fieldId);
    const label = optionLabel(field);
    const score = label ? scoreMap[label] ?? null : null;

    for (const employeeSlug of slugs) {
      const decision = actorId
        ? decideRatingAuthority(employeeSlug, actorId)
        : { status: 'needs_validation' as const, reason: 'ClickUp did not identify the rating actor.' };
      const changedAt = item.date ? new Date(Number(item.date)).toISOString() : new Date().toISOString();

      try {
        await db.query(
        `insert into task_rating_integrity
          (task_id, field_id, employee_slug, task_name, task_url, current_score, current_label,
           current_actor_clickup_id, current_actor_name, verified_score, verified_label,
           verified_actor_clickup_id, verified_actor_name, verification_status, validation_reason,
           completed_at, changed_at, updated_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,
           case when $10::text='verified' then $6::numeric else null::numeric end,
           case when $10::text='verified' then $7::text else null::text end,
           case when $10::text='verified' then $8::text else null::text end,
           case when $10::text='verified' then $9::text else null::text end,
           $10::text,$11::text,$12::timestamptz,$13::timestamptz,now())
         on conflict (task_id, field_id, employee_slug) do update set
           task_name=excluded.task_name, task_url=excluded.task_url,
           current_score=excluded.current_score, current_label=excluded.current_label,
           current_actor_clickup_id=excluded.current_actor_clickup_id,
           current_actor_name=excluded.current_actor_name,
           verification_status=excluded.verification_status,
           validation_reason=excluded.validation_reason,
           completed_at=excluded.completed_at, changed_at=excluded.changed_at,
           verified_score=case when excluded.verification_status='verified' then excluded.current_score else task_rating_integrity.verified_score end,
           verified_label=case when excluded.verification_status='verified' then excluded.current_label else task_rating_integrity.verified_label end,
           verified_actor_clickup_id=case when excluded.verification_status='verified' then excluded.current_actor_clickup_id else task_rating_integrity.verified_actor_clickup_id end,
           verified_actor_name=case when excluded.verification_status='verified' then excluded.current_actor_name else task_rating_integrity.verified_actor_name end,
           updated_at=now()`,
        [task.id, fieldId, employeeSlug, task.name, task.url, score, label, actorId || null, actorName,
         decision.status, decision.reason, task.date_closed ? new Date(Number(task.date_closed)).toISOString() : null, changedAt],
        );
      } catch (error) {
        console.error('ClickUp rating integrity upsert failed', {
          taskId: task.id,
          fieldId,
          employeeSlug,
          actorId,
          status: decision.status,
          error: error instanceof Error ? error.message : String(error),
        });
        return NextResponse.json({ ok: false, message: 'Rating integrity write failed.' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true, processed: relevant.length, completionUpdated: statusChanged });
}
