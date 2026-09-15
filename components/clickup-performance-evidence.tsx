import type { LiveClickUpEvidence } from '@/lib/clickup-performance';

type Props = {
  evidence: LiveClickUpEvidence;
};

export function ClickUpPerformanceEvidence({ evidence }: Props) {
  return (
    <section className="shell profile-sections" aria-label="Live ClickUp performance evidence">
      <section className="profile-section" id="clickup-live">
        <div className="profile-section-head">
          <div>
            <p className="eyebrow">Live ClickUp Evidence</p>
            <h2>{evidence.periodLabel} task evidence</h2>
            <p>Assigned ClickUp tasks are read automatically. Performance custom fields are averaged only when a reviewer has actually rated the task.</p>
          </div>
          <span className={`tracker-status ${evidence.connected ? 'status-good' : 'status-warn'}`}>
            {evidence.connected ? 'Connected' : 'Setup pending'}
          </span>
        </div>

        {!evidence.connected ? (
          <div className="card-data-note">
            <strong>ClickUp sync not active yet</strong>
            <span>{evidence.message ?? 'The integration is waiting for its production credential.'}</span>
          </div>
        ) : (
          <>
            <div className="career-summary-grid">
              <div className="career-state-card"><span>Assigned tasks</span><strong>{evidence.tasksReviewed}</strong><p>Tasks active in this month&apos;s evidence window.</p></div>
              <div className="career-state-card"><span>Rated tasks</span><strong>{evidence.ratedTasks}</strong><p>Tasks with at least one performance field completed.</p></div>
              <div className="career-state-card"><span>Evidence coverage</span><strong>{evidence.tasksReviewed ? `${Math.round((evidence.ratedTasks / evidence.tasksReviewed) * 100)}%` : '—'}</strong><p>Rated tasks divided by assigned tasks in the window.</p></div>
              <div className="career-state-card"><span>Sync</span><strong>Automatic</strong><p>Server refreshes ClickUp evidence every few minutes.</p></div>
            </div>

            <div className="kpi-panel" style={{ marginTop: 18 }}>
              <div className="kpi-panel-head">
                <div><span className="card-kicker">Task-based KPI evidence</span><h3>Live averages from ClickUp</h3></div>
              </div>
              <div className="kpi-table-wrap">
                <table className="kpi-score-table">
                  <thead><tr><th>KPI</th><th>Rated tasks</th><th>Live average</th></tr></thead>
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
              <span className="card-kicker">Recent tasks in evidence window</span>
              {evidence.recentTasks.length ? (
                <ul className="assessment-list">
                  {evidence.recentTasks.map((task) => (
                    <li key={task.id}><a className="card-link" href={task.url} target="_blank" rel="noreferrer">{task.name}</a> · {task.status}</li>
                  ))}
                </ul>
              ) : <p>No assigned ClickUp tasks found in this month&apos;s evidence window.</p>}
            </div>
          </>
        )}
      </section>
    </section>
  );
}
