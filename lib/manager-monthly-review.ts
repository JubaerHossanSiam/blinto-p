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

export async function getManagerMonthlyReview(employeeSlug: string, monthKey: string): Promise<ManagerMonthlyReview> {
  if (!databaseConfigured) return emptyManagerMonthlyReview;
  const result = await db.query(`select growth_score, role_excellence_score, went_well, needs_improvement,
    next_priorities, support_needed, manager_summary, status, reviewed_by_email, updated_at, submitted_at, finalized_at, locked_at
    from manager_monthly_reviews where employee_slug=$1 and month_key=$2 limit 1`, [employeeSlug, monthKey]);
  const row = result.rows[0];
  if (!row) return emptyManagerMonthlyReview;
  return {
    growthScore: row.growth_score === null ? null : Number(row.growth_score),
    roleExcellenceScore: row.role_excellence_score === null ? null : Number(row.role_excellence_score),
    wentWell: row.went_well, needsImprovement: row.needs_improvement, nextPriorities: row.next_priorities,
    supportNeeded: row.support_needed, managerSummary: row.manager_summary, status: row.status,
    reviewedByEmail: row.reviewed_by_email, updatedAt: row.updated_at?.toISOString?.() ?? String(row.updated_at),
    submittedAt: row.submitted_at ? (row.submitted_at?.toISOString?.() ?? String(row.submitted_at)) : null,
    finalizedAt: row.finalized_at ? (row.finalized_at?.toISOString?.() ?? String(row.finalized_at)) : null,
    lockedAt: row.locked_at ? (row.locked_at?.toISOString?.() ?? String(row.locked_at)) : null,
  };
}
