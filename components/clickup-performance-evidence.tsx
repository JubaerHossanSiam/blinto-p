'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import type { LiveClickUpEvidence } from '@/lib/clickup-performance';

type MonthlyEvidence = {
  monthKey: string;
  evidence: LiveClickUpEvidence;
};

type Props = {
  evidence: LiveClickUpEvidence;
  monthlyEvidence: MonthlyEvidence[];
  defaultMonthKey: string;
};

function monthLabel(monthKey: string, trial = false) {
  const [year, month] = monthKey.split('-').map(Number);
  const label = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' })
    .format(new Date(Date.UTC(year, month - 1, 1)));
  return trial ? `${label} · Trial` : label;
}

export function ClickUpPerformanceEvidence({ evidence, monthlyEvidence, defaultMonthKey }: Props) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [period, setPeriod] = useState(defaultMonthKey);
  const [taskFilter, setTaskFilter] = useState<'all' | 'needs-rating' | 'fully-rated' | 'partially-rated' | 'unrated'>('needs-rating');

  useEffect(() => {
    const workEvidence = document.getElementById('work-evidence');
    if (!workEvidence) return;

    const oldBanner = workEvidence.querySelector<HTMLElement>('.integration-banner');
    const oldEvidenceGrid = workEvidence.querySelector<HTMLElement>('.evidence-grid');

    const previousBannerDisplay = oldBanner?.style.display;
    const previousGridDisplay = oldEvidenceGrid?.style.display;

    if (oldBanner) oldBanner.style.display = 'none';
    if (oldEvidenceGrid) oldEvidenceGrid.style.display = 'none';

    setTarget(workEvidence);

    return () => {
      if (oldBanner) oldBanner.style.display = previousBannerDisplay ?? '';
      if (oldEvidenceGrid) oldEvidenceGrid.style.display = previousGridDisplay ?? '';
    };
  }, []);

  const selected = period === 'all'
    ? undefined
    : monthlyEvidence.find((item) => item.monthKey === period)?.evidence ?? evidence;

  const allSummary = useMemo(() => {
    const tasksReviewed = monthlyEvidence.reduce((sum, item) => sum + item.evidence.tasksReviewed, 0);
    const ratedTasks = monthlyEvidence.reduce((sum, item) => sum + item.evidence.ratedTasks, 0);
    const fullyRatedTasks = monthlyEvidence.reduce((sum, item) => sum + item.evidence.fullyRatedTasks, 0);
    const partiallyRatedTasks = monthlyEvidence.reduce((sum, item) => sum + item.evidence.partiallyRatedTasks, 0);
    const unratedTasks = monthlyEvidence.reduce((sum, item) => sum + item.evidence.unratedTasks, 0);
    const connected = monthlyEvidence.every((item) => item.evidence.connected);
    const recentTasks = [...monthlyEvidence]
      .reverse()
      .flatMap((item) => item.evidence.recentTasks.map((task) => ({ ...task, monthKey: item.monthKey })))
      .slice(0, 12);
    return {
      connected,
      tasksReviewed,
      ratedTasks,
      fullyRatedTasks,
      partiallyRatedTasks,
      unratedTasks,
      coverage: tasksReviewed ? Math.round((fullyRatedTasks / tasksReviewed) * 100) : undefined,
      recentTasks,
    };
  }, [monthlyEvidence]);

  if (!target) return null;

  const isAll = period === 'all';
  const active = selected ?? evidence;
  const connected = isAll ? allSummary.connected : active.connected;
  const tasksReviewed = isAll ? allSummary.tasksReviewed : active.tasksReviewed;
  const ratedTasks = isAll ? allSummary.ratedTasks : active.ratedTasks;
  const fullyRatedTasks = isAll ? allSummary.fullyRatedTasks : active.fullyRatedTasks;
  const partiallyRatedTasks = isAll ? allSummary.partiallyRatedTasks : active.partiallyRatedTasks;
  const unratedTasks = isAll ? allSummary.unratedTasks : active.unratedTasks;
  const pendingRatingTasks = partiallyRatedTasks + unratedTasks;
  const coverage = tasksReviewed ? Math.round((fullyRatedTasks / tasksReviewed) * 100) : undefined;

  const periodTasks = isAll
    ? allSummary.recentTasks
    : active.recentTasks.map((task) => ({ ...task, monthKey: period }));
  const filteredTasks = periodTasks.filter((task) => {
    if (taskFilter === 'all') return true;
    if (taskFilter === 'needs-rating') return task.ratingState === 'partially-rated' || task.ratingState === 'unrated';
    return task.ratingState === taskFilter;
  });

  return createPortal(
    <div aria-label="Live ClickUp performance evidence">
      <div className="evidence-toolbar">
        <div>
          <span className="card-kicker">Evidence period</span>
          <strong>{isAll ? 'All months' : monthLabel(period, period === '2026-09')}</strong>
        </div>
        <label className="evidence-period-filter">
          <span>Period</span>
          <select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Filter work evidence by period">
            <option value="all">All months</option>
            {monthlyEvidence.map((item) => (
              <option value={item.monthKey} key={item.monthKey}>
                {monthLabel(item.monthKey, item.monthKey === '2026-09')}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="integration-banner">
        <div>
          <span className="card-kicker">ClickUp integration</span>
          <strong>
            {connected
              ? (isAll ? 'Work evidence history connected' : `${active.periodLabel} live evidence connected`)
              : 'ClickUp sync needs attention'}
          </strong>
        </div>
        <span className={`tracker-status ${connected ? 'status-good' : 'status-warn'}`}>
          {connected ? 'Connected' : 'Check sync'}
        </span>
      </div>

      {!connected && !isAll ? (
        <div className="card-data-note">
          <strong>Unable to load ClickUp evidence</strong>
          <span>{active.message ?? 'The ClickUp connection could not be loaded.'}</span>
        </div>
      ) : (
        <>
          <div className="task-rating-summary-grid" style={{ marginTop: 18 }}>
            <div className="career-state-card">
              <span>Completed tasks</span>
              <strong>{tasksReviewed}</strong>
              <p>{isAll ? 'Completed tasks across all available evidence months.' : 'Tasks completed during this month\'s evidence window.'}</p>
            </div>
            <div className="career-state-card">
              <span>Fully rated</span>
              <strong>{fullyRatedTasks}</strong>
              <p>All 8 task performance fields have ratings.</p>
            </div>
            <div className="career-state-card">
              <span>Partially rated</span>
              <strong>{partiallyRatedTasks}</strong>
              <p>Some performance fields are rated, but the task is not complete yet.</p>
            </div>
            <div className="career-state-card">
              <span>Unrated</span>
              <strong>{unratedTasks}</strong>
              <p>No performance rating has been recorded on these completed tasks.</p>
            </div>
            <div className="career-state-card">
              <span>Rating coverage</span>
              <strong>{coverage === undefined ? '—' : `${coverage}%`}</strong>
              <p>Fully rated completed tasks divided by all completed tasks.</p>
            </div>
          </div>

          {isAll ? (
            <div className="kpi-panel" style={{ marginTop: 18 }}>
              <div className="kpi-panel-head">
                <div>
                  <span className="card-kicker">Evidence history</span>
                  <h3>Month-by-month coverage</h3>
                </div>
              </div>
              <div className="kpi-table-wrap">
                <table className="kpi-score-table">
                  <thead>
                    <tr><th>Month</th><th>Completed</th><th>Fully rated</th><th>Pending rating</th><th>Coverage</th><th>KPI coverage</th></tr>
                  </thead>
                  <tbody>
                    {[...monthlyEvidence].reverse().map((item) => {
                      const monthCoverage = item.evidence.tasksReviewed
                        ? Math.round((item.evidence.fullyRatedTasks / item.evidence.tasksReviewed) * 100)
                        : undefined;
                      const observedKpis = item.evidence.kpis.filter((kpi) => kpi.average !== undefined).length;
                      return (
                        <tr key={item.monthKey}>
                          <td><strong>{monthLabel(item.monthKey, item.monthKey === '2026-09')}</strong></td>
                          <td>{item.evidence.tasksReviewed}</td>
                          <td>{item.evidence.fullyRatedTasks}</td>
                          <td>{item.evidence.partiallyRatedTasks + item.evidence.unratedTasks}</td>
                          <td>{monthCoverage === undefined ? '—' : `${monthCoverage}%`}</td>
                          <td><strong>{observedKpis}/8</strong></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="card-data-note" style={{ marginTop: 14 }}>
                <strong>No blended score in All months</strong>
                <span>All months combines evidence volume and coverage only. September is a trial month and is never blended into an official KPI or career score.</span>
              </div>
            </div>
          ) : (
            <div className="kpi-panel" style={{ marginTop: 18 }}>
              <div className="kpi-panel-head">
                <div>
                  <span className="card-kicker">Task-based KPI evidence</span>
                  <h3>Live averages from ClickUp</h3>
                </div>
              </div>
              <div className="kpi-table-wrap">
                <table className="kpi-score-table">
                  <thead>
                    <tr><th>KPI</th><th>Rated tasks</th><th>Live average</th></tr>
                  </thead>
                  <tbody>
                    {active.kpis.map((kpi) => (
                      <tr key={kpi.label}>
                        <td><strong>{kpi.label}</strong></td>
                        <td>{kpi.ratedTasks}</td>
                        <td><strong>{kpi.average === undefined ? '—' : kpi.average.toFixed(1)}</strong><span>/10</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="profile-card" style={{ marginTop: 18 }}>
            <div className="task-evidence-list-head">
              <div>
                <span className="card-kicker">Completed task rating status</span>
                <h3>{pendingRatingTasks} task{pendingRatingTasks === 1 ? '' : 's'} still need rating attention</h3>
                <p>Use this list to see exactly which completed tasks are fully rated, partially rated, or still unrated.</p>
              </div>
              <div className="task-rating-filters" aria-label="Filter completed tasks by rating status">
                {[
                  ['needs-rating', `Needs rating (${pendingRatingTasks})`],
                  ['all', `All (${tasksReviewed})`],
                  ['fully-rated', `Fully rated (${fullyRatedTasks})`],
                  ['partially-rated', `Partial (${partiallyRatedTasks})`],
                  ['unrated', `Unrated (${unratedTasks})`],
                ].map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    className={`task-rating-filter ${taskFilter === value ? 'task-rating-filter-active' : ''}`}
                    onClick={() => setTaskFilter(value as typeof taskFilter)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="task-evidence-table-wrap">
              <table className="task-evidence-table">
                <thead>
                  <tr><th>Task</th><th>Completed</th><th>Rating coverage</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {filteredTasks.length ? filteredTasks.map((task) => {
                    const ratingLabel = task.ratingState === 'fully-rated' || task.ratingState === 'verified'
                      ? 'Fully rated'
                      : task.ratingState === 'partially-rated'
                        ? 'Partially rated'
                        : 'Unrated';
                    const tone = task.ratingState === 'fully-rated' || task.ratingState === 'verified'
                      ? 'status-good'
                      : task.ratingState === 'partially-rated'
                        ? 'status-warn'
                        : 'status-risk';
                    const completedLabel = task.completedAt
                      ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Dhaka' }).format(new Date(task.completedAt))
                      : ('monthKey' in task ? monthLabel(task.monthKey, task.monthKey === '2026-09') : '—');
                    return (
                      <tr key={`${task.monthKey}-${task.id}`}>
                        <td><a className="card-link" href={task.url} target="_blank" rel="noreferrer">{task.name}</a></td>
                        <td>{completedLabel}</td>
                        <td><strong>{task.ratedFields}/{task.totalFields}</strong> fields</td>
                        <td><span className={`tracker-status ${tone}`}>{ratingLabel}</span></td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={4}>No completed tasks match this rating filter.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>,
    target,
  );
}
