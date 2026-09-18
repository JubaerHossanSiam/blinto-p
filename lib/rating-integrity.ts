import { db, databaseConfigured } from '@/lib/db';

export type RatingIntegritySummary = {
  eligible: number;
  verified: number;
  needsValidation: number;
  invalid: number;
};

export type RatingIntegrityIssue = {
  taskId: string;
  taskName: string;
  taskUrl: string;
  employeeSlug: string;
  employeeName: string;
  fieldId: string;
  currentLabel: string | null;
  currentScore: number | null;
  actorName: string | null;
  status: 'needs_validation' | 'invalid';
  reason: string;
  changedAt: string;
};

export async function getRatingIntegritySummary(monthKey = '2026-10', employeeSlugs?: string[]): Promise<RatingIntegritySummary> {
  if (!databaseConfigured) return { eligible: 0, verified: 0, needsValidation: 0, invalid: 0 };
  const start = `${monthKey}-01T00:00:00+06:00`;
  const [year, month] = monthKey.split('-').map(Number);
  const next = month === 12 ? `${year + 1}-01-01T00:00:00+06:00` : `${year}-${String(month + 1).padStart(2, '0')}-01T00:00:00+06:00`;
  const scoped = employeeSlugs?.length ? 'and employee_slug = any($3::text[])' : '';
  const params = employeeSlugs?.length ? [start, next, employeeSlugs] : [start, next];
  const result = await db.query<{
    eligible: string; verified: string; needs_validation: string; invalid: string;
  }>(
    `select
       count(distinct task_id)::text as eligible,
       count(distinct task_id) filter (where verification_status='verified')::text as verified,
       count(distinct task_id) filter (where verification_status='needs_validation')::text as needs_validation,
       count(distinct task_id) filter (where verification_status='invalid')::text as invalid
       from task_rating_integrity
      where completed_at >= $1::timestamptz and completed_at < $2::timestamptz ${scoped}`,
    params,
  );
  const row = result.rows[0];
  return {
    eligible: Number(row?.eligible ?? 0), verified: Number(row?.verified ?? 0),
    needsValidation: Number(row?.needs_validation ?? 0), invalid: Number(row?.invalid ?? 0),
  };
}

export async function getRatingIntegrityIssues(monthKey = '2026-10', employeeSlugs?: string[]): Promise<RatingIntegrityIssue[]> {
  if (!databaseConfigured) return [];
  const start = `${monthKey}-01T00:00:00+06:00`;
  const [year, month] = monthKey.split('-').map(Number);
  const next = month === 12 ? `${year + 1}-01-01T00:00:00+06:00` : `${year}-${String(month + 1).padStart(2, '0')}-01T00:00:00+06:00`;
  const scoped = employeeSlugs?.length ? 'and tri.employee_slug = any($3::text[])' : '';
  const params = employeeSlugs?.length ? [start, next, employeeSlugs] : [start, next];
  const result = await db.query(
    `select tri.task_id, tri.task_name, tri.task_url, tri.employee_slug, e.full_name,
            tri.field_id, tri.current_label, tri.current_score, tri.current_actor_name,
            tri.verification_status, tri.validation_reason, tri.changed_at
       from task_rating_integrity tri
       join employees e on e.slug = tri.employee_slug
      where tri.completed_at >= $1::timestamptz and tri.completed_at < $2::timestamptz
        and tri.verification_status in ('needs_validation','invalid') ${scoped}
      order by tri.changed_at desc
      limit 100`,
    params,
  );
  return result.rows.map((row) => ({
    taskId: row.task_id, taskName: row.task_name, taskUrl: row.task_url,
    employeeSlug: row.employee_slug, employeeName: row.full_name, fieldId: row.field_id,
    currentLabel: row.current_label, currentScore: row.current_score === null ? null : Number(row.current_score),
    actorName: row.current_actor_name, status: row.verification_status, reason: row.validation_reason,
    changedAt: row.changed_at?.toISOString?.() ?? String(row.changed_at),
  }));
}

export async function getVerifiedTaskKpiEvidence(employeeSlug: string, monthKey: string) {
  if (!databaseConfigured) return null;
  const start = `${monthKey}-01T00:00:00+06:00`;
  const [year, month] = monthKey.split('-').map(Number);
  const next = month === 12 ? `${year + 1}-01-01T00:00:00+06:00` : `${year}-${String(month + 1).padStart(2, '0')}-01T00:00:00+06:00`;
  const result = await db.query<{
    field_id: string; average: string; rated_tasks: string;
  }>(
    `select field_id, avg(verified_score)::text as average, count(distinct task_id)::text as rated_tasks
       from task_rating_integrity
      where employee_slug=$1
        and completed_at >= $2::timestamptz and completed_at < $3::timestamptz
        and verification_status='verified' and verified_score is not null
      group by field_id`,
    [employeeSlug, start, next],
  );
  const tasks = await db.query<{ task_id: string; task_name: string; task_url: string }>(
    `select distinct on (task_id) task_id, task_name, task_url
       from task_rating_integrity
      where employee_slug=$1
        and completed_at >= $2::timestamptz and completed_at < $3::timestamptz
        and verification_status='verified'
      order by task_id, changed_at desc
      limit 8`,
    [employeeSlug, start, next],
  );
  return {
    byField: new Map(result.rows.map((row) => [row.field_id, {
      average: Math.round(Number(row.average) * 10) / 10,
      ratedTasks: Number(row.rated_tasks),
    }])),
    tasks: tasks.rows,
  };
}
