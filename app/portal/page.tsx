import Link from 'next/link';

import { requirePortalUser, type PortalRole } from '@/lib/access';
import { db } from '@/lib/db';

type VisibleEmployee = {
  slug: string;
  full_name: string;
};

type PreviewIdentity = {
  role: PortalRole;
  employee_slug: string | null;
  full_name: string | null;
};

const previewRoles: PortalRole[] = ['employee', 'manager', 'delivery_reviewer', 'people_ops', 'admin'];

const roleLabels: Record<PortalRole, string> = {
  employee: 'Employee',
  manager: 'Manager',
  delivery_reviewer: 'Delivery Reviewer',
  people_ops: 'People Ops',
  admin: 'Admin',
};

export const dynamic = 'force-dynamic';

async function getPreviewIdentity(role: PortalRole): Promise<PreviewIdentity | null> {
  if (role === 'admin') return { role: 'admin', employee_slug: null, full_name: 'CEO' };

  const result = await db.query<PreviewIdentity>(
    `select au.role, au.employee_slug, e.full_name
       from approved_users au
       left join employees e on e.slug = au.employee_slug
      where au.role = $1
        and au.is_active = true
      order by e.full_name nulls last, au.email
      limit 1`,
    [role],
  );

  return result.rows[0] ?? null;
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

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ viewAs?: string }>;
}) {
  const { session, portalUser } = await requirePortalUser();
  const params = await searchParams;

  const requestedRole = previewRoles.includes(params.viewAs as PortalRole)
    ? (params.viewAs as PortalRole)
    : null;
  const previewEnabled = portalUser.role === 'admin' && requestedRole !== null;
  const previewIdentity = previewEnabled ? await getPreviewIdentity(requestedRole!) : null;

  const effectiveRole = previewIdentity?.role ?? portalUser.role;
  const effectiveEmployeeSlug = previewIdentity?.employee_slug ?? portalUser.employeeSlug;
  const effectiveName = previewIdentity?.full_name ?? session.user.name ?? session.user.email;
  const visibleEmployees = await getVisibleEmployees(effectiveRole, effectiveEmployeeSlug);

  const isCeoAccount = portalUser.role === 'admin' && !portalUser.employeeSlug && !previewEnabled;
  const showPersonalPerformance = !isCeoAccount && Boolean(effectiveEmployeeSlug);

  return (
    <main className="shell portal-shell">
      {portalUser.role === 'admin' ? (
        <section className="role-preview-bar" aria-label="Role preview">
          <div>
            <span className="role-preview-label">View as</span>
            <strong>{previewEnabled ? roleLabels[effectiveRole] : 'CEO / Admin'}</strong>
            {previewEnabled && previewIdentity?.full_name ? (
              <small>Previewing the dashboard experience using {previewIdentity.full_name} as the sample account.</small>
            ) : (
              <small>Your real permissions remain unchanged while previewing another role.</small>
            )}
          </div>
          <nav className="role-preview-options" aria-label="Preview portal by role">
            <Link className={!previewEnabled ? 'is-active' : ''} href="/portal">CEO</Link>
            {previewRoles.map((role) => (
              <Link
                className={previewEnabled && effectiveRole === role ? 'is-active' : ''}
                href={`/portal?viewAs=${role}`}
                key={role}
              >
                {roleLabels[role]}
              </Link>
            ))}
          </nav>
        </section>
      ) : null}

      <section className="portal-intro">
        <p className="eyebrow">Blinto Performance Portal</p>
        <h1 className="page-title">
          {previewEnabled ? `${roleLabels[effectiveRole]} view` : `Welcome, ${effectiveName}`}
        </h1>
        <p className="page-subtitle">
          {previewEnabled
            ? 'This is a safe interface preview only. Your signed-in account still keeps its real Admin permissions.'
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
                <Link className="button" href={`/team/${effectiveEmployeeSlug}`}>Open my card →</Link>
              </>
            ) : (
              <p>This role has portal access but is not linked to an employee Performance Card.</p>
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
              <h2>
                {effectiveRole === 'manager'
                  ? 'My Team'
                  : effectiveRole === 'delivery_reviewer'
                    ? 'Assigned Reviews'
                    : 'All Employees'}
              </h2>
              <p>Only employee profiles available to this role appear in the preview.</p>
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
