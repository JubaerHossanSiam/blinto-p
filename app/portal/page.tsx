import Link from 'next/link';

import { requirePortalUser } from '@/lib/access';
import { db } from '@/lib/db';

type VisibleEmployee = {
  slug: string;
  full_name: string;
};

export const dynamic = 'force-dynamic';

export default async function PortalPage() {
  const { session, portalUser } = await requirePortalUser();
  const isCEO = portalUser.email.toLowerCase() === 'fazle@blinto.co';

  let visibleEmployees: VisibleEmployee[] = [];

  if (portalUser.role === 'admin' || portalUser.role === 'people_ops') {
    const result = await db.query<VisibleEmployee>(
      `select slug, full_name from employees where is_active = true order by full_name`,
    );
    visibleEmployees = result.rows;
  } else if (portalUser.role === 'manager' && portalUser.employeeSlug) {
    const result = await db.query<VisibleEmployee>(
      `select slug, full_name
         from employees
        where manager_slug = $1
          and is_active = true
        order by full_name`,
      [portalUser.employeeSlug],
    );
    visibleEmployees = result.rows;
  } else if (portalUser.role === 'delivery_reviewer' && portalUser.employeeSlug) {
    const result = await db.query<VisibleEmployee>(
      `select distinct e.slug, e.full_name
         from review_assignments ra
         join employees e on e.slug = ra.employee_slug
        where ra.reviewer_slug = $1
          and ra.is_active = true
          and e.is_active = true
        order by e.full_name`,
      [portalUser.employeeSlug],
    );
    visibleEmployees = result.rows;
  }

  return (
    <main className="shell portal-shell">
      <section className="portal-intro">
        <p className="eyebrow">Blinto Performance Portal</p>
        <h1 className="page-title">Welcome, {session.user.name || session.user.email}</h1>
        <p className="page-subtitle">
          {isCEO
            ? 'Company performance, team visibility, and the shared performance framework in one place.'
            : 'Your performance, career framework, and permitted team access in one place.'}
        </p>
      </section>

      <div className="profile-two-col portal-primary-grid">
        {isCEO ? (
          <section className="profile-card profile-card-dark">
            <span className="card-kicker">CEO Dashboard</span>
            <h2>Company & Team Performance</h2>
            <p>Review employee performance, review completion, career progress, and organization-wide performance evidence.</p>
            <Link className="button" href="/team">Open team performance →</Link>
          </section>
        ) : (
          <section className="profile-card profile-card-dark">
            <span className="card-kicker">My Performance</span>
            <h2>My Performance Card</h2>
            {portalUser.employeeSlug ? (
              <>
                <p>Review your monthly KPI history, manager feedback, evidence, and career assessment.</p>
                <Link className="button" href={`/team/${portalUser.employeeSlug}`}>Open my card →</Link>
              </>
            ) : (
              <p>Your approved account is not linked to an employee profile. People Ops can add the employee mapping.</p>
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

      {visibleEmployees.length ? (
        <section className="profile-section portal-team-section">
          <div className="profile-section-head">
            <div>
              <p className="eyebrow">Access scope</p>
              <h2>{portalUser.role === 'manager' ? 'My Team' : portalUser.role === 'delivery_reviewer' ? 'Assigned Reviews' : 'All Employees'}</h2>
              <p>Only employee profiles permitted by your role and reporting relationships appear here.</p>
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
