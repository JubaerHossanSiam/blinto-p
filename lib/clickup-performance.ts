import type { PersonProfile } from '@/lib/people';

const CLICKUP_WORKSPACE_ID = process.env.CLICKUP_WORKSPACE_ID ?? '9018782844';
const CLICKUP_API_URL = 'https://api.clickup.com/api/v2';

export const CLICKUP_FIELD_IDS = {
  deliveryStatus: 'bf3575c2-fe31-4a9c-8b30-23db06b49577',
  deliveryQuality: '8c37a189-6859-4b8a-9786-6d70a7a63567',
  ownership: 'b6cf5e86-fa91-4efe-bd14-c92cb3faea9c',
  communication: '8b6f266d-f156-414d-897f-338db20098ea',
  problemSolving: 'b7c4e2ca-1e92-4751-a8ac-55dd68dc2a8d',
  collaboration: '917ab086-50f3-462d-923b-5b438c884487',
  proactiveness: '2ae1ebcf-ce8e-4659-9736-25fbd4efd045',
  businessImpact: '4c25dd82-4e96-476b-b297-caa38933af60',
} as const;

type ClickUpOption = { id: string; name: string };
type ClickUpCustomField = {
  id: string;
  name: string;
  value?: string | number | null;
  type_config?: { options?: ClickUpOption[] };
};

type ClickUpTask = {
  id: string;
  name: string;
  url: string;
  status?: { status?: string };
  date_updated?: string;
  date_closed?: string | null;
  due_date?: string | null;
  custom_fields?: ClickUpCustomField[];
};

export type LiveClickUpKpi = {
  label: string;
  average?: number;
  ratedTasks: number;
};

export type LiveClickUpEvidence = {
  connected: boolean;
  periodLabel: string;
  tasksReviewed: number;
  ratedTasks: number;
  score?: number;
  kpis: LiveClickUpKpi[];
  recentTasks: Array<{ id: string; name: string; url: string; status: string }>;
  message?: string;
};

const standardRatings: Record<string, number> = {
  Exceptional: 10,
  Strong: 8,
  Effective: 6,
  'Needs Improvement': 4,
  'Significant Improvement Needed': 2,
  'Exceptional Impact': 10,
  'Strong Impact': 8,
  'Expected Impact': 6,
  'Limited Impact': 4,
  'No Meaningful Impact': 2,
  'On Time': 10,
  'Minor Delay': 7,
  Late: 4,
};

function optionName(field: ClickUpCustomField | undefined) {
  if (!field || field.value === undefined || field.value === null) return undefined;
  const option = field.type_config?.options?.find((item) => item.id === field.value);
  return option?.name;
}

function scoreField(task: ClickUpTask, fieldId: string) {
  const field = task.custom_fields?.find((item) => item.id === fieldId);
  const name = optionName(field);
  return name ? standardRatings[name] : undefined;
}

function average(values: number[]) {
  if (!values.length) return undefined;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function evidenceWindow(monthKey?: string) {
  if (monthKey === '2026-09') {
    return {
      start: Date.parse('2026-09-18T00:00:00+06:00'),
      end: Date.parse('2026-10-01T00:00:00+06:00'),
      label: 'September 18–30, 2026 trial',
    };
  }

  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    timeZone: 'Asia/Dhaka',
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const start = Date.parse(`${year}-${String(month).padStart(2, '0')}-01T00:00:00+06:00`);
  const end = Date.parse(`${nextYear}-${String(nextMonth).padStart(2, '0')}-01T00:00:00+06:00`);
  const label = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' }).format(now);
  return { start, end, label };
}

function isCompletedInWindow(task: ClickUpTask, start: number, end: number) {
  // Performance evidence is earned when work is completed, not merely
  // assigned, updated, due, or rated while still in progress.
  if (!task.date_closed) return false;
  const closedAt = Number(task.date_closed);
  return closedAt >= start && closedAt < end;
}

async function fetchAssignedTasks(userId: string, start: number) {
  const token = process.env.CLICKUP_API_TOKEN;
  if (!token) return null;

  const tasks: ClickUpTask[] = [];
  for (let page = 0; page < 10; page += 1) {
    const params = new URLSearchParams({
      page: String(page),
      include_closed: 'true',
      subtasks: 'true',
      date_updated_gt: String(start),
    });
    params.append('assignees[]', userId);

    const response = await fetch(`${CLICKUP_API_URL}/team/${CLICKUP_WORKSPACE_ID}/task?${params.toString()}`, {
      headers: { Authorization: token },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`ClickUp API returned ${response.status}`);
    }

    const payload = (await response.json()) as { tasks?: ClickUpTask[]; last_page?: boolean };
    tasks.push(...(payload.tasks ?? []));
    if (payload.last_page || (payload.tasks?.length ?? 0) < 100) break;
  }

  return tasks;
}

export async function getLiveClickUpEvidence(person: PersonProfile, monthKey?: string): Promise<LiveClickUpEvidence> {
  const { start, end, label } = evidenceWindow(monthKey);

  if (!person.clickupUserId) {
    return { connected: false, periodLabel: label, tasksReviewed: 0, ratedTasks: 0, kpis: [], recentTasks: [], message: 'No ClickUp user mapping for this employee.' };
  }

  if (!process.env.CLICKUP_API_TOKEN) {
    return { connected: false, periodLabel: label, tasksReviewed: 0, ratedTasks: 0, kpis: [], recentTasks: [], message: 'ClickUp integration is configured in code and waiting for the server API token.' };
  }

  try {
    const assigned = (await fetchAssignedTasks(person.clickupUserId, start)) ?? [];
    const tasks = assigned.filter((task) => isCompletedInWindow(task, start, end));

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

    const kpis = definitions.map(([label, fieldId]) => {
      const values = tasks.map((task) => scoreField(task, fieldId)).filter((value): value is number => value !== undefined);
      return { label, average: average(values), ratedTasks: values.length };
    });

    const liveAverages = kpis.map((kpi) => kpi.average).filter((value): value is number => value !== undefined);
    const score = liveAverages.length
      ? Math.round(liveAverages.reduce((sum, value) => sum + value, 0) * 10) / 10
      : undefined;

    const ratedTaskIds = new Set<string>();
    for (const task of tasks) {
      if (definitions.some(([, fieldId]) => scoreField(task, fieldId) !== undefined)) ratedTaskIds.add(task.id);
    }

    return {
      connected: true,
      periodLabel: label,
      tasksReviewed: tasks.length,
      ratedTasks: ratedTaskIds.size,
      score,
      kpis,
      recentTasks: tasks.slice(0, 8).map((task) => ({
        id: task.id,
        name: task.name,
        url: task.url,
        status: task.status?.status ?? 'Unknown',
      })),
    };
  } catch (error) {
    return {
      connected: false,
      periodLabel: label,
      tasksReviewed: 0,
      ratedTasks: 0,
      kpis: [],
      recentTasks: [],
      message: error instanceof Error ? error.message : 'Unable to load ClickUp evidence.',
    };
  }
}
