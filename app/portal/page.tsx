import Link from 'next/link';

import { ClickUpSyncButton } from '@/components/clickup-sync-button';
import { RatingIntegrityPanel } from '@/components/rating-integrity-panel';

import { requirePortalUser, type PortalRole } from '@/lib/access';
import { db } from '@/lib/db';
import { getRatingIntegrityIssues, getRatingIntegritySummary } from '@/lib/rating-integrity';
import { emptyManagerMonthlyReview, getManagerMonthlyReviews } from '@/lib/manager-monthly-review';

type VisibleEmployee = {
  slug: string;
  full_name: string;
};

const roleLabels: Record<PortalRole, string> = {
  employee: 'Employee',
  manager: 'Manager',
  delivery_reviewer: 'Delivery Reviewer',
  people_ops: 'People Ops',
  admin: 'Admin',
};

export const dynamic = 'force-dynamic';

function currentMonthKey() {
  return new Intl.DateTimeFormat('en-CA', { year:'numeric', month:'2-digit', timeZone:'Asia/Dhaka' }).format(new Date()).slice(0,7);
}

function currentDhakaDay() {
  return Number(new Intl.DateTimeFormat('en-US', { day:'numeric', timeZone:'Asia/Dhaka' }).format(new Date()));
}

async function getVisibleEmployees(role: PortalRole, employeeSlug: string | null) {
  if (role === 'admin' || role === 'people_ops') {
    const result = await db.query<VisibleEmployee>(
      `select slug, full_name from employees where is_active = true order by full_name`,
    );
    return result.rows;
  }

  if (role === 'manager' && employeeSlug) {
    const result = await db.query<VisibleEmployee>(
      `select slug, full_name
         from employees
        where manager_slug = $1
          and is_active = true
        order by full_name`,
      [employeeSlug],
    );
    return result.rows;
  }

  if (role === 'delivery_reviewer' && employeeSlug) {
    const result = await db.query<VisibleEmployee>(
      `select distinct e.slug, e.full_name
         from review_assignments ra
         join employees e on e.slug = ra.employee_slug
        where ra.reviewer_slug = $1
          and ra.is_active = true
          and e.is_active = true
        order by e.full_name`,
      [employeeSlug],
    );
    return result.rows;
  }

  return [];
}

async function getDisplayName(email: string, employeeSlug: string | null) {
  if (employeeSlug) {
    const employee = await db.query<{ full_name: string }>(
      `select full_name from employees where slug = $1 limit 1`,
      [employeeSlug],
    );
    if (employee.rows[0]?.full_name) return employee.rows[0].full_name;
  }

  const user = await db.query<{ name: string }>(
    `select name from "user" where lower(email) = lower($1) limit 1`,
    [email],
  );
  return user.rows[0]?.name || email;
}

