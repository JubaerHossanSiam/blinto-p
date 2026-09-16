import { databaseConfigured, db } from '@/lib/db';

export type HrmsSyncStatus = 'pending' | 'synced' | 'error';

export type HrmsMonthlyScore = {
  attendanceScore: number | null;
  leavePolicyScore: number | null;
  syncStatus: HrmsSyncStatus;
  syncedAt: string | null;
};

export const pendingHrmsScore: HrmsMonthlyScore = {
  attendanceScore: null,
  leavePolicyScore: null,
  syncStatus: 'pending',
  syncedAt: null,
};

export function hrmsScoreIsReady(score: HrmsMonthlyScore) {
  return score.syncStatus === 'synced'
    && score.attendanceScore !== null
    && score.leavePolicyScore !== null;
}

export async function getMonthlyHrmsScore(employeeSlug: string, monthKey: string): Promise<HrmsMonthlyScore> {
  if (!databaseConfigured) return pendingHrmsScore;

  try {
    const result = await db.query<{
      attendance_score: string | number | null;
      leave_policy_score: string | number | null;
      sync_status: HrmsSyncStatus;
      synced_at: Date | string | null;
    }>(
      `select attendance_score, leave_policy_score, sync_status, synced_at
       from hrms_monthly_scores
       where employee_slug = $1 and month_key = $2
       limit 1`,
      [employeeSlug, monthKey],
    );

    const row = result.rows[0];
    if (!row) return pendingHrmsScore;

    return {
      attendanceScore: row.attendance_score === null ? null : Number(row.attendance_score),
      leavePolicyScore: row.leave_policy_score === null ? null : Number(row.leave_policy_score),
      syncStatus: row.sync_status,
      syncedAt: row.synced_at ? new Date(row.synced_at).toISOString() : null,
    };
  } catch (error) {
    // Until migration 003 is applied, keep the UI safe and pending instead of breaking reviews.
    console.error('Unable to load HRMS monthly score', error);
    return { ...pendingHrmsScore, syncStatus: 'error' };
  }
}
