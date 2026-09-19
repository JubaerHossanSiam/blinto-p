export type HrmsSyncStatus = 'pending' | 'synced' | 'error';

export type HrmsFinalScore = {
  employeeId: string;
  monthKey: string;
  finalScore: number | null;
  syncStatus: HrmsSyncStatus;
  syncedAt: string | null;
};

export const pendingHrmsScore = (employeeId = '', monthKey = ''): HrmsFinalScore => ({
  employeeId,
  monthKey,
  finalScore: null,
  syncStatus: 'pending',
  syncedAt: null,
});

export function hrmsScoreIsReady(score: HrmsFinalScore) {
  return score.syncStatus === 'synced' && score.finalScore !== null;
}

/**
 * HRMS owns the calculation and Blinto consumes the final monthly score.
 *
 * The transport is intentionally left unimplemented until the HRMS team provides:
 * endpoint, auth, employee-id parameter, month parameter, final-score field/range,
 * and a sample response. This prevents us from baking an assumed API contract into
 * the official KPI system.
 */
export async function getMonthlyHrmsScore(employeeId: string, monthKey: string): Promise<HrmsFinalScore> {
  return pendingHrmsScore(employeeId, monthKey);
}
