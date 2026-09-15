import Link from 'next/link';

import { SignOutButton } from '@/components/sign-out-button';
import { requirePortalUser } from '@/lib/access';
import { db } from '@/lib/db';

type VisibleEmployee = {
  slug: string;
  full_name: string;
};

export const dynamic = 'force-dynamic';

export default async function PortalPage() {
  const { session, portalUser } = await requirePortalUser();

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
    <main className="shell" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <div className="profile-heading-row">
        <div>
          <p className="eyebrow">Blinto Performance Portal</p>
          <h1 className="page-title">Welcome, {session.user.name || session.user.email}</h1>
          <p className="page-subtitle">Your access is based on your approved account, role, and reporting relationships.</p>
        </div>
        <SignOutButton />
      </div>

      <div className="profile-two-col" style={{ marginTop: 28 }}>
        <section className="profile-card profile-card-dark">
          <span className="card-kicker">My Performance</span>
          <h2>My Performance Card</h2>
          {portalUser.employeeSlug ? (
            <>
              <p>Open your permanent performance record, monthly KPI history, manager feedback, and career assessment.</p>
              <Link className="button" href={`/team/${portalUser.employeeSlug}`}>Open my card →</Link>
            </>
          ) : (
            <p>Your approved account is not linked to an employee profile yet. People Ops can add the employee mapping in Neon.</p>
          )}
        </section>

        <section className="profile-card">
          <span className="card-kicker">Shared framework</span>
          <h2>How performance works</h2>
          <p>These references are common across Blinto and explain the scoring, task ratings, career levels, and review process.</p>
          <div className="hero-actions">
            <Link className="button button-secondary" href="/framework">KPI Framework</Link>
            <Link className="button button-secondary" href="/task-rating-guide">Task Rating Guide</Link>
            <Link className="button button-secondary" href="/career-levels">Career Levels</Link>
            <Link className="button button-secondary" href="/review-process">Review Process</Link>
          </div>
        </section>
      </div>

      {visibleEmployees.length ? (
        <section className="profile-section" style={{ marginTop: 40 }}>
          <div className="profile-section-head">
            <div>
              <p className="eyebrow">Access scope</p>
              <h2>{portalUser.role === 'manager' ? 'My Team' : portalUser.role === 'delivery_reviewer' ? 'Assigned Reviews' : 'All Employees'}</h2>
              <p>Only profiles permitted by your role and reporting relationships are listed here.</p>
            </div>
          </div>
          <div className="evidence-grid">
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
