import Link from 'next/link';

import type { PersonProfile } from '@/lib/people';
import { careerLevels, kpis, type RoleProfileData } from '@/lib/performance-profile';
import { getPerformanceRecord } from '@/lib/performance-records';

type Props = {
  person: PersonProfile;
  roleProfile: RoleProfileData;
};

function statusClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('complete') || normalized.includes('active') || normalized.includes('communicated')) return 'status-good';
  if (normalized.includes('risk')) return 'status-risk';
  if (normalized.includes('review') || normalized.includes('assessment') || normalized.includes('calibration')) return 'status-warn';
  return 'status-neutral';
}

export function EmployeePerformanceProfile({ person, roleProfile }: Props) {
  const record = getPerformanceRecord(person.slug);
  const currentScore = record.reviews.find((review) => review.status === 'Complete')?.score;

  return (
    <>
      <section className="profile-hero">
        <div className="shell">
          <div className="profile-heading-row">
            <div>
              <p className="eyebrow">{person.function}</p>
              <h1>{person.name}</h1>
              <p className="profile-role">{person.role}</p>
            </div>
            <div className="profile-heading-actions">
              <span className="status-pill"><span className="status-dot" /> Career level not assigned</span>
              <Link className="button button-secondary button-small" href={`/roles/${person.slug}`}>Full Role Success Plan</Link>
            </div>
          </div>

          <div className="profile-metrics">
            <div><span>Role plan</span><strong>Assigned</strong></div>
            <div><span>Review cycle</span><strong>Oct–Dec 2026</strong></div>
            <div><span>Latest KPI</span><strong>{currentScore === undefined ? 'Pending' : `${currentScore}/100`}</strong></div>
            <div><span>Career assessment</span><strong>{record.career.status}</strong></div>
          </div>
        </div>
      </section>

      <div className="profile-nav-wrap">
        <nav className="shell profile-tabs" aria-label={`${person.name} performance profile`}>
          <a href="#overview">Overview</a>
          <a href="#role-deliverables">Role & Deliverables</a>
          <a href="#performance">Performance</a>
          <a href="#career">Career</a>
        </nav>
      </div>

      <section className="shell profile-sections">
        <section className="profile-section" id="overview">
          <div className="profile-section-head">
            <div>
              <p className="eyebrow">Overview</p>
              <h2>What success looks like</h2>
            </div>
            <span className="section-number">01</span>
          </div>

          <div className="profile-two-col">
            <div className="profile-card profile-card-dark">
              <span className="card-kicker">Role mission</span>
              <p className="mission-copy">{roleProfile.mission || `Deliver the expected outcomes of the ${person.role} role with reliable ownership and quality.`}</p>
            </div>
            <div className="profile-card">
              <span className="card-kicker">Performance system</span>
              <h3>Role → Evidence → KPI → Career</h3>
              <p>Daily work and deliverables create evidence. Monthly KPI reviews evaluate performance. Sustained evidence informs the annual career assessment.</p>
              <div className="mini-flow"><span>Role</span><b>→</b><span>Evidence</span><b>→</b><span>KPI</span><b>→</b><span>Career</span></div>
            </div>
          </div>
        </section>

        <section className="profile-section" id="role-deliverables">
          <div className="profile-section-head">
            <div>
              <p className="eyebrow">Role & Deliverables</p>
              <h2>What {person.name} is expected to deliver</h2>
              <p>These expectations come directly from the assigned Role Success Plan. Operational tasks and evidence remain tracked in ClickUp.</p>
            </div>
            <span className="section-number">02</span>
          </div>

          <div className="deliverable-table-wrap">
            <table className="deliverable-table">
              <thead>
                <tr><th>#</th><th>Deliverable / success outcome</th><th>Expected result</th><th>Status</th></tr>
              </thead>
              <tbody>
                {roleProfile.deliverables.map((deliverable, index) => {
                  const tracked = record.deliverables.find((item) => item.title.toLowerCase() === deliverable.title.toLowerCase());
                  const status = tracked?.status ?? 'Ongoing';
                  return (
                    <tr key={deliverable.title}>
                      <td className="deliverable-index">{String(index + 1).padStart(2, '0')}</td>
                      <td><strong>{deliverable.title}</strong></td>
                      <td>{deliverable.expectedResult}</td>
                      <td><span className={`tracker-status ${statusClass(status)}`}>{status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="tracker-note">
            <div><strong>Execution tracker</strong><span>ClickUp remains the operational source of truth for task ownership, due dates, progress, and evidence.</span></div>
            <div><strong>Evidence standard</strong><span>{roleProfile.evidence || 'Use documented work output, delivery quality, ownership, collaboration, and measurable results.'}</span></div>
          </div>
        </section>

        <section className="profile-section" id="performance">
          <div className="profile-section-head">
            <div>
              <p className="eyebrow">Performance</p>
              <h2>Monthly KPI tracker</h2>
              <p>October, November, and December reviews use the same 100-point KPI framework.</p>
            </div>
            <span className="section-number">03</span>
          </div>

          <div className="review-month-grid">
            {record.reviews.map((review) => (
              <article className="review-month-card" key={review.month}>
                <div className="review-month-top">
                  <span>{review.month} 2026</span>
                  <span className={`tracker-status ${statusClass(review.status)}`}>{review.status}</span>
                </div>
                <strong className="review-score">{review.score === undefined ? '—' : review.score}<small>/100</small></strong>
                <p>{review.summary ?? 'Monthly review evidence and approved score will appear here after the review is completed.'}</p>
              </article>
            ))}
          </div>

          <div className="kpi-panel">
            <div className="kpi-panel-head">
              <div><span className="card-kicker">100-point framework</span><h3>10 KPIs × 10 points</h3></div>
              <Link href="/framework" className="card-link">View scoring framework →</Link>
            </div>
            <div className="kpi-list">
              {kpis.map((kpi, index) => (
                <div className="kpi-item" key={kpi}>
                  <span className="kpi-number">{String(index + 1).padStart(2, '0')}</span>
                  <strong>{kpi}</strong>
                  <span>10 pts</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="profile-section" id="career">
          <div className="profile-section-head">
            <div>
              <p className="eyebrow">Career</p>
              <h2>2027 annual career assessment</h2>
              <p>No employee has an assigned level yet. October–December evidence will establish the first baseline level for January 2027.</p>
            </div>
            <span className="section-number">04</span>
          </div>

          <div className="career-summary-grid">
            <div className="career-state-card">
              <span>Current level</span><strong>Not assigned</strong>
            </div>
            <div className="career-state-card">
              <span>Assessment status</span><strong>{record.career.status}</strong>
            </div>
            <div className="career-state-card">
              <span>Proposed level</span><strong>{record.career.proposedLevel ?? '—'}</strong>
            </div>
            <div className="career-state-card">
              <span>Effective</span><strong>{record.career.finalLevel ? 'Jan 1, 2027' : 'Pending decision'}</strong>
            </div>
          </div>

          <div className="career-assessment-grid">
            <div className="profile-card">
              <span className="card-kicker">Assessment evidence</span>
              <h3>What leadership reviews</h3>
              <ul className="assessment-list">
                <li>October–December KPI performance and trend</li>
                <li>Role Success Plan and deliverable evidence</li>
                <li>Ownership, independence, judgment, and problem solving</li>
                <li>Role-specific scope and Role Excellence</li>
                <li>Growth, collaboration, and leadership where relevant</li>
              </ul>
              <p className="career-note">KPI score provides evidence, but it does not automatically determine career level.</p>
            </div>

            <div className="level-ladder-card">
              <span className="card-kicker">Universal ladder</span>
              <div className="level-ladder">
                {careerLevels.map((item) => (
                  <div className="level-row" key={item.level}>
                    <strong>{item.level}</strong>
                    <div><b>{item.name}</b><span>{item.meaning}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="career-timeline-inline">
            <span><b>Oct–Dec</b> Evidence collection</span>
            <i>→</i>
            <span><b>Late Dec</b> Assessment + calibration</span>
            <i>→</i>
            <span><b>By Dec 31</b> Level communicated</span>
            <i>→</i>
            <span><b>Jan 1, 2027</b> Level active</span>
          </div>
        </section>
      </section>
    </>
  );
}
