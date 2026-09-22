import { db, databaseConfigured } from '@/lib/db';

export type ManagerMonthlyReview = {
  growthScore: number | null;
  roleExcellenceScore: number | null;
  wentWell: string;
  needsImprovement: string;
  nextPriorities: string;
  supportNeeded: string;
  managerSummary: string;
  status: 'draft' | 'submitted' | 'finalized' | 'locked';
  reviewedByEmail: string | null;
  updatedAt: string | null;
  submittedAt: string | null;
  finalizedAt: string | null;
  lockedAt: string | null;
};

export const emptyManagerMonthlyReview: ManagerMonthlyReview = {
  growthScore: null, roleExcellenceScore: null, wentWell: '', needsImprovement: '',
  nextPriorities: '', supportNeeded: '', managerSummary: '', status: 'draft',
  reviewedByEmail: null, updatedAt: null, submittedAt: null, finalizedAt: null, lockedAt: null,
};

const REVIEW_COLUMNS = `growth_score, role_excellence_score, went_well, needs_improvement,
    next_priorities, support_needed, manager_summary, status, reviewed_by_email, updated_at, submitted_at, finalized_at, locked_at`;

function toManagerMonthlyReview(row: Record<string, unknown> | undefined): ManagerMonthlyReview {
  if (!row) return emptyManagerMonthlyReview;
  const asIso = (value: unknown) =>
    value ? ((value as Date)?.toISOString?.() ?? String(value)) : null;
  return {
    growthScore: row.growth_score === null ? null : Number(row.growth_score),
    roleExcellenceScore: row.role_excellence_score === null ? null : Number(row.role_excellence_score),
    wentWell: row.went_well as string, needsImprovement: row.needs_improvement as string,
    nextPriorities: row.next_priorities as string,
    supportNeeded: row.support_needed as string, managerSummary: row.manager_summary as string,
    status: row.status as ManagerMonthlyReview['status'],
    reviewedByEmail: row.reviewed_by_email as string | null,
    updatedAt: (row.updated_at as Date)?.toISOString?.() ?? String(row.updated_at),
    submittedAt: asIso(row.submitted_at),
    finalizedAt: asIso(row.finalized_at),
    lockedAt: asIso(row.locked_at),
  };
}

export async function getManagerMonthlyReview(employeeSlug: string, monthKey: string): Promise<ManagerMonthlyReview> {
  if (!databaseConfigured) return emptyManagerMonthlyReview;
  const result = await db.query(`select ${REVIEW_COLUMNS}
    from manager_monthly_reviews where employee_slug=$1 and month_key=$2 limit 1`, [employeeSlug, monthKey]);
  return toManagerMonthlyReview(result.rows[0]);
}

/**
 * Batched form of `getManagerMonthlyReview`.
 *
 * The portal dashboard needs one review per visible employee. Asking for them
 * one at a time was a round trip each — against a remote database and a pool
 * capped at 5 connections, that serialised into several waves. One `any()`
 * query returns the lot. Slugs with no row fall back to the empty review, so
 * the result has an entry for every slug asked for.
 */
export async function getManagerMonthlyReviews(
  employeeSlugs: string[],
  monthKey: string,
): Promise<Map<string, ManagerMonthlyReview>> {
  const reviews = new Map<string, ManagerMonthlyReview>(
    employeeSlugs.map((slug) => [slug, emptyManagerMonthlyReview]),
  );
  if (!databaseConfigured || !employeeSlugs.length) return reviews;

  const result = await db.query(`select employee_slug, ${REVIEW_COLUMNS}
    from manager_monthly_reviews where employee_slug = any($1::text[]) and month_key=$2`,
    [employeeSlugs, monthKey]);

  for (const row of result.rows) {
    reviews.set(row.employee_slug, toManagerMonthlyReview(row));
  }
  return reviews;
}