export default async function PortalPage() {
  const { session, portalUser, actualPortalUser, viewingAs } = await requirePortalUser();
  const visibleEmployees = await getVisibleEmployees(portalUser.role, portalUser.employeeSlug);
  const effectiveName = viewingAs
    ? await getDisplayName(portalUser.email, portalUser.employeeSlug)
    : session.user.name || session.user.email;

  const isCeoAccount = actualPortalUser.role === 'admin' && !actualPortalUser.employeeSlug && !viewingAs;
  const showPersonalPerformance = Boolean(portalUser.employeeSlug);
  const canSeeRatingIntegrity = isCeoAccount || portalUser.role === 'manager' || portalUser.role === 'delivery_reviewer';
  const integrityScope = isCeoAccount ? undefined : visibleEmployees.map((employee) => employee.slug);
  const reviewMonth = currentMonthKey();

  // These three are independent, and each is a round trip to a remote database.
  // Run them together rather than one after another. The review lookup is a
  // single batched query instead of one per employee.
  const [ratingIntegrity, ratingIssues, reviewsBySlug] = await Promise.all([
    canSeeRatingIntegrity ? getRatingIntegritySummary('2026-10', integrityScope) : null,
    canSeeRatingIntegrity ? getRatingIntegrityIssues('2026-10', integrityScope) : [],
    getManagerMonthlyReviews(visibleEmployees.map((employee) => employee.slug), reviewMonth),
  ]);

  const reviewRows = visibleEmployees.map((employee) => ({
    ...employee,
    review: reviewsBySlug.get(employee.slug) ?? emptyManagerMonthlyReview,
  }));
  const reviewSubmitted = reviewRows.filter(row => ['submitted','finalized','locked'].includes(row.review.status)).length;
  const reviewPending = reviewRows.filter(row => !['submitted','finalized','locked'].includes(row.review.status));
  const showMonthEndAttention = currentDhakaDay() >= 28 && reviewPending.length > 0;

  return (
    <main className="shell portal-shell">
      {viewingAs ? (
        <section className="role-preview-bar" aria-label="View as notice">
          <div>
            <span className="role-preview-label">Viewing as</span>
            <strong>{effectiveName}</strong>
            <small>{roleLabels[portalUser.role]} · {portalUser.email}</small>
          </div>
          <p>This uses the selected person&apos;s real role, employee mapping, reporting relationships, and review assignments.</p>
        </section>
      ) : null}

      <section className="portal-intro">
        <p className="eyebrow">Blinto Performance Portal</p>
        <h1 className="page-title">Welcome, {effectiveName}</h1>
        <p className="page-subtitle">
          {viewingAs
            ? `You are previewing the portal exactly as this ${roleLabels[portalUser.role].toLowerCase()} can access it.`
            : 'Your performance, career framework, and permitted team access in one place.'}
        </p>
      </section>

      <div className="profile-two-col portal-primary-grid">
        {isCeoAccount ? (
          <section className="profile-card profile-card-dark">
            <span className="card-kicker">CEO Dashboard</span>
            <h2>Company & Team Performance</h2>
            <p>Review organization-wide performance, monthly review progress, evidence, and career assessment across Blinto.</p>
            <Link className="button" href="/team">Open team performance →</Link>
          </section>
        ) : (
          <section className="profile-card profile-card-dark">
            <span className="card-kicker">My Performance</span>
            <h2>My Performance Card</h2>
            {showPersonalPerformance ? (
              <>
                <p>Review monthly KPI history, manager feedback, evidence, and career assessment.</p>
                <Link className="button" href={`/team/${portalUser.employeeSlug}`}>Open my card →</Link>
              </>
            ) : (
              <p>This approved account has portal access but is not linked to an employee Performance Card.</p>
            )}
          </section>
        )}

        <section className="profile-card">
          <span className="card-kicker">Shared framework</span>
          <h2>How performance works</h2>
          <p>Reference the scoring framework, task rating guide, career levels, and review process.</p>
          <div className="portal-link-grid">
            <Link className="button button-secondary" href="/framework">KPI Framework</Link>
            <Link className="button button-secondary" href="/task-rating-guide">Rating Guide</Link>
            <Link className="button button-secondary" href="/career-levels">Career Levels</Link>
            <Link className="button button-secondary" href="/review-process">Review Process</Link>
          </div>
        </section>
      </div>

      {isCeoAccount ? <ClickUpSyncButton /> : null}
      {canSeeRatingIntegrity && ratingIntegrity ? <RatingIntegrityPanel summary={ratingIntegrity} issues={ratingIssues} canValidate={isCeoAccount} /> : null}

      {reviewRows.length ? (
        <section className="profile-section portal-team-section">
          <div className="profile-section-head">
            <div>
              <p className="eyebrow">Monthly reviews · {reviewMonth}</p>
              <h2>{isCeoAccount ? 'Company Review Status' : 'My Team Reviews'}</h2>
              <p>{reviewSubmitted} of {reviewRows.length} submitted · {reviewPending.length} pending{showMonthEndAttention ? ' · Action required before month-end' : ''}</p>
            </div>
          </div>
          {showMonthEndAttention ? <div className="info-box"><strong>Month-end review reminder</strong><p>Complete all pending manager reviews by the final calendar day so the system can generate official results on the 1st.</p></div> : null}
          <div className="evidence-grid portal-employee-grid">
            {reviewRows.map(row => {
              const done=['submitted','finalized','locked'].includes(row.review.status);
              return <article className="evidence-card" key={row.slug}>
                <div className="evidence-card-top"><strong>{row.full_name}</strong><span className={`tracker-status ${done?'status-good':'status-warn'}`}>{done ? row.review.status : 'Pending'}</span></div>
                <Link className="card-link" href={`/team/${row.slug}/reviews/${reviewMonth}`}>{done ? 'Open review' : 'Review now'} →</Link>
              </article>;
            })}
          </div>
        </section>
      ) : null}

      {visibleEmployees.length ? (
        <section className="profile-section portal-team-section">
          <div className="profile-section-head">
            <div>
              <p className="eyebrow">Access scope</p>
              <h2>
                {portalUser.role === 'manager'
                  ? 'My Team'
                  : portalUser.role === 'delivery_reviewer'
                    ? 'Assigned Reviews'
                    : 'All Employees'}
              </h2>
              <p>Only employee profiles available to this account appear here.</p>
            </div>
          </div>
          <div className="evidence-grid portal-employee-grid">
            {visibleEmployees.map((employee) => (
              <article className="evidence-card" key={employee.slug}>
                <div className="evidence-card-top">
                  <strong>{employee.full_name}</strong>
                  <span className="tracker-status status-good">Authorized</span>
                </div>
                <Link className="card-link" href={`/team/${employee.slug}`}>Open Performance Card →</Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
