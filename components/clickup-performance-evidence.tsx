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
    const connected = monthlyEvidence.every((item) => item.evidence.connected);
    const recentTasks = [...monthlyEvidence]
      .reverse()
      .flatMap((item) => item.evidence.recentTasks.map((task) => ({ ...task, monthKey: item.monthKey })))
      .slice(0, 12);
    return {
      connected,
      tasksReviewed,
      ratedTasks,
      coverage: tasksReviewed ? Math.round((ratedTasks / tasksReviewed) * 100) : undefined,
      recentTasks,
    };
  }, [monthlyEvidence]);

  if (!target) return null;

  const isAll = period === 'all';
  const active = selected ?? evidence;
  const connected = isAll ? allSummary.connected : active.connected;
  const tasksReviewed = isAll ? allSummary.tasksReviewed : active.tasksReviewed;
  const ratedTasks = isAll ? allSummary.ratedTasks : active.ratedTasks;
  const coverage = tasksReviewed ? Math.round((ratedTasks / tasksReviewed) * 100) : undefined;

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
          <div className="career-summary-grid" style={{ marginTop: 18 }}>
            <div className="career-state-card">
              <span>Completed tasks</span>
              <strong>{tasksReviewed}</strong>
              <p>{isAll ? 'Completed tasks across all available evidence months.' : 'Tasks completed during this month\'s evidence window.'}</p>
            </div>
            <div className="career-state-card">
              <span>Rated tasks</span>
              <strong>{ratedTasks}</strong>
              <p>{isAll ? 'Rated completed tasks across the available history.' : 'Tasks with at least one performance field completed.'}</p>
            </div>
            <div className="career-state-card">
              <span>Evidence coverage</span>
              <strong>{coverage === undefined ? '—' : `${coverage}%`}</strong>
              <p>Rated completed tasks divided by completed tasks in the selected period.</p>
            </div>
            <div className="career-state-card">
              <span>Sync</span>
              <strong>Automatic</strong>
              <p>ClickUp evidence refreshes every few minutes.</p>
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
                    <tr><th>Month</th><th>Completed</th><th>Rated</th><th>Coverage</th><th>KPI coverage</th></tr>
                  </thead>
                  <tbody>
                    {[...monthlyEvidence].reverse().map((item) => {
                      const monthCoverage = item.evidence.tasksReviewed
                        ? Math.round((item.evidence.ratedTasks / item.evidence.tasksReviewed) * 100)
                        : undefined;
                      const observedKpis = item.evidence.kpis.filter((kpi) => kpi.average !== undefined).length;
                      return (
                        <tr key={item.monthKey}>
                          <td><strong>{monthLabel(item.monthKey, item.monthKey === '2026-09')}</strong></td>
                          <td>{item.evidence.tasksReviewed}</td>
                          <td>{item.evidence.ratedTasks}</td>
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
            <span className="card-kicker">{isAll ? 'Recent completed ClickUp tasks across evidence history' : 'Recent completed ClickUp tasks in evidence window'}</span>
            {isAll ? (
              allSummary.recentTasks.length ? (
                <ul className="assessment-list">
                  {allSummary.recentTasks.map((task) => (
                    <li key={`${task.monthKey}-${task.id}`}>
                      <a className="card-link" href={task.url} target="_blank" rel="noreferrer">{task.name}</a>
                      <> · {monthLabel(task.monthKey, task.monthKey === '2026-09')}</>
                    </li>
                  ))}
                </ul>
              ) : <p>No completed ClickUp tasks were found in the selected evidence period.</p>
            ) : (
              active.recentTasks.length ? (
                <ul className="assessment-list">
                  {active.recentTasks.map((task) => (
                    <li key={task.id}>
                      <a className="card-link" href={task.url} target="_blank" rel="noreferrer">{task.name}</a> · {task.status}
                    </li>
                  ))}
                </ul>
              ) : <p>No completed ClickUp tasks were found in the selected evidence period.</p>
            )}
          </div>
        </>
      )}
    </div>,
    target,
  );
}
