import Link from 'next/link';

import type { PersonProfile } from '@/lib/people';
import { careerLevels, getCareerLevel, type RoleProfileData } from '@/lib/performance-profile';
import { getPerformanceRecord, type KpiName } from '@/lib/performance-records';

type Props = {
  person: PersonProfile;
  roleProfile: RoleProfileData;
};

const kpiDefinitions: { name: KpiName; source: string; note?: string }[] = [
  { name: 'Delivery & Reliability', source: 'ClickUp + HRMS / People Ops', note: '60% delivery + 20% attendance + 20% leave & policy reliability' },
  { name: 'Work Quality', source: 'ClickUp task evidence' },
  { name: 'Ownership', source: 'ClickUp task evidence' },
  { name: 'Communication', source: 'ClickUp task evidence' },
  { name: 'Problem Solving', source: 'ClickUp task evidence' },
  { name: 'Collaboration', source: 'ClickUp task evidence' },
  { name: 'Proactiveness', source: 'ClickUp task evidence' },
  { name: 'Business / Client Impact', source: 'ClickUp outcomes + results' },
  { name: 'Growth & Development', source: 'Manager monthly review' },
  { name: 'Role Excellence', source: 'Manager review + Role Success Plan' },
];

function statusClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('complete') || normalized.includes('active') || normalized.includes('communicated') || normalized.includes('on track')) return 'status-good';
  if (normalized.includes('risk')) return 'status-risk';
  if (normalized.includes('review') || normalized.includes('assessment') || normalized.includes('calibration') || normalized.includes('awaiting')) return 'status-warn';
  return 'status-neutral';
}

function careerStatusLabel(status: string) {
  if (status === 'Assessment') return 'Under assessment';
  return status;
}

function performanceBand(score?: number) {
  if (score === undefined) return 'Pending';
  if (score >= 90) return 'Exceptional';
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Effective';
  if (score >= 40) return 'Needs Improvement';
  return 'Significant Improvement Needed';
}

