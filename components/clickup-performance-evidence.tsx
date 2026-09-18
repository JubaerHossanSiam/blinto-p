'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import type { LiveClickUpEvidence } from '@/lib/clickup-performance';

type Props = {
  evidence: LiveClickUpEvidence;
};

export function ClickUpPerformanceEvidence({ evidence }: Props) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

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

  if (!target) return null;

  return createPortal(
    <div aria-label="Live ClickUp performance evidence">
      <div className="integration-banner">
        <div>
          <span className="card-kicker">ClickUp integration</span>
          <strong>{evidence.connected ? `${evidence.periodLabel} live evidence connected` : 'ClickUp sync needs attention'}</strong>
        </div>
        <span className={`tracker-status ${evidence.connected ? 'status-good' : 'status-warn'}`}>
          {evidence.connected ? 'Connected' : 'Check sync'}
        </span>
      </div>

      {!evidence.connected ? (
        <div className="card-data-note">
          <strong>Unable to load ClickUp evidence</strong>
          <span>{evidence.message ?? 'The ClickUp connection could not be loaded.'}</span>
        </div>
      ) : (
        <>
          <div className="career-summary-grid" style={{ marginTop: 18 }}>
            <div className="career-state-card">
              <span>Completed tasks</span>
              <strong>{evidence.tasksReviewed}</strong>
              <p>Tasks completed during this month&apos;s evidence window.</p>
            </div>
            <div className="career-state-card">
              <span>Rated tasks</span>
              <strong>{evidence.ratedTasks}</strong>
              <p>Tasks with at least one performance field completed.</p>
            </div>
            <div className="career-state-card">
              <span>Evidence coverage</span>
              <strong>{evidence.tasksReviewed ? `${Math.round((evidence.ratedTasks / evidence.tasksReviewed) * 100)}%` : '—'}</strong>
              <p>Rated completed tasks divided by completed tasks in the window.</p>
            </div>
            <div className="career-state-card">
              <span>Sync</span>
              <strong>Automatic</strong>
              <p>ClickUp evidence refreshes every few minutes.</p>
            </div>
          </div>

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
                  {evidence.kpis.map((kpi) => (
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

          <div className="profile-card" style={{ marginTop: 18 }}>
            <span className="card-kicker">Recent completed ClickUp tasks in evidence window</span>
            {evidence.recentTasks.length ? (
              <ul className="assessment-list">
                {evidence.recentTasks.map((task) => (
                  <li key={task.id}>
                    <a className="card-link" href={task.url} target="_blank" rel="noreferrer">{task.name}</a> · {task.status}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No completed ClickUp tasks were found in this month&apos;s evidence window.</p>
            )}
          </div>
        </>
      )}
    </div>,
    target,
  );
}
