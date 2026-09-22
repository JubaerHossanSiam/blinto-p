import { getPerson } from '@/lib/people';

const CLICKUP_WORKSPACE_ID = process.env.CLICKUP_WORKSPACE_ID ?? '9018782844';
const CLICKUP_API_URL = 'https://api.clickup.com/api/v2';

// Closed work stays on the board briefly so a person can see what they just
// finished, without the board filling up with a year of completed tasks.
const RECENTLY_CLOSED_DAYS = 45;
const MAX_PAGES = 25;

// Pages are fetched in concurrent windows of this size. ClickUp gives no total
// count and lies about `last_page`, so the page count is only discovered by
// hitting an empty page — but pages are independent, so a window can be issued
// in parallel and truncated at the first empty one. Kept modest to stay well
// inside ClickUp's rate limit.
const PAGE_CONCURRENCY = 5;

/** ClickUp's built-in "Task" task type. */
const DEFAULT_TASK_TYPE = '0';

// The board is a review queue, so only work actually sitting in review belongs
// on it. Matched on the status name because ClickUp reports every mid-workflow
// status as type "custom", which cannot distinguish review from in-progress.
// Note the workspace also uses "review" and "ceo review"; neither is this.
const REVIEW_STATUS = 'in review';

type ClickUpAssignee = { id?: number | string; username?: string };

type ClickUpTaskRecord = {
  id: string;
  name: string;
  /** 0 is ClickUp's built-in "Task"; anything else is a custom task type. */
  custom_item_id?: number | null;
  url: string;
  status?: { status?: string; type?: string };
  date_updated?: string | null;
  date_closed?: string | null;
  due_date?: string | null;
  priority?: { priority?: string } | null;
  list?: { name?: string } | null;
  folder?: { name?: string } | null;
  space?: { name?: string } | null;
  tags?: Array<{ name?: string }> | null;
  assignees?: ClickUpAssignee[] | null;
};

export type TaskState = 'open' | 'active' | 'closed';

export type TaskDetail = {
  id: string;
  name: string;
  url: string;
  status: string;
  state: TaskState;
  priority?: string;
  dueDate?: string;
  overdue: boolean;
  listName?: string;
  folderName?: string;
  spaceName?: string;
  tags: string[];
  updatedAt?: string;
  closedAt?: string;
  /** Only ever names the viewer is already allowed to see. */
  coAssignees: string[];
};

export type PersonTaskGroup = {
  slug: string;
  name: string;
  role: string;
  mapped: boolean;
  tasks: TaskDetail[];
  openCount: number;
  closedCount: number;
  overdueCount: number;
};

export type TaskBoard = {
  connected: boolean;
  groups: PersonTaskGroup[];
  fetchedAt: string;
  message?: string;
};

function toIso(value?: string | null) {
  if (!value) return undefined;
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return undefined;
  return new Date(timestamp).toISOString();
}

function taskState(task: ClickUpTaskRecord): TaskState {
  const type = task.status?.type;
  if (task.date_closed || type === 'closed' || type === 'done') return 'closed';
  // ClickUp reports anything that is neither the first nor the last status
  // as "custom", which is what in-progress work looks like.
  return type === 'open' ? 'open' : 'active';
}

async function fetchTeamTasks(
  assigneeIds: string[],
  extraParams: Record<string, string>,
  forceRefresh: boolean,
) {
  const token = process.env.CLICKUP_API_TOKEN;
  if (!token) return null;

  const fetchPage = async (page: number) => {
    const params = new URLSearchParams({
      page: String(page),
      subtasks: 'true',
      order_by: 'updated',
      ...extraParams,
    });
    // Only the built-in "Task" type. The workspace also uses Milestone, Bug,
    // Feature, KPI Review, Meeting Note and others, and none of those are
    // deliverables a person is rated on. ClickUp rejects a scalar here
    // ("custom_items must be an array"), so the bracketed form is required.
    params.append('custom_items[]', DEFAULT_TASK_TYPE);
    for (const id of assigneeIds) params.append('assignees[]', id);

    const response = await fetch(`${CLICKUP_API_URL}/team/${CLICKUP_WORKSPACE_ID}/task?${params.toString()}`, {
      headers: { Authorization: token },
      ...(forceRefresh ? { cache: 'no-store' as const } : { next: { revalidate: 120 } }),
    });

    if (!response.ok) {
      throw new Error(`ClickUp API returned ${response.status}`);
    }

    const payload = (await response.json()) as { tasks?: ClickUpTaskRecord[] };
    return payload.tasks ?? [];
  };

  const tasks: ClickUpTaskRecord[] = [];

  // ClickUp reports `last_page: true` on pages that are NOT the last, and
  // returns short pages (fewer than the 100 it caps at) in the middle of a
  // result set, so neither signal can end the loop. Only an empty page can.
  //
  // That still holds here — the difference is that a window of pages is
  // requested at once and then truncated at the first empty page, instead of
  // paying one full round trip per page. Pages past an empty one are empty
  // too, so anything fetched beyond it is simply discarded.
  for (let start = 0; start < MAX_PAGES; start += PAGE_CONCURRENCY) {
    const window = Array.from(
      { length: Math.min(PAGE_CONCURRENCY, MAX_PAGES - start) },
      (_, i) => start + i,
    );

    const batches = await Promise.all(window.map(fetchPage));

    const emptyAt = batches.findIndex((batch) => !batch.length);
    for (const batch of emptyAt === -1 ? batches : batches.slice(0, emptyAt)) {
      tasks.push(...batch);
    }

    if (emptyAt !== -1) break;
  }

  return tasks;
}

