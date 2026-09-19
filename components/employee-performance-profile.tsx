import Link from 'next/link';

import type { LiveClickUpEvidence } from '@/lib/clickup-performance';
import type { PersonProfile } from '@/lib/people';
import { careerLevels, getCareerLevel, type RoleProfileData } from '@/lib/performance-profile';
import { getPerformanceRecord, type KpiName, type ReviewMonth } from '@/lib/performance-records';

type Props = {
  person: PersonProfile;
  roleProfile: RoleProfileData;
  clickUpEvidence: LiveClickUpEvidence;
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

const monthKeys: Record<ReviewMonth, string> = {
  September: '2026-09',
  October: '2026-10',
  November: '2026-11',
  December: '2026-12',
};

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

export function EmployeePerformanceProfile({ person, roleProfile, clickUpEvidence }: Props) {
  const record = getPerformanceRecord(person.slug);
  const latestCompleteReview = [...record.reviews].reverse().find((review) => review.status === 'Complete');
  const focusReview = record.reviews.find((review) => review.status === 'In review')
    ?? record.reviews.find((review) => review.status === 'Pending')
    ?? latestCompleteReview
    ?? record.reviews[0];
  const proposedCareer = getCareerLevel(record.career.proposedLevel);
  const careerStatus = careerStatusLabel(record.career.status);
  const managerReview = focusReview?.managerReview;
  const deliveryReview = focusReview?.deliveryReview;
  const evidenceCoverage = clickUpEvidence.tasksReviewed
    ? Math.round((clickUpEvidence.ratedTasks / clickUpEvidence.tasksReviewed) * 100)
    : undefined;

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

          <div className="performance-snapshot-grid" aria-label="Current performance snapshot">
            <Link className="snapshot-card snapshot-card-primary" href={`/team/${person.slug}/reviews/2026-09`}>
              <div className="snapshot-card-head">
                <span>September task evidence</span>
                <em>Trial</em>
              </div>
              <strong>{clickUpEvidence.score === undefined ? '—' : `${clickUpEvidence.score}/80`}</strong>
              <p>Live ClickUp evidence only. This is not an official monthly /100 result.</p>
            </Link>

            <div className="snapshot-card">
              <div className="snapshot-card-head"><span>Evidence coverage</span></div>
              <strong>{evidenceCoverage === undefined ? '—' : `${evidenceCoverage}%`}</strong>
              <p>{clickUpEvidence.ratedTasks} rated of {clickUpEvidence.tasksReviewed} completed tasks.</p>
            </div>

            <div className="snapshot-card">
              <div className="snapshot-card-head"><span>Current review</span></div>
              <strong>{focusReview?.month ?? '—'}</strong>
              <p>{focusReview?.status ?? 'Pending'} · Manager: {record.reviewManager ?? person.manager}</p>
            </div>

            <div className="snapshot-card">
              <div className="snapshot-card-head"><span>Career assessment</span></div>
              <strong>{record.career.proposedLevel ? `Proposed ${record.career.proposedLevel}` : 'Under assessment'}</strong>
              <p>{proposedCareer?.name ?? 'Level not proposed'} · not yet assigned.</p>
            </div>
          </div>

          <div className="data-integrity-strip">
            <div>
              <span className="card-kicker">Data status</span>
              <strong>September is a live test cycle, not an official score.</strong>
            </div>
            <p>Task evidence covers the eight ClickUp-based KPI areas. For Delivery & Reliability, the live task view is only the ClickUp delivery component; the final KPI also requires HRMS attendance and leave/policy data. KPI 9–10 require the monthly manager review. September stays excluded from official totals and career decisions.</p>
          </div>
        </div>
      </section>

      <div className="profile-nav-wrap">
        <nav className="shell profile-tabs" aria-label={`${person.name} employee performance card`}>
          <a href="#overview">Overview</a>
          <a href="#monthly-kpi">Monthly Performance</a>
          <a href="#role-success">Role Success</a>
          <a href="#manager-review">Feedback</a>
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
                <div><span>Announcement</span><strong>Dec 16, 2026</strong></div>
                <div><span>Effective</span><strong>Jan 1, 2027</strong></div>
              </div>
              <p className="career-note">The proposed level is not an assigned level. Completed October–November reviews and evidence through December 10 will confirm or adjust it.</p>
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
              <thead><tr><th>#</th><th>Success outcome</th><th>What success looks like</th></tr></thead>
              <tbody>
                {roleProfile.deliverables.map((deliverable, index) => (
                  <tr key={deliverable.title}>
                    <td className="deliverable-index">{String(index + 1).padStart(2, '0')}</td>
                    <td><strong>{deliverable.title}</strong></td>
                    <td>{deliverable.expectedResult}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="role-assessment-strip">
            <div>
              <span className="card-kicker">Role Success Assessment</span>
              <strong>Not assessed yet</strong>
            </div>
            <p>Role Success is evaluated during the career-level assessment using monthly performance, manager observations, and documented work outcomes. September trial data does not create a formal Role Success rating.</p>
          </div>

          <div className="tracker-note">
            <div><strong>Role plan</strong><span>The Role Success Plan defines the outcomes and standards this role is accountable for.</span></div>
            <div><strong>Assessment evidence</strong><span>{roleProfile.evidence || 'Use documented work output, delivery quality, ownership, collaboration, and measurable results.'}</span></div>
          </div>
        </section>

        <section className="profile-section" id="work-evidence">
          <div className="profile-section-head">
            <div>
              <p className="eyebrow">Work Evidence</p>
              <h2>Evidence behind the assessment</h2>
              <p>ClickUp remains the operational source of truth. This card presents the relevant approved evidence and monthly results.</p>
            </div>
            <span className="section-number">03</span>
          </div>

          <div className="integration-banner">
            <div><span className="card-kicker">ClickUp integration</span><strong>Live evidence loads from ClickUp</strong></div>
            <span className="tracker-status status-warn">Live source</span>
          </div>

          <div className="evidence-grid">
            {roleProfile.deliverables.map((deliverable) => {
              const tracked = record.deliverables.find((item) => item.title.toLowerCase() === deliverable.title.toLowerCase());
              const status = tracked?.status ?? 'Awaiting evidence';
              return (
                <article className="evidence-card" key={deliverable.title}>
                  <div className="evidence-card-top"><strong>{deliverable.title}</strong><span className={`tracker-status ${statusClass(status)}`}>{status}</span></div>
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
              <h2>{focusReview?.isTest ? 'September trial · task evidence /80' : '100-point performance score'}</h2>
              <p>{focusReview?.isTest ? 'September is the live workflow test. ClickUp task evidence is collected now, while HRMS and manager-review inputs remain separate until the monthly /100 review is complete.' : 'Each month has its own review instance. Click a month card to open the detailed review, evidence coverage, calculations, feedback, reflection, and finalization workflow.'}</p>
            </div>
            <span className="section-number">04</span>
          </div>

          <p className="career-note">The December monthly review is completed after month-end. The December 16 career decision uses completed October–November scores and supporting evidence through December 10.</p>
          <div className="review-month-grid">
            {record.reviews.map((review) => (
              <Link
                href={`/team/${person.slug}/reviews/${monthKeys[review.month]}`}
                className={`review-month-card ${focusReview?.month === review.month ? 'review-month-card-focus' : ''}`}
                key={review.month}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="review-month-top">
                  <span>{review.month} 2026</span>
                  <span className={`tracker-status ${statusClass(review.status)}`}>{review.status}</span>
                </div>
                <strong className="review-score">{review.isTest ? 'Live' : (review.score === undefined ? '—' : review.score)}{review.isTest ? null : <small>/100</small>}</strong>
                <p>{review.summary ?? 'Open this month to review ClickUp evidence, KPI coverage, manager assessment, reflection, and 1:1.'}</p>
                <span className="review-band">{review.isTest ? 'Live trial evidence' : performanceBand(review.score)} · Open review →</span>
              </Link>
            ))}
          </div>

          <div className="kpi-panel">
            <div className="kpi-panel-head">
              <div><span className="card-kicker">{focusReview?.month ?? 'Monthly'} 2026 summary</span><h3>10 KPIs × 10 points</h3></div>
              <Link href="/framework" className="card-link">View scoring framework →</Link>
            </div>

            <div className="kpi-table-wrap">
              <table className="kpi-score-table">
                <thead><tr><th>#</th><th>KPI</th><th>Evidence source</th><th>Score</th><th>Status</th></tr></thead>
                <tbody>
                  {kpiDefinitions.map((kpi, index) => {
                    const liveClickUpKpi = clickUpEvidence.kpis.find((item) => item.label === kpi.name);
                    const officialScore = focusReview?.kpiScores?.[kpi.name];
                    const isManagerKpi = index >= 8;
                    const score = focusReview?.isTest
                      ? (isManagerKpi ? undefined : liveClickUpKpi?.average)
                      : officialScore;
                    const status = focusReview?.isTest
                      ? (isManagerKpi
                        ? 'Manager pending'
                        : kpi.name === 'Delivery & Reliability'
                          ? (score === undefined ? 'ClickUp pending' : 'ClickUp only')
                          : (score === undefined ? 'No evidence' : 'Live evidence'))
                      : (score === undefined ? 'Pending' : 'Recorded');
                    const statusTone = score === undefined ? 'status-neutral' : (kpi.name === 'Delivery & Reliability' && focusReview?.isTest ? 'status-warn' : 'status-good');
                    return (
                      <tr key={kpi.name}>
                        <td>{String(index + 1).padStart(2, '0')}</td>
                        <td><strong>{kpi.name}</strong>{kpi.note ? <small>{kpi.note}</small> : null}</td>
                        <td>{kpi.source}</td>
                        <td><strong>{score === undefined ? '—' : score.toFixed(1)}</strong><span>/10</span></td>
                        <td><span className={`tracker-status ${statusTone}`}>{status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="kpi-one-rule"><strong>KPI 1 — Delivery & Reliability</strong><span>60% ClickUp Delivery Reliability + 20% Attendance Reliability + 20% Leave & Policy Reliability. Approved leave is neutral.</span></div>
          </div>
        </section>

        <section className="profile-section" id="manager-review">
          <div className="profile-section-head">
            <div>
              <p className="eyebrow">Manager Review</p>
              <h2>{focusReview?.month ?? 'Monthly'} review conversation</h2>
              <p>The Performance Card shows the current monthly summary. The detailed monthly review page is where the active review is completed.</p>
            </div>
            <span className="section-number">05</span>
          </div>

          <div className="manager-review-grid">
            <article className="review-detail-card"><span className="card-kicker">What went well</span>{managerReview?.wentWell?.length ? <ul>{managerReview.wentWell.map((item) => <li key={item}>{item}</li>)}</ul> : <p>No manager feedback recorded yet.</p>}</article>
            <article className="review-detail-card"><span className="card-kicker">Needs improvement</span>{managerReview?.needsImprovement?.length ? <ul>{managerReview.needsImprovement.map((item) => <li key={item}>{item}</li>)}</ul> : <p>No improvement notes recorded yet.</p>}</article>
            <article className="review-detail-card"><span className="card-kicker">Employee reflection</span><p>{managerReview?.employeeReflection ?? 'Employee reflection will appear here after the monthly review.'}</p></article>
            <article className="review-detail-card"><span className="card-kicker">Next-month priorities</span>{managerReview?.nextPriorities?.length ? <ol>{managerReview.nextPriorities.map((item) => <li key={item}>{item}</li>)}</ol> : <p>No next-month priorities recorded yet.</p>}</article>
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
              <p>The level shown here is proposed, not assigned. Completed October–November reviews and evidence through December 10 will be used to confirm or adjust the first formal career level for January 2027.</p>
            </div>
            <span className="section-number">06</span>
          </div>

          <div className="career-summary-grid">
            <div className="career-state-card"><span>Proposed level</span><strong>{record.career.proposedLevel ?? '—'}</strong><p>{proposedCareer?.name ?? 'Level under assessment'}</p></div>
            <div className="career-state-card"><span>Success benchmark</span><strong>85%+</strong><p>Overall Career Level Success required.</p></div>
            <div className="career-state-card"><span>Critical floor</span><strong>70%+</strong><p>No critical career dimension below this threshold.</p></div>
            <div className="career-state-card"><span>Current readiness</span><strong>Not calculated</strong><p>September trial data is excluded from the career decision.</p></div>
          </div>

          <div className="career-assessment-grid">
            <div className="profile-card">
              <span className="card-kicker">What confirms the level</span>
              <h3>{record.career.proposedLevel ?? 'Proposed level'} expectations</h3>
              <ul className="assessment-list">
                <li>Completed October–November KPI performance and trend, plus evidence through December 10</li>
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
                    <strong>{item.level}</strong><div><b>{item.name}</b><span>{item.meaning} · {item.salaryBand}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="career-timeline-inline">
            <span><b>Now</b> Proposed level</span><i>→</i><span><b>Oct 1–Dec 10</b> Evidence collection</span><i>→</i><span><b>Dec 11–15</b> Calibration and discussions</span><i>→</i><span><b>Dec 16</b> Announce decisions</span><i>→</i><span><b>Jan 1</b> Confirmed level active</span>
          </div>
        </section>

        <section className="profile-section" id="history">
          <div className="profile-section-head">
            <div><p className="eyebrow">Performance History</p><h2>Monthly record over time</h2><p>This becomes the employee's long-term performance history. The first formal cycle begins in October 2026.</p></div>
            <span className="section-number">07</span>
          </div>

          <div className="history-table-wrap">
            <table className="history-table">
              <thead><tr><th>Month</th><th>Status</th><th>Score</th><th>Performance band</th><th>Summary</th></tr></thead>
              <tbody>
                {record.reviews.map((review) => (
                  <tr key={review.month}>
                    <td><Link href={`/team/${person.slug}/reviews/${monthKeys[review.month]}`}><strong>{review.month} 2026</strong></Link></td>
                    <td><span className={`tracker-status ${statusClass(review.status)}`}>{review.status}</span></td>
                    <td>{review.isTest ? 'Live trial' : (review.score === undefined ? '—' : `${review.score}/100`)}</td>
                    <td>{review.isTest ? 'Test only' : performanceBand(review.score)}</td>
                    <td>{review.summary ?? 'No completed review yet.'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card-data-note"><strong>Source-of-truth model</strong><span>ClickUp supplies work and monthly review evidence. HRMS / People Ops supplies attendance and leave-policy evidence. This Performance Card is the permanent summary; each month opens its own reusable detailed review instance.</span></div>
        </section>
      </section>
    </>
  );
}
