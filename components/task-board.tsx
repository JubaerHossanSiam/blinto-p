'use client';

import { useMemo, useState } from 'react';

import { TaskRatingModal } from '@/components/task-rating-modal';
import type { PersonTaskGroup, TaskDetail } from '@/lib/clickup-tasks';
import { KPI_DEFINITIONS, scoreForLabel } from '@/lib/kpi-fields';
import { ratingKey, type TaskRatingMap, type TaskRatingSummary } from '@/lib/task-rating-types';

// Active work is the point of this board; a busy person can close well over a
// hundred tasks in the recent-window, which would bury it.
const CLOSED_SHOWN = 12;

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
};

function TaskRow({ task, rating, onRate, rateBlockedReason }: TaskRowProps) {
  const badge = ratingBadge(rating);

  return (
    <article className="task-row">
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
  onRate: (task: TaskDetail) => void;
  rateBlockedReason?: string;
};

function PersonTasks({ group, connected, ratings, query, onRate, rateBlockedReason }: PersonTasksProps) {
  const matching = group.tasks.filter((task) => matchesQuery(task, query));
  const active = sortTasks(matching.filter((task) => task.state !== 'closed'));
  const closed = sortTasks(matching.filter((task) => task.state === 'closed'));
  const shownClosed = closed.slice(0, CLOSED_SHOWN);

  return (
    <section className="task-group" aria-labelledby={`tasks-${group.slug}`}>
      <div className="task-group-head">
        <div>
          <h2 id={`tasks-${group.slug}`}>{group.name}</h2>
          <p>{group.role}</p>
        </div>
      </div>

      {active.length || shownClosed.length ? (
        <div className="task-list">
          {active.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              rating={ratings[ratingKey(task.id, group.slug)]}
              onRate={() => onRate(task)}
              rateBlockedReason={rateBlockedReason}
            />
          ))}
          {shownClosed.length ? <p className="task-divider">Recently closed</p> : null}
          {shownClosed.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              rating={ratings[ratingKey(task.id, group.slug)]}
              onRate={() => onRate(task)}
              rateBlockedReason={rateBlockedReason}
            />
          ))}
          {closed.length > shownClosed.length ? (
            <p className="task-divider task-divider-muted">
              + {closed.length - shownClosed.length} more closed in the last 45 days
            </p>
          ) : null}
        </div>
      ) : (
        <p className="task-empty">
          {!connected
            ? 'Tasks will appear here once the ClickUp connection is live.'
            : !group.mapped
              ? 'No ClickUp user is mapped to this employee, so their tasks cannot be matched.'
              : query
                ? `No tasks match “${query}”.`
                : 'No active or recently closed tasks assigned in ClickUp.'}
        </p>
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
  // The viewer's own group is first, so the board opens on their own tasks.
  const [selected, setSelected] = useState<string>(groups[0]?.slug ?? '');
  const [search, setSearch] = useState('');

  const query = useMemo(() => search.trim().toLowerCase(), [search]);

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
                  {group.overdueCount ? (
                    <span className="person-tab-dot" title={`${group.overdueCount} overdue`} />
                  ) : null}
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
          onRate={(task) => setRating({ task, group })}
          // The button is always present; these are the cases where pressing it
          // could only ever be rejected by the server.
          rateBlockedReason={
            !canRate
              ? 'Only managers, People Ops and Admin can rate tasks.'
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
