import Link from 'next/link';

import type { LiveClickUpEvidence } from '@/lib/clickup-performance';
import { getPerformanceRecord, type KpiName } from '@/lib/performance-records';

const kpis: KpiName[] = [
  'Delivery & Reliability',
  'Work Quality',
  'Ownership',
  'Communication',
  'Problem Solving',
  'Collaboration',
  'Proactiveness',
  'Business / Client Impact',
  'Growth & Development',
  'Role Excellence',
];

type Props = {
  employeeName: string;
  employeeSlug: string;
  clickUpEvidence: LiveClickUpEvidence;
};

export function SeptemberTrialReview({ employeeName, employeeSlug, clickUpEvidence }: Props) {
  const record = getPerformanceRecord(employeeSlug);
  const review = record.reviews.find((item) => item.month === 'September');
  const liveKpis = new Map(clickUpEvidence.kpis.map((kpi) => [kpi.label, kpi.average]));

  return (
    <div className="shell review-lab">
      <header className="review-lab-header">
        <p className="eyebrow">September 18–30 live trial · real data</p>
        <h1 className="page-title">{employeeName} · September 2026</h1>
        <p className="page-subtitle">This review uses live completed + rated ClickUp evidence from September 18–30 to test the performance workflow before official scoring begins on October 1. September remains excluded from career, promotion, and salary-review calculations.</p>
        <div className="hero-actions">
          <Link className="button" href={`/team/${employeeSlug}`}>Back to Performance Card</Link>
          <Link className="button button-secondary" href="/review-process">Review timeline</Link>
          <Link className="button button-secondary" href="/task-rating-guide">Rating guide</Link>
        </div>
      </header>

      <div className="review-lab-layout">
        <div className="review-lab-main">
          <section className="panel">
            <span className="tracker-status status-warn">TRIAL · NOT COUNTED</span>
            <h2 style={{ marginTop: 14 }}>September validation review</h2>
            <p>Live ClickUp trial evidence is used for task-based KPIs. September uses the real workflow and real evidence, but does not count toward career or compensation decisions.</p>
            <div className="info-box">
              <strong>Assessment eligibility: No</strong>
              <p>Official counted evidence starts October 1, 2026 and closes December 10, 2026.</p>
            </div>
          </section>

          <section className="panel">
            <h2>Live trial KPI values</h2>
            <p>Task-based KPI values below come from completed tasks with ClickUp ratings in the September 18–30 trial window. Growth & Development and Role Excellence remain pending until manager review data is connected.</p>
            <div className="kpi-table-wrap">
              <table className="kpi-score-table">
                <thead><tr><th>#</th><th>KPI</th><th>Trial score</th><th>State</th></tr></thead>
                <tbody>
                  {kpis.map((kpi, index) => {
                    const score = liveKpis.get(kpi);
                    return (
                      <tr key={kpi}>
                        <td>{String(index + 1).padStart(2, '0')}</td>
                        <td><strong>{kpi}</strong></td>
                        <td><strong>{score === undefined ? '—' : score.toFixed(1)}</strong><span>/10</span></td>
                        <td><span className={`tracker-status ${score === undefined ? 'status-neutral' : 'status-good'}`}>{score === undefined ? 'Pending' : 'Live ClickUp'}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <h2>Trial manager review</h2>
            <div className="manager-review-grid">
              <article className="review-detail-card"><span className="card-kicker">What went well</span><ul>{review?.managerReview?.wentWell?.map((item) => <li key={item}>{item}</li>)}</ul></article>
              <article className="review-detail-card"><span className="card-kicker">Needs improvement</span><ul>{review?.managerReview?.needsImprovement?.map((item) => <li key={item}>{item}</li>)}</ul></article>
              <article className="review-detail-card"><span className="card-kicker">Next priority</span><ul>{review?.managerReview?.nextPriorities?.map((item) => <li key={item}>{item}</li>)}</ul></article>
              <article className="review-detail-card"><span className="card-kicker">Manager summary</span><p>{review?.managerReview?.managerSummary}</p></article>
            </div>
          </section>
        </div>

        <aside className="panel review-summary">
          <span className="card-kicker">September trial score</span>
          <p className="review-total">{clickUpEvidence.score ?? '—'}<small>/80</small></p>
          <strong>Live ClickUp trial score · 8 task KPIs</strong>
          <p>Status: <strong>{review?.status ?? 'Pending'}</strong></p>
          <ul className="review-checklist">
            <li>Trial window: Sep 18–30</li>
            <li>Rated completed tasks: {clickUpEvidence.ratedTasks}</li>
            <li>Assessment eligible: No</li>
            <li>Official data starts: Oct 1</li>
            <li>Evidence cutoff: Dec 10</li>
            <li>Decision announcement: Dec 16</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