function emptyGroup(slug: string): PersonTaskGroup | null {
  const person = getPerson(slug);
  if (!person) return null;
  return {
    slug: person.slug,
    name: person.name,
    role: person.role,
    mapped: Boolean(person.clickupUserId),
    tasks: [],
    openCount: 0,
    closedCount: 0,
    overdueCount: 0,
  };
}

/**
 * Builds the task board for exactly the people in `visibleSlugs`.
 *
 * The caller is responsible for deciding who those people are — this function
 * never widens that set, and a task is only ever attached to a person the
 * caller already listed, so an assignee outside the set cannot leak through a
 * shared task.
 */
export async function getTaskBoard(visibleSlugs: string[], forceRefresh = false): Promise<TaskBoard> {
  const fetchedAt = new Date().toISOString();
  const groups = visibleSlugs
    .map(emptyGroup)
    .filter((group): group is PersonTaskGroup => group !== null);

  if (!groups.length) {
    return { connected: false, groups, fetchedAt, message: 'No employees are visible to this account.' };
  }

  if (!process.env.CLICKUP_API_TOKEN) {
    return {
      connected: false,
      groups,
      fetchedAt,
      message: 'ClickUp integration is configured in code and waiting for the server API token (CLICKUP_API_TOKEN).',
    };
  }

  const idToSlug = new Map<string, string>();
  for (const group of groups) {
    const person = getPerson(group.slug);
    if (person?.clickupUserId) idToSlug.set(String(person.clickupUserId), person.slug);
  }

  if (!idToSlug.size) {
    return {
      connected: false,
      groups,
      fetchedAt,
      message: 'None of the visible employees have a ClickUp user mapping.',
    };
  }

  const assigneeIds = [...idToSlug.keys()];
  const closedSince = Date.now() - RECENTLY_CLOSED_DAYS * 24 * 60 * 60 * 1000;

  try {
    const [openTasks, recentTasks] = await Promise.all([
      // Every still-open task, however old, so nothing active is hidden.
      fetchTeamTasks(assigneeIds, { include_closed: 'false' }, forceRefresh),
      // Recent activity, from which only the closed tasks are kept.
      fetchTeamTasks(assigneeIds, { include_closed: 'true', date_updated_gt: String(closedSince) }, forceRefresh),
    ]);

    const byId = new Map<string, ClickUpTaskRecord>();
    for (const task of openTasks ?? []) byId.set(task.id, task);
    for (const task of recentTasks ?? []) {
      const closedAt = Number(task.date_closed ?? 0);
      if (closedAt >= closedSince) byId.set(task.id, task);
    }

    const groupBySlug = new Map(groups.map((group) => [group.slug, group]));
    const now = Date.now();

    for (const task of byId.values()) {
      // The API is already filtered to DEFAULT_TASK_TYPE; this keeps a silently
      // dropped parameter from refilling the board with other task types.
      if (task.custom_item_id != null && String(task.custom_item_id) !== DEFAULT_TASK_TYPE) continue;

      if ((task.status?.status ?? '').trim().toLowerCase() !== REVIEW_STATUS) continue;

      const state = taskState(task);
      const dueTimestamp = Number(task.due_date ?? 0);
      const overdue = state !== 'closed' && dueTimestamp > 0 && dueTimestamp < now;

      const assigneeSlugs = (task.assignees ?? [])
        .map((assignee) => idToSlug.get(String(assignee.id)))
        .filter((slug): slug is string => Boolean(slug));

      for (const slug of new Set(assigneeSlugs)) {
        const group = groupBySlug.get(slug);
        if (!group) continue;

        group.tasks.push({
          id: task.id,
          name: task.name,
          url: task.url,
          status: task.status?.status ?? 'Unknown',
          state,
          priority: task.priority?.priority ?? undefined,
          dueDate: toIso(task.due_date),
          overdue,
          listName: task.list?.name ?? undefined,
          folderName: task.folder?.name ?? undefined,
          spaceName: task.space?.name ?? undefined,
          tags: (task.tags ?? []).map((tag) => tag.name).filter((name): name is string => Boolean(name)),
          updatedAt: toIso(task.date_updated),
          closedAt: toIso(task.date_closed),
          coAssignees: assigneeSlugs
            .filter((other) => other !== slug)
            .map((other) => getPerson(other)?.name)
            .filter((name): name is string => Boolean(name)),
        });
      }
    }

    for (const group of groups) {
      group.tasks.sort((a, b) => {
        const aClosed = a.state === 'closed';
        const bClosed = b.state === 'closed';
        // Active work first, then the most recently closed.
        if (aClosed !== bClosed) return aClosed ? 1 : -1;
        if (aClosed) return (b.closedAt ?? '').localeCompare(a.closedAt ?? '');
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '');
      });
      group.openCount = group.tasks.filter((task) => task.state !== 'closed').length;
      group.closedCount = group.tasks.filter((task) => task.state === 'closed').length;
      group.overdueCount = group.tasks.filter((task) => task.overdue).length;
    }

    return { connected: true, groups, fetchedAt };
  } catch (error) {
    return {
      connected: false,
      groups,
      fetchedAt,
      message: error instanceof Error ? error.message : 'Unable to load ClickUp tasks.',
    };
  }
}
