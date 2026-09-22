'use client';

import { useMemo, useState } from 'react';

import {
  DateRangePicker, dayKey, monthRange, rangeLabel, todayKey, type DateRange,
} from '@/components/date-range-picker';
import { TaskRatingModal } from '@/components/task-rating-modal';
import type { PersonTaskGroup, TaskDetail } from '@/lib/clickup-tasks';
import { KPI_DEFINITIONS, scoreForLabel } from '@/lib/kpi-fields';
import { ratingKey, type TaskRatingMap, type TaskRatingSummary } from '@/lib/task-rating-types';

// Work still needing a rating is the point of this board, so finished ratings
// are collapsed past this many rather than pushing the queue off the screen.
const COMPLETED_SHOWN = 12;

/** ClickUp's own completion, not ours: `complete` resolves to a closed state. */
function isCompleted(task: TaskDetail) {
  return task.state === 'closed';
}

/** The date the row is ordered by: due date for live work, close date once done. */
function taskDate(task: TaskDetail) {
  return task.dueDate ?? task.closedAt ?? task.updatedAt;
}

/** Newest first, always — the board no longer offers a choice. */
function sortTasks(tasks: TaskDetail[]) {
  return [...tasks].sort((a, b) => {
    const left = taskDate(a);
    const right = taskDate(b);
    // Undated work sinks to the bottom rather than floating above everything.
    if (!left && !right) return 0;
    if (!left) return 1;
    if (!right) return -1;
    return right.localeCompare(left);
  });
}

function matchesQuery(task: TaskDetail, query: string) {
  if (!query) return true;
  const haystack = [task.name, task.spaceName, task.folderName, task.listName, ...task.tags]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  // Every word has to appear somewhere, so "nifty layout" narrows rather than widens.
  return query.split(/\s+/).every((word) => haystack.includes(word));
}

/**
 * The mean score of the fields rated so far, out of 10. Fields are stored as
 * the label the rater picked, so each one has to be converted back through its
 * own option list; a label the field no longer offers scores nothing and is
 * left out rather than counted as zero.
 */
