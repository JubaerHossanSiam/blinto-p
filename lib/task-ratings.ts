import { db, databaseConfigured } from '@/lib/db';
import { scoreForLabel } from '@/lib/kpi-fields';
import { decideRatingAuthority } from '@/lib/rating-authority';

import { ratingKey, type TaskRatingMap, type TaskRatingSummary } from '@/lib/task-rating-types';

export { ratingKey };
export type { TaskRatingMap, TaskRatingSummary };

export async function getTaskRatings(employeeSlugs: string[]): Promise<TaskRatingMap> {
  if (!databaseConfigured || !employeeSlugs.length) return {};

  const result = await db.query<{
    task_id: string;
    employee_slug: string;
    field_id: string;
    current_label: string | null;
    verification_status: 'verified' | 'needs_validation' | 'invalid';
    validation_reason: string;
    current_actor_name: string | null;
    changed_at: Date | null;
  }>(
    `select task_id, employee_slug, field_id, current_label,
            verification_status, validation_reason, current_actor_name, changed_at
       from task_rating_integrity
      where employee_slug = any($1::text[])
        and current_label is not null`,
    [employeeSlugs],
  );

  const map: TaskRatingMap = {};
  for (const row of result.rows) {
    const key = ratingKey(row.task_id, row.employee_slug);
    const entry = map[key] ?? {
      fields: {},
      status: row.verification_status,
      reason: row.validation_reason,
      actorName: row.current_actor_name,
      ratedAt: row.changed_at ? row.changed_at.toISOString() : null,
    };
    if (row.current_label) entry.fields[row.field_id] = row.current_label;
    // A task is only as trustworthy as its weakest field.
    if (row.verification_status !== 'verified') {
      entry.status = row.verification_status;
      entry.reason = row.validation_reason;
    }
    map[key] = entry;
  }

  return map;
}

export type SaveRatingInput = {
  taskId: string;
  taskName: string;
  taskUrl: string;
  completedAt: string | null;
  employeeSlug: string;
  /** fieldId -> label. A field omitted here is left untouched. */
  ratings: Record<string, string>;
  actorClickUpId: string;
  actorName: string;
};

export type SaveRatingResult = {
  saved: number;
  status: 'verified' | 'needs_validation' | 'invalid';
  reason: string;
};

export async function saveTaskRating(input: SaveRatingInput): Promise<SaveRatingResult> {
  const authority = decideRatingAuthority(input.employeeSlug, input.actorClickUpId);

  // A rating the authority model rejects outright is never written: storing it
  // would put invalid evidence in the same table the official score reads.
  if (authority.status === 'invalid') {
    return { saved: 0, status: 'invalid', reason: authority.reason };
  }

  // One row per rated field. These used to be written one query at a time,
  // which meant up to eight sequential round trips for a single modal submit,
  // and a failure part-way through left the rating half saved. A single
  // multi-row upsert is one round trip and one atomic statement.
  const values: unknown[] = [];
  const rows: string[] = [];

  for (const [fieldId, label] of Object.entries(input.ratings)) {
    const score = scoreForLabel(fieldId, label);
    // Silently ignore anything that is not a real option for that field.
    if (score === undefined) continue;

    const p = values.length;
    rows.push(
      `($${p + 1}, $${p + 2}, $${p + 3}, $${p + 4}, $${p + 5},
        $${p + 6}, $${p + 7}, $${p + 8}, $${p + 9},
        $${p + 10}, $${p + 11}, $${p + 12}, $${p + 13},
        $${p + 14}, $${p + 15}, $${p + 16}, now(), now())`,
    );
    values.push(
      input.taskId, fieldId, input.employeeSlug, input.taskName, input.taskUrl,
      score, label, input.actorClickUpId, input.actorName,
      authority.status === 'verified' ? score : null,
      authority.status === 'verified' ? label : null,
      authority.status === 'verified' ? input.actorClickUpId : null,
      authority.status === 'verified' ? input.actorName : null,
      authority.status, authority.reason, input.completedAt,
    );
  }

  if (!rows.length) {
    return { saved: 0, status: authority.status, reason: authority.reason };
  }

  await db.query(
    `insert into task_rating_integrity (
       task_id, field_id, employee_slug, task_name, task_url,
       current_score, current_label, current_actor_clickup_id, current_actor_name,
       verified_score, verified_label, verified_actor_clickup_id, verified_actor_name,
       verification_status, validation_reason, completed_at, changed_at, updated_at
     ) values ${rows.join(', ')}
       on conflict (task_id, field_id, employee_slug) do update set
         task_name = excluded.task_name,
         task_url = excluded.task_url,
         current_score = excluded.current_score,
         current_label = excluded.current_label,
         current_actor_clickup_id = excluded.current_actor_clickup_id,
         current_actor_name = excluded.current_actor_name,
         verified_score = excluded.verified_score,
         verified_label = excluded.verified_label,
         verified_actor_clickup_id = excluded.verified_actor_clickup_id,
         verified_actor_name = excluded.verified_actor_name,
         verification_status = excluded.verification_status,
         validation_reason = excluded.validation_reason,
         completed_at = excluded.completed_at,
         changed_at = now(),
         updated_at = now()`,
    values,
  );

  return { saved: rows.length, status: authority.status, reason: authority.reason };
}
