import { CLICKUP_FIELD_IDS } from '@/lib/kpi-fields';
import type { PersonProfile } from '@/lib/people';
import { getVerifiedTaskKpiEvidence } from '@/lib/rating-integrity';

export { CLICKUP_FIELD_IDS } from '@/lib/kpi-fields';

export type LiveClickUpKpi = {
  label: string;
  average?: number;
  ratedTasks: number;
};

export type LiveClickUpTaskEvidence = {
  id: string;
  name: string;
  url: string;
  status: string;
  completedAt?: string;
  ratedFields: number;
  totalFields: number;
  ratingState: 'fully-rated' | 'partially-rated' | 'unrated' | 'verified';
};

export type LiveClickUpEvidence = {
  connected: boolean;
  periodLabel: string;
  tasksReviewed: number;
  ratedTasks: number;
  fullyRatedTasks: number;
  partiallyRatedTasks: number;
  unratedTasks: number;
  score?: number;
  evidenceComplete: boolean;
  missingKpis: string[];
  kpis: LiveClickUpKpi[];
  recentTasks: LiveClickUpTaskEvidence[];
  message?: string;
};

function evidenceWindow(monthKey?: string) {
  if (monthKey) {
    const [year, month] = monthKey.split('-').map(Number);
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    const startDay = monthKey === '2026-09' ? 18 : 1;
    const start = Date.parse(`${year}-${String(month).padStart(2, '0')}-${String(startDay).padStart(2, '0')}T00:00:00+06:00`);
    const end = Date.parse(`${nextYear}-${String(nextMonth).padStart(2, '0')}-01T00:00:00+06:00`);
    const date = new Date(start);
    const label = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' }).format(date);
    return { start, end, label: monthKey === '2026-09' ? `${label} trial · Sep 18–30` : label };
  }

  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', timeZone: 'Asia/Dhaka',
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  return evidenceWindow(`${year}-${String(month).padStart(2, '0')}`);
}

export async function getLiveClickUpEvidence(person: PersonProfile, monthKey?: string, forceRefresh = false): Promise<LiveClickUpEvidence> {
  const { label } = evidenceWindow(monthKey);

  if (!person.clickupUserId) {
    return { connected: false, periodLabel: label, tasksReviewed: 0, ratedTasks: 0, fullyRatedTasks: 0, partiallyRatedTasks: 0, unratedTasks: 0, evidenceComplete: false, missingKpis: [], kpis: [], recentTasks: [], message: 'No ClickUp user mapping for this employee.' };
  }

  const definitions = [
    ['Delivery & Reliability', CLICKUP_FIELD_IDS.deliveryStatus],
    ['Work Quality', CLICKUP_FIELD_IDS.deliveryQuality],
    ['Ownership', CLICKUP_FIELD_IDS.ownership],
    ['Communication', CLICKUP_FIELD_IDS.communication],
    ['Problem Solving', CLICKUP_FIELD_IDS.problemSolving],
    ['Collaboration', CLICKUP_FIELD_IDS.collaboration],
    ['Proactiveness', CLICKUP_FIELD_IDS.proactiveness],
    ['Business / Client Impact', CLICKUP_FIELD_IDS.businessImpact],
  ] as const;

  // Every month reads authority-verified evidence from Blinto's database,
  // which holds both webhook-audited ClickUp ratings and ratings entered in
  // the portal. Falling back to raw ClickUp fields would hide portal ratings.
  const effectiveMonth = monthKey ?? new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', timeZone: 'Asia/Dhaka',
  }).format(new Date()).slice(0, 7);

  {
    try {
      const verified = await getVerifiedTaskKpiEvidence(person.slug, effectiveMonth);
      if (verified) {
        const kpis = definitions.map(([kpiLabel, fieldId]) => ({
          label: kpiLabel,
          average: verified.byField.get(fieldId)?.average,
          ratedTasks: verified.byField.get(fieldId)?.ratedTasks ?? 0,
        }));
        const liveAverages = kpis.map((kpi) => kpi.average).filter((value): value is number => value !== undefined);
        const missingKpis = kpis.filter((kpi) => kpi.average === undefined).map((kpi) => kpi.label);
        const evidenceComplete = missingKpis.length === 0;
        const score = evidenceComplete ? Math.round(liveAverages.reduce((sum, value) => sum + value, 0) * 10) / 10 : undefined;
        const ratedTasks = new Set(verified.tasks.map((task) => task.task_id)).size;
        return {
          connected: true, periodLabel: label, tasksReviewed: ratedTasks, ratedTasks,
          fullyRatedTasks: ratedTasks, partiallyRatedTasks: 0, unratedTasks: 0,
          score, evidenceComplete, missingKpis, kpis,
          recentTasks: verified.tasks.map((task) => ({
            id: task.task_id, name: task.task_name, url: task.task_url, status: 'Verified',
            ratedFields: 8, totalFields: 8, ratingState: 'verified' as const,
          })),
          message: !ratedTasks ? 'No verified task-rating evidence has been recorded for this official month yet.' : !evidenceComplete ? `Insufficient evidence: ${missingKpis.length} of 8 KPI areas still have no verified observation.` : undefined,
        };
      }

      return {
        connected: true,
        periodLabel: label,
        tasksReviewed: 0,
        ratedTasks: 0,
        fullyRatedTasks: 0,
        partiallyRatedTasks: 0,
        unratedTasks: 0,
        evidenceComplete: false,
        missingKpis: definitions.map(([kpiLabel]) => kpiLabel),
        kpis: definitions.map(([kpiLabel]) => ({ label: kpiLabel, ratedTasks: 0 })),
        recentTasks: [],
        message: 'No verified task-rating evidence has been recorded for this official month yet.',
      };
    } catch (error) {
      return {
        connected: false, periodLabel: label, tasksReviewed: 0, ratedTasks: 0, fullyRatedTasks: 0, partiallyRatedTasks: 0, unratedTasks: 0, evidenceComplete: false, missingKpis: [], kpis: [], recentTasks: [],
        message: error instanceof Error ? error.message : 'Unable to load verified rating evidence.',
      };
    }
  }
}