export function EmployeePerformanceProfile({ person, roleProfile }: Props) {
  const record = getPerformanceRecord(person.slug);
  const latestCompleteReview = [...record.reviews].reverse().find((review) => review.status === 'Complete');
  const focusReview = record.reviews.find((review) => review.status === 'In review')
    ?? record.reviews.find((review) => review.status === 'Pending')
    ?? latestCompleteReview
    ?? record.reviews[0];
  const currentScore = latestCompleteReview?.score;
  const proposedCareer = getCareerLevel(record.career.proposedLevel);
  const careerStatus = careerStatusLabel(record.career.status);
  const managerReview = focusReview?.managerReview;
  const deliveryReview = focusReview?.deliveryReview;

  return (
    <>
      <section className="profile-hero">
        <div className="shell">
          <div className="profile-heading-row">
            <div>
              <p className="eyebrow">Employee Performance Card · {person.function}</p>
              <h1>{person.name}</h1>
              <p className="profile-role">{person.role}</p>
            </div>
            <div className="profile-heading-actions">
              <span className="status-pill"><span className="status-dot" /> Proposed {record.career.proposedLevel ?? 'level'} · {careerStatus}</span>
              <Link className="button button-secondary button-small" href={`/roles/${person.slug}`}>Full Role Success Plan</Link>
            </div>
          </div>

          <div className="profile-metrics profile-metrics-five">
            <div><span>Review manager</span><strong>{record.reviewManager ?? 'To be assigned'}</strong></div>
            <div><span>Proposed level</span><strong>{record.career.proposedLevel ?? '—'}</strong></div>
            <div><span>Salary band</span><strong>{proposedCareer?.salaryBand ?? '—'}</strong></div>
            <div><span>Assessment cycle</span><strong>Oct–Dec 2026</strong></div>
            <div><span>Latest KPI</span><strong>{currentScore === undefined ? 'Pending' : `${currentScore}/100`}</strong></div>
          </div>
        </div>
      </section>

      <div className="profile-nav-wrap">
        <nav className="shell profile-tabs" aria-label={`${person.name} employee performance card`}>
          <a href="#overview">Overview</a>
          <a href="#role-success">Role Success</a>
          <a href="#work-evidence">Work Evidence</a>
          <a href="#monthly-kpi">Monthly KPI</a>
          <a href="#manager-review">Manager Review</a>
          <a href="#career">Career</a>
          <a href="#history">History</a>
        </nav>
      </div>

      <section className="shell profile-sections">
        <section className="profile-section" id="overview">
          <div className="profile-section-head">
            <div>
              <p className="eyebrow">Overview</p>
              <h2>One card for the full performance story</h2>
              <p>This page combines role expectations, work evidence, monthly performance, manager review, and career assessment without turning ClickUp into an employee dashboard.</p>
            </div>
            <span className="section-number">01</span>
          </div>

          <div className="profile-two-col">
            <div className="profile-card profile-card-dark">
              <span className="card-kicker">Role mission</span>
              <p className="mission-copy">{roleProfile.mission || `Deliver the expected outcomes of the ${person.role} role with reliable ownership and quality.`}</p>
            </div>
            <div className="profile-card">
              <span className="card-kicker">Assessment position</span>
              <h3>Proposed {record.career.proposedLevel ?? 'level'} · {proposedCareer?.name ?? 'Under assessment'}</h3>
              <p>{proposedCareer?.meaning ?? 'The proposed level is a starting assessment position and is not yet assigned.'}</p>
              <div className="overview-facts">
                <div><span>Salary band</span><strong>{proposedCareer?.salaryBand ?? '—'}</strong></div>
                <div><span>Decision by</span><strong>Dec 31, 2026</strong></div>
                <div><span>Effective</span><strong>Jan 1, 2027</strong></div>
              </div>
              <p className="career-note">The proposed level is not an assigned level. October–December evidence will confirm or adjust it.</p>
            </div>
          </div>

          <div className="system-flow-card">
            <span>Role Success Plan</span><b>→</b><span>ClickUp work evidence</span><b>→</b><span>Monthly KPI</span><b>→</b><span>Manager review</span><b>→</b><span>Career decision</span>
          </div>
        </section>

        <section className="profile-section" id="role-success">
          <div className="profile-section-head">
            <div>
              <p className="eyebrow">Role Success</p>
              <h2>What {person.name} is expected to deliver</h2>
              <p>These outcomes come directly from the Role Success Plan. They define role success; normal day-to-day tasks remain in ClickUp.</p>
            </div>
            <span className="section-number">02</span>
          </div>

          <div className="deliverable-table-wrap">
            <table className="deliverable-table">
              <thead>
                <tr><th>#</th><th>Success outcome</th><th>What good looks like</th><th>Evidence state</th></tr>
              </thead>
              <tbody>
                {roleProfile.deliverables.map((deliverable, index) => {
                  const tracked = record.deliverables.find((item) => item.title.toLowerCase() === deliverable.title.toLowerCase());
                  const status = tracked?.status ?? 'Awaiting evidence';
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
            <div><strong>Role plan</strong><span>The Role Success Plan defines the outcomes and standards this role is accountable for.</span></div>
            <div><strong>Evidence standard</strong><span>{roleProfile.evidence || 'Use documented work output, delivery quality, ownership, collaboration, and measurable results.'}</span></div>
          </div>
        </section>

        <section className="profile-section" id="work-evidence">
          <div className="profile-section-head">
            <div>
              <p className="eyebrow">Work Evidence</p>
              <h2>Evidence behind the assessment</h2>
              <p>ClickUp remains the operational source of truth. This card will present the relevant evidence once the live ClickUp connection is wired.</p>
            </div>
            <span className="section-number">03</span>
          </div>

          <div className="integration-banner">
            <div>
              <span className="card-kicker">ClickUp integration</span>
              <strong>Card UI ready · live sync pending</strong>
            </div>
            <span className="tracker-status status-warn">Integration next</span>
          </div>

          <div className="evidence-grid">
            {roleProfile.deliverables.map((deliverable) => {
              const tracked = record.deliverables.find((item) => item.title.toLowerCase() === deliverable.title.toLowerCase());
              const status = tracked?.status ?? 'Awaiting evidence';
              return (
                <article className="evidence-card" key={deliverable.title}>
                  <div className="evidence-card-top">
                    <strong>{deliverable.title}</strong>
                    <span className={`tracker-status ${statusClass(status)}`}>{status}</span>
                  </div>
                  <p>{tracked?.evidence ?? 'Linked ClickUp tasks, project outcomes, documents, and approved evidence will appear here.'}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="profile-section" id="monthly-kpi">
          <div className="profile-section-head">
            <div>
              <p className="eyebrow">Monthly KPI</p>
              <h2>100-point performance score</h2>
              <p>The same ten KPIs are reviewed every month. Objective evidence should be calculated before manager judgment is added.</p>
            </div>
            <span className="section-number">04</span>
          </div>

          <div className="review-month-grid">
            {record.reviews.map((review) => (
              <article className={`review-month-card ${focusReview?.month === review.month ? 'review-month-card-focus' : ''}`} key={review.month}>
                <div className="review-month-top">
                  <span>{review.month} 2026</span>
                  <span className={`tracker-status ${statusClass(review.status)}`}>{review.status}</span>
                </div>
                <strong className="review-score">{review.score === undefined ? '—' : review.score}<small>/100</small></strong>
                <p>{review.summary ?? 'Monthly review evidence and approved score will appear here after the review is completed.'}</p>
                <span className="review-band">{performanceBand(review.score)}</span>
              </article>
            ))}
          </div>

          <div className="kpi-panel">
            <div className="kpi-panel-head">
              <div>
                <span className="card-kicker">{focusReview?.month ?? 'Monthly'} 2026 detail</span>
                <h3>10 KPIs × 10 points</h3>
              </div>
              <Link href="/framework" className="card-link">View scoring framework →</Link>
            </div>

            <div className="kpi-table-wrap">
              <table className="kpi-score-table">
                <thead><tr><th>#</th><th>KPI</th><th>Evidence source</th><th>Score</th><th>Status</th></tr></thead>
                <tbody>
                  {kpiDefinitions.map((kpi, index) => {
                    const score = focusReview?.kpiScores?.[kpi.name];
                    return (
                      <tr key={kpi.name}>
                        <td>{String(index + 1).padStart(2, '0')}</td>
                        <td><strong>{kpi.name}</strong>{kpi.note ? <small>{kpi.note}</small> : null}</td>
                        <td>{kpi.source}</td>
                        <td><strong>{score === undefined ? '—' : score.toFixed(1)}</strong><span>/10</span></td>
                        <td><span className={`tracker-status ${score === undefined ? 'status-neutral' : 'status-good'}`}>{score === undefined ? 'Pending' : 'Recorded'}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="kpi-one-rule">
              <strong>KPI 1 — Delivery & Reliability</strong>
              <span>60% ClickUp Delivery Reliability + 20% Attendance Reliability + 20% Leave & Policy Reliability. Approved leave is neutral.</span>
            </div>
          </div>
        </section>

        <section className="profile-section" id="manager-review">
          <div className="profile-section-head">
            <div>
              <p className="eyebrow">Manager Review</p>
              <h2>{focusReview?.month ?? 'Monthly'} review conversation</h2>
              <p>The monthly review converts the evidence into useful feedback, reflection, and a small number of clear actions for the next month.</p>
            </div>
            <span className="section-number">05</span>
          </div>

          <div className="manager-review-grid">
            <article className="review-detail-card">
              <span className="card-kicker">What went well</span>
              {managerReview?.wentWell?.length ? <ul>{managerReview.wentWell.map((item) => <li key={item}>{item}</li>)}</ul> : <p>No manager feedback recorded yet.</p>}
            </article>
            <article className="review-detail-card">
              <span className="card-kicker">Needs improvement</span>
              {managerReview?.needsImprovement?.length ? <ul>{managerReview.needsImprovement.map((item) => <li key={item}>{item}</li>)}</ul> : <p>No improvement notes recorded yet.</p>}
            </article>
            <article className="review-detail-card">
              <span className="card-kicker">Employee reflection</span>
              <p>{managerReview?.employeeReflection ?? 'Employee reflection will appear here after the monthly review.'}</p>
            </article>
            <article className="review-detail-card">
              <span className="card-kicker">Next-month priorities</span>
              {managerReview?.nextPriorities?.length ? <ol>{managerReview.nextPriorities.map((item) => <li key={item}>{item}</li>)}</ol> : <p>No next-month priorities recorded yet.</p>}
            </article>
            {record.deliveryReviewer ? (
              <article className="review-detail-card">
                <span className="card-kicker">Delivery Reviewer feedback · {record.deliveryReviewer}</span>
                {deliveryReview?.summary ? <p>{deliveryReview.summary}</p> : <p>Qualitative delivery feedback will appear here after the monthly review. It summarizes ClickUp task-level evidence and does not add a separate score.</p>}
                {deliveryReview?.strengths?.length ? <><strong>Delivery strengths</strong><ul>{deliveryReview.strengths.map((item) => <li key={item}>{item}</li>)}</ul></> : null}
                {deliveryReview?.improvementPatterns?.length ? <><strong>Improvement patterns</strong><ul>{deliveryReview.improvementPatterns.map((item) => <li key={item}>{item}</li>)}</ul></> : null}
                {deliveryReview?.context ? <p><strong>Context:</strong> {deliveryReview.context}</p> : null}
              </article>
            ) : null}
          </div>

          <div className="manager-summary-strip">
            <span>Review manager</span><strong>{record.reviewManager ?? 'To be assigned'}</strong>
            {record.deliveryReviewer ? <><span>Delivery reviewer</span><strong>{record.deliveryReviewer} · feedback only</strong></> : null}
            <span>Manager summary</span><strong>{managerReview?.managerSummary ?? 'Pending monthly review'}</strong>
          </div>
        </section>

        <section className="profile-section" id="career">
          <div className="profile-section-head">
            <div>
              <p className="eyebrow">Career</p>
              <h2>2027 career-level assessment</h2>
              <p>The level shown here is proposed, not assigned. October–December evidence will be used to confirm or adjust the first formal career level for January 2027.</p>
            </div>
            <span className="section-number">06</span>
          </div>

          <div className="career-summary-grid">
            <div className="career-state-card"><span>Confirmed level</span><strong>{record.career.finalLevel ?? 'Not assigned'}</strong></div>
            <div className="career-state-card"><span>Proposed level</span><strong>{record.career.proposedLevel ?? '—'}</strong></div>
            <div className="career-state-card"><span>Proposed salary band</span><strong>{proposedCareer?.salaryBand ?? '—'}</strong></div>
            <div className="career-state-card"><span>Assessment status</span><strong>{careerStatus}</strong></div>
          </div>

          <div className="career-assessment-grid">
            <div className="profile-card">
              <span className="card-kicker">What confirms the level</span>
              <h3>{record.career.proposedLevel ?? 'Proposed level'} expectations</h3>
              <ul className="assessment-list">
                <li>Consistent October–December KPI performance and trend</li>
                <li>Role Success Plan outcomes and real work evidence</li>
                <li>Scope, independence, ownership, and sound judgment</li>
                <li>Role-specific quality and measurable impact</li>
                <li>Growth, collaboration, and leadership where relevant</li>
              </ul>
              <p className="career-note">KPI score is supporting evidence. It does not automatically confirm a level, determine promotion, or generate a salary increase.</p>
            </div>

            <div className="level-ladder-card">
              <span className="card-kicker">Universal ladder</span>
              <div className="level-ladder">
                {careerLevels.map((item) => (
                  <div className={`level-row ${item.level === record.career.proposedLevel ? 'level-row-active' : ''}`} key={item.level}>
                    <strong>{item.level}</strong>
                    <div><b>{item.name}</b><span>{item.meaning} · {item.salaryBand}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="career-timeline-inline">
            <span><b>Now</b> Proposed level</span><i>→</i>
            <span><b>Oct–Dec</b> Evidence collection</span><i>→</i>
            <span><b>Late Dec</b> Assessment + calibration</span><i>→</i>
            <span><b>By Dec 31</b> Confirm or adjust</span><i>→</i>
            <span><b>Jan 1</b> Confirmed level active</span>
          </div>
        </section>

        <section className="profile-section" id="history">
          <div className="profile-section-head">
            <div>
              <p className="eyebrow">Performance History</p>
              <h2>Monthly record over time</h2>
              <p>This becomes the employee's long-term performance history. The first formal cycle begins in October 2026.</p>
            </div>
            <span className="section-number">07</span>
          </div>

          <div className="history-table-wrap">
            <table className="history-table">
              <thead><tr><th>Month</th><th>Status</th><th>Score</th><th>Performance band</th><th>Summary</th></tr></thead>
              <tbody>
                {record.reviews.map((review) => (
                  <tr key={review.month}>
                    <td><strong>{review.month} 2026</strong></td>
                    <td><span className={`tracker-status ${statusClass(review.status)}`}>{review.status}</span></td>
                    <td>{review.score === undefined ? '—' : `${review.score}/100`}</td>
                    <td>{performanceBand(review.score)}</td>
                    <td>{review.summary ?? 'No completed review yet.'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card-data-note">
            <strong>Source-of-truth model</strong>
            <span>ClickUp supplies work and monthly review evidence. HRMS / People Ops supplies attendance and leave-policy evidence. This website is the employee-facing performance card that presents the approved result clearly.</span>
          </div>
        </section>
      </section>
    </>
  );
}
