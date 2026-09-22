import { NextResponse } from 'next/server';

import { getCurrentPortalUser, getTaskVisibleEmployeeSlugs } from '@/lib/access';
import { getPerson } from '@/lib/people';
import { ceoClickUpUserId } from '@/lib/rating-authority';
import { saveTaskRating } from '@/lib/task-ratings';

export const dynamic = 'force-dynamic';

const CLICKUP_API_URL = 'https://api.clickup.com/api/v2';

type ClickUpTask = {
  id: string;
  name: string;
  url: string;
  date_closed?: string | null;
  assignees?: Array<{ id: number | string }>;
};

async function fetchTask(taskId: string) {
  const token = process.env.CLICKUP_API_TOKEN;
  if (!token) return null;
  const response = await fetch(`${CLICKUP_API_URL}/task/${taskId}`, {
    headers: { Authorization: token },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  return response.json() as Promise<ClickUpTask>;
}

export async function POST(request: Request) {
  const current = await getCurrentPortalUser();
  if (!current) {
    return NextResponse.json({ ok: false, message: 'Sign in required.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as {
    taskId?: string;
    employeeSlug?: string;
    ratings?: Record<string, string>;
  } | null;

  const taskId = body?.taskId?.trim();
  const employeeSlug = body?.employeeSlug?.trim();
  const ratings = body?.ratings;

  if (!taskId || !employeeSlug || !ratings || typeof ratings !== 'object') {
    return NextResponse.json({ ok: false, message: 'Task, employee and ratings are required.' }, { status: 400 });
  }

  // The rater acts as their effective identity, so an admin using "view as"
  // cannot quietly rate on someone else's behalf.
  const rater = current.portalUser;

  if (rater.employeeSlug === employeeSlug) {
    return NextResponse.json(
      { ok: false, message: 'Self-rating is not valid performance evidence.' },
      { status: 403 },
    );
  }

  // Rating is limited to the same people this account may already see.
  const visible = await getTaskVisibleEmployeeSlugs(rater);
  if (!visible.includes(employeeSlug)) {
    return NextResponse.json({ ok: false, message: 'You cannot rate this employee.' }, { status: 403 });
  }

  const employee = getPerson(employeeSlug);
  if (!employee) {
    return NextResponse.json({ ok: false, message: 'Unknown employee.' }, { status: 404 });
  }

  // Task metadata is read from ClickUp rather than trusted from the client, so
  // the stored evidence cannot be pointed at a task the employee never had.
  const task = await fetchTask(taskId);
  if (!task) {
    return NextResponse.json({ ok: false, message: 'Unable to load that task from ClickUp.' }, { status: 502 });
  }

  const assigneeIds = new Set((task.assignees ?? []).map((assignee) => String(assignee.id)));
  if (!employee.clickupUserId || !assigneeIds.has(employee.clickupUserId)) {
    return NextResponse.json(
      { ok: false, message: `${employee.name} is not assigned to that task in ClickUp.` },
      { status: 400 },
    );
  }

  const raterPerson = rater.employeeSlug ? getPerson(rater.employeeSlug) : undefined;
  const actorClickUpId = raterPerson?.clickupUserId
    // The CEO/Admin account has no employee record of its own.
    ?? (rater.role === 'admin' ? ceoClickUpUserId() : undefined);

  if (!actorClickUpId) {
    return NextResponse.json(
      { ok: false, message: 'Your account has no ClickUp identity, so ratings cannot be attributed.' },
      { status: 403 },
    );
  }

  const result = await saveTaskRating({
    taskId: task.id,
    taskName: task.name,
    taskUrl: task.url,
    completedAt: task.date_closed ? new Date(Number(task.date_closed)).toISOString() : null,
    employeeSlug,
    ratings,
    actorClickUpId,
    actorName: raterPerson?.name ?? rater.email,
  });

  if (result.status === 'invalid') {
    return NextResponse.json({ ok: false, message: result.reason }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    saved: result.saved,
    status: result.status,
    reason: result.reason,
    completed: Boolean(task.date_closed),
  });
}
