import Link from 'next/link';

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
};

export function SeptemberTrialReview({ employeeName, employeeSlug }: Props) {
  const record = getPerformanceRecord(employeeSlug);
  const review = record.reviews.find((item) => item.month === 'September');

  return (
    <div className="shell review-lab">
      <header className="review-lab-header">
        <p className="eyebrow">September 18–30 live trial · test data</p>
        <h1 className="page-title">{employeeName} · September 2026</h1>
        <p className="page-subtitle">This review exists to test the performance workflow before official scoring begins on October 1. All values shown here are simulated trial data and are excluded from career, promotion, and salary-review calculations.</p>
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
            <p>{review?.summary}</p>
            <div className="info-box">
              <strong>Assessment eligibility: No</strong>
              <p>Official counted evidence starts October 1, 2026 and closes December 10, 2026.</p>
            </div>
          </section>

          <section className="panel">
            <h2>Trial KPI values</h2>
            <p>These values are deliberately populated so employees, managers, the Delivery Reviewer, People Ops, and Admin can validate how a completed score appears before real data starts.</p>
            <div className="kpi-table-wrap">
              <table className="kpi-score-table">
                <thead><tr><th>#</th><th>KPI</th><th>Test score</th><th>State</th></tr></thead>
                <tbody>
                  {kpis.map((kpi, index) => {
                    const score = review?.kpiScores?.[kpi];
                    return (
                      <tr key={kpi}>
                        <td>{String(index + 1).padStart(2, '0')}</td>
                        <td><strong>{kpi}</strong></td>
                        <td><strong>{score === undefined ? '—' : score.toFixed(1)}</strong><span>/10</span></td>
                        <td><span className="tracker-status status-warn">Test data</span></td>
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
          <p className="review-total">{review?.score ?? '—'}<small>/100</small></p>
          <strong>Test only</strong>
          <p>Status: <strong>{review?.status ?? 'Pending'}</strong></p>
          <ul className="review-checklist">
            <li>Trial window: Sep 18–30</li>
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
