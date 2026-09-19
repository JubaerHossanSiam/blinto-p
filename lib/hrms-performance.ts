export type HrmsSyncStatus = 'pending' | 'synced' | 'error';

export type HrmsScoreDetail = {
  score: number;
  scoreOutOf10: number;
  details: Record<string, number>;
};

export type HrmsMonthlyScores = {
  employeeId: string;
  monthKey: string;
  attendance: HrmsScoreDetail | null;
  leave: HrmsScoreDetail | null;
  syncStatus: HrmsSyncStatus;
  syncedAt: string | null;
  error?: string;
};

type HrmsApiItem = {
  employee?: { employeeId?: string };
  month?: string;
  score?: number;
  [key: string]: unknown;
};

const HRMS_BASE_URL = 'https://hrms.blinto.co/api/v1';

export const pendingHrmsScores = (employeeId = '', monthKey = ''): HrmsMonthlyScores => ({
  employeeId,
  monthKey,
  attendance: null,
  leave: null,
  syncStatus: 'pending',
  syncedAt: null,
});

export function hrmsScoresAreReady(scores: HrmsMonthlyScores) {
  return scores.syncStatus === 'synced' && scores.attendance !== null && scores.leave !== null;
}

function normalize(item: HrmsApiItem): HrmsScoreDetail | null {
  if (typeof item.score !== 'number' || item.score < 0 || item.score > 100) return null;
  const details: Record<string, number> = {};
  for (const [key, value] of Object.entries(item)) {
    if (key !== 'score' && key !== 'month' && key !== 'employee' && typeof value === 'number') details[key] = value;
  }
  return { score: item.score, scoreOutOf10: Math.round(item.score) / 10, details };
}

async function fetchScores(path: 'attendance' | 'leave', monthKey: string, apiKey: string): Promise<HrmsApiItem[]> {
  const response = await fetch(`${HRMS_BASE_URL}/${path}/scores?month=${encodeURIComponent(monthKey)}`, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`HRMS ${path} request failed (${response.status})`);
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error(`HRMS ${path} response is not an array`);
  return data as HrmsApiItem[];
}

/**
 * HRMS owns attendance and leave scoring (0–100). Blinto consumes those scores,
 * matches on employee.employeeId, and normalizes each to /10 for KPI 1.
 */
export async function getMonthlyHrmsScores(employeeId: string, monthKey: string): Promise<HrmsMonthlyScores> {
  const apiKey = process.env.HRMS_API_KEY;
  if (!apiKey) return { ...pendingHrmsScores(employeeId, monthKey), syncStatus: 'error', error: 'HRMS_API_KEY is not configured.' };

  try {
    const [attendanceItems, leaveItems] = await Promise.all([
      fetchScores('attendance', monthKey, apiKey),
      fetchScores('leave', monthKey, apiKey),
    ]);
    const attendanceItem = attendanceItems.find((item) => item.employee?.employeeId === employeeId && item.month === monthKey);
    const leaveItem = leaveItems.find((item) => item.employee?.employeeId === employeeId && item.month === monthKey);
    const attendance = attendanceItem ? normalize(attendanceItem) : null;
    const leave = leaveItem ? normalize(leaveItem) : null;
    return {
      employeeId, monthKey, attendance, leave,
      syncStatus: attendance && leave ? 'synced' : 'pending',
      syncedAt: new Date().toISOString(),
      ...(!attendance || !leave ? { error: 'HRMS monthly score is not available for this employee.' } : {}),
    };
  } catch (error) {
    return { ...pendingHrmsScores(employeeId, monthKey), syncStatus: 'error', syncedAt: new Date().toISOString(), error: error instanceof Error ? error.message : 'HRMS sync failed.' };
  }
}

export function calculateDeliveryReliabilityKpi(clickUpDeliveryOutOf10: number, scores: HrmsMonthlyScores): number | null {
  if (!hrmsScoresAreReady(scores)) return null;
  const value = (clickUpDeliveryOutOf10 * 0.6) + (scores.attendance!.scoreOutOf10 * 0.2) + (scores.leave!.scoreOutOf10 * 0.2);
  return Math.round(value * 10) / 10;
}
