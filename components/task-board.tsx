'use client';

import { useState } from 'react';

import { TaskRatingModal } from '@/components/task-rating-modal';
import type { PersonTaskGroup, TaskDetail } from '@/lib/clickup-tasks';
import { KPI_DEFINITIONS } from '@/lib/kpi-fields';
import { ratingKey, type TaskRatingMap, type TaskRatingSummary } from '@/lib/task-rating-types';

// Active work is the point of this board; a busy person can close well over a
// hundred tasks in the recent-window, which would bury it.
const CLOSED_SHOWN = 12;

function formatDate(value?: string) {
  if (!value) return null;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Dhaka',
  }).format(new Date(value));
}

function stateLabel(task: TaskDetail) {
  if (task.state === 'closed') return 'status-good';
  if (task.overdue) return 'status-risk';
  return task.state === 'open' ? 'status-neutral' : 'status-warn';
}

function ratingBadge(rating: TaskRatingSummary | undefined) {
  if (!rating) return null;
  const rated = Object.keys(rating.fields).length;
  const label = `${rated}/${KPI_DEFINITIONS.length} rated`;
  if (rating.status === 'verified') return { className: 'status-good', label };
  if (rating.status === 'invalid') return { className: 'status-risk', label: 'Rejected' };
  return { className: 'status-warn', label: `${label} · needs validation` };
}

type TaskRowProps = {
  task: TaskDetail;
  rating?: TaskRatingSummary;
  onRate: () => void;
  /** When set, the button is shown but disabled, and this explains why. */
  rateBlockedReason?: string;
};

function TaskRow({ task, rating, onRate, rateBlockedReason }: TaskRowProps) {
  const due = formatDate(task.dueDate);
  const closed = formatDate(task.closedAt);
  const location = [task.spaceName, task.folderName, task.listName].filter(Boolean).join(' / ');
  const badge = ratingBadge(rating);

  return (
    <article className={`task-row${task.overdue ? ' task-row-overdue' : ''}`}>
      <div className="task-row-main">
        <a className="task-name" href={task.url} target="_blank" rel="noreferrer">{task.name}</a>
        {location ? <p className="task-location">{location}</p> : null}
        {task.coAssignees.length ? (
          <p className="task-location">Shared with {task.coAssignees.join(', ')}</p>
        ) : null}
        {task.tags.length ? (
          <div className="task-tags">
            {task.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
          </div>
        ) : null}
      </div>

      <div className="task-row-meta">
        <span className={`tracker-status ${stateLabel(task)}`}>{task.status}</span>
        {task.priority ? <span className="task-meta-item">Priority: {task.priority}</span> : null}
        {task.state === 'closed' && closed ? (
          <span className="task-meta-item">Closed {closed}</span>
        ) : due ? (
          <span className={`task-meta-item${task.overdue ? ' task-meta-overdue' : ''}`}>
            {task.overdue ? 'Overdue — due ' : 'Due '}{due}
          </span>
        ) : (
          <span className="task-meta-item task-meta-muted">No due date</span>
        )}
        {badge ? <span className={`tracker-status ${badge.className}`}>{badge.label}</span> : null}
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
  onRate: (task: TaskDetail) => void;
  rateBlockedReason?: string;
};

function PersonTasks({ group, connected, ratings, onRate, rateBlockedReason }: PersonTasksProps) {
  const active = group.tasks.filter((task) => task.state !== 'closed');
  const closed = group.tasks.filter((task) => task.state === 'closed');
  const shownClosed = closed.slice(0, CLOSED_SHOWN);

  return (
    <section className="task-group" aria-labelledby={`tasks-${group.slug}`}>
      <div className="task-group-head">
        <div>
          <h2 id={`tasks-${group.slug}`}>{group.name}</h2>
          <p>{group.role}</p>
        </div>
        <div className="task-group-counts">
          <span className="task-count"><strong>{group.openCount}</strong> active</span>
          {group.overdueCount ? (
            <span className="task-count task-count-risk"><strong>{group.overdueCount}</strong> overdue</span>
          ) : null}
          <span className="task-count"><strong>{group.closedCount}</strong> recently closed</span>
        </div>
      </div>

      {group.tasks.length ? (
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

  // A stale selection (someone leaves the team between renders) falls back to
  // the first person rather than an empty board.
  const active = groups.some((group) => group.slug === selected) ? selected : groups[0]?.slug;
  const shown = groups.filter((group) => group.slug === active);

  const totalActive = shown.reduce((sum, group) => sum + group.openCount, 0);
  const totalOverdue = shown.reduce((sum, group) => sum + group.overdueCount, 0);

  return (
    <>
      {groups.length > 1 ? (
        <div className="task-filter" role="group" aria-label="Filter tasks by person">
          {groups.map((group) => (
            <button
              type="button"
              key={group.slug}
              className={`task-filter-chip${active === group.slug ? ' task-filter-chip-active' : ''}`}
              aria-pressed={active === group.slug}
              onClick={() => setSelected(group.slug)}
            >
              {group.name}
              <span className={`task-filter-count${group.overdueCount ? ' task-filter-count-risk' : ''}`}>
                {group.openCount}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {connected ? (
        <div className="task-summary">
          <span className="task-count"><strong>{totalActive}</strong> active</span>
          {totalOverdue ? (
            <span className="task-count task-count-risk"><strong>{totalOverdue}</strong> overdue</span>
          ) : null}
        </div>
      ) : null}

      {shown.map((group) => (
        <PersonTasks
          group={group}
          connected={connected}
          ratings={ratings}
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