function averageScore(rating: TaskRatingSummary) {
  const scores = Object.entries(rating.fields)
    .map(([fieldId, label]) => scoreForLabel(fieldId, label))
    .filter((score): score is number => typeof score === 'number');
  if (!scores.length) return null;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

// The bands follow the guide's 1-5 scale doubled: 5 and 4 are green, 3 reads as
// solid, 2 warns, 1 is a problem.
function scoreBand(average: number) {
  if (average >= 8) return 'task-rated-good';
  if (average >= 6) return 'task-rated-solid';
  if (average >= 4) return 'task-rated-warn';
  return 'task-rated-risk';
}

/**
 * Always rendered, so an unrated task reads as 0/8 rather than as a row with
 * nothing on it — the count is the only status the row carries now. The colour
 * comes from the scores behind that count, not from the count itself.
 */
function ratingBadge(rating: TaskRatingSummary | undefined) {
  const total = KPI_DEFINITIONS.length;
  if (!rating) return { className: 'task-rated-empty', label: `0/${total} rated`, title: undefined };
  if (rating.status === 'invalid') {
    return { className: 'task-rated-risk', label: 'Rejected', title: rating.reason || undefined };
  }

  const rated = Object.keys(rating.fields).length;
  const label = `${rated}/${total} rated`;
  const average = averageScore(rating);
  if (average === null) return { className: 'task-rated-empty', label, title: undefined };

  return {
    className: scoreBand(average),
    label,
    title: `Average ${average.toFixed(1)}/10 across ${rated} rated ${rated === 1 ? 'KPI' : 'KPIs'}`,
  };
}

type TaskRowProps = {
  task: TaskDetail;
  rating?: TaskRatingSummary;
  onRate: () => void;
  /** When set, the button is shown but disabled, and this explains why. */
  rateBlockedReason?: string;
  /** Rendered under the Completed heading, so it reads as settled. */
  completed?: boolean;
};

function TaskRow({ task, rating, onRate, rateBlockedReason, completed }: TaskRowProps) {
  const badge = ratingBadge(rating);

  return (
    <article className={`task-row${completed ? ' task-row-done' : ''}`}>
      <div className="task-row-main">
        <h3 className="task-name-head">
          <a className="task-name" href={task.url} target="_blank" rel="noreferrer">{task.name}</a>
        </h3>
        {task.tags.length ? (
          <div className="task-tags">
            {task.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
          </div>
        ) : null}
      </div>

      <div className="task-row-meta">
        <span className={`task-rated ${badge.className}`} title={badge.title}>{badge.label}</span>
        <button
          className="button button-small task-rate-button"
          type="button"
          onClick={onRate}
          disabled={Boolean(rateBlockedReason)}
          title={rateBlockedReason}
        >
          {rating ? 'Edit rating' : 'Rating'}
        </button>
      </div>
    </article>
  );
}

type PersonTasksProps = {
  group: PersonTaskGroup;
  connected: boolean;
  ratings: TaskRatingMap;
  query: string;
  /** null means every completed task, whenever it closed. */
  range: DateRange | null;
  onRangeChange: (next: DateRange | null) => void;
  /** Days holding completed work, dotted in the calendar. */
  completedDays: Set<string>;
  onRate: (task: TaskDetail) => void;
  rateBlockedReason?: string;
};

function PersonTasks({
  group, connected, ratings, query, range, onRangeChange, completedDays, onRate, rateBlockedReason,
}: PersonTasksProps) {
  const matching = group.tasks.filter((task) => matchesQuery(task, query));
  // Split on the ClickUp status, not on how far the rating got: a task moves
  // to Completed when the team finishes the work, whether or not it has been
  // rated — an unrated completed task is exactly what a reviewer needs to see.
  const pending = sortTasks(matching.filter((task) => !isCompleted(task)));
  // The range only narrows completed work; a task still in review has no
  // completion date to sit on the calendar.
  const completed = sortTasks(
    matching.filter((task) => {
      if (!isCompleted(task)) return false;
      if (!range) return true;
      if (!task.closedAt) return false;
      const day = dayKey(task.closedAt);
      return day >= range.from && day <= range.to;
    }),
  );
  const shownCompleted = completed.slice(0, COMPLETED_SHOWN);

  return (
    <section className="task-group" aria-labelledby={`tasks-${group.slug}`}>
      <div className="task-group-head">
        <div>
          <h2 id={`tasks-${group.slug}`}>{group.name}</h2>
          <p>{group.role}</p>
        </div>
      </div>

      {/* Only a broken connection or an unmapped person hides the whole list.
          An empty review queue must not take the Completed section with it —
          that is where the date picker lives, and with it gone there was no
          way to look at what the person had already finished. */}
      {!connected || !group.mapped ? (
        <p className="task-empty">
          {!connected
            ? 'Tasks will appear here once the ClickUp connection is live.'
            : 'No ClickUp user is mapped to this employee, so their tasks cannot be matched.'}
        </p>
      ) : (
        <div className="task-list">
          {pending.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              rating={ratings[ratingKey(task.id, group.slug)]}
              onRate={() => onRate(task)}
              rateBlockedReason={rateBlockedReason}
            />
          ))}

          {!pending.length ? (
            <p className="task-empty task-empty-inline">
              {query
                ? `No tasks in review match “${query}”.`
                : 'No tasks are in review for this person right now.'}
            </p>
          ) : null}

          <div className="task-completed-head">
            <p className="task-divider task-divider-done">
              Completed<span className="task-divider-count">{completed.length}</span>
            </p>
            <DateRangePicker value={range} onChange={onRangeChange} markers={completedDays} />
          </div>
          {!completed.length ? (
            <p className="task-empty task-empty-inline">
              {query
                ? `No completed tasks match “${query}” in ${rangeLabel(range)}.`
                : `Nothing was completed in ${rangeLabel(range)}.`}
            </p>
          ) : null}
          {shownCompleted.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              rating={ratings[ratingKey(task.id, group.slug)]}
              onRate={() => onRate(task)}
              rateBlockedReason={rateBlockedReason}
              completed
            />
          ))}
          {completed.length > shownCompleted.length ? (
            <p className="task-divider task-divider-muted">
              + {completed.length - shownCompleted.length} more completed
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}

type TaskBoardProps = {
  groups: PersonTaskGroup[];
  connected: boolean;
  ratings: TaskRatingMap;
  /** The viewer's own employee slug, which they may never rate. */
  viewerSlug: string | null;
  /** Whether this role may rate at all. */
  canRate: boolean;
};

type RatingTarget = { task: TaskDetail; group: PersonTaskGroup };

export function TaskBoard({ groups, connected, ratings, viewerSlug, canRate }: TaskBoardProps) {
  const [rating, setRating] = useState<RatingTarget | null>(null);
  // Groups arrive ordered by name; the board opens on the first of them.
  const [selected, setSelected] = useState<string>(groups[0]?.slug ?? '');
  const [search, setSearch] = useState('');
  const [range, setRange] = useState<DateRange | null>(() => monthRange(todayKey()));

  const query = useMemo(() => search.trim().toLowerCase(), [search]);

  // Built from every group, not just the open tab, so the calendar's dots do
  // not shift around as you switch between people.
  const completedDays = useMemo(() => {
    const days = new Set<string>();
    for (const group of groups) {
      for (const task of group.tasks) {
        if (isCompleted(task) && task.closedAt) days.add(dayKey(task.closedAt));
      }
    }
    return days;
  }, [groups]);

  // A stale selection (someone leaves the team between renders) falls back to
  // the first person rather than an empty board.
  const active = groups.some((group) => group.slug === selected) ? selected : groups[0]?.slug;
  const shown = groups.filter((group) => group.slug === active);

  return (
    <>
      {groups.length > 1 ? (
        <ul className="person-tabs" aria-label="Filter tasks by person">
          {groups.map((group) => {
            const current = active === group.slug;
            return (
              <li key={group.slug}>
                <button
                  type="button"
                  className={`person-tab${current ? ' person-tab-active' : ''}`}
                  aria-current={current ? 'true' : undefined}
                  onClick={() => setSelected(group.slug)}
                >
                  <span className="person-tab-name">{group.name}</span>
                  <span className="person-tab-count">{group.openCount}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className="task-controls">
        <div className="task-search">
          <svg className="task-search-icon" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            className="task-search-input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks, lists or tags"
            aria-label="Search tasks"
          />
        </div>
      </div>

      {shown.map((group) => (
        <PersonTasks
          group={group}
          connected={connected}
          ratings={ratings}
          query={query}
          range={range}
          onRangeChange={setRange}
          completedDays={completedDays}
          onRate={(task) => setRating({ task, group })}
          // The button is always present; these are the cases where pressing it
          // could only ever be rejected by the server.
          rateBlockedReason={
            !canRate
              ? 'Only managers, the delivery reviewer, People Ops and Admin can rate tasks.'
              : group.slug === viewerSlug
                ? 'Self-rating is not valid performance evidence.'
                : undefined
          }
          key={group.slug}
        />
      ))}

      {rating ? (
        <TaskRatingModal
          taskId={rating.task.id}
          taskName={rating.task.name}
          employeeSlug={rating.group.slug}
          employeeName={rating.group.name}
          existing={ratings[ratingKey(rating.task.id, rating.group.slug)]}
          onClose={() => setRating(null)}
        />
      ) : null}
    </>
  );
}
