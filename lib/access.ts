import { cache } from 'react';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { databaseConfigured, db } from '@/lib/db';

export type PortalRole = 'employee' | 'manager' | 'delivery_reviewer' | 'people_ops' | 'admin';

export type PortalUser = {
  email: string;
  employeeSlug: string | null;
  role: PortalRole;
  active: boolean;
};

export type ViewAsOption = {
  email: string;
  employeeSlug: string | null;
  role: PortalRole;
  name: string;
};

const VIEW_AS_COOKIE = 'blinto_view_as';

/**
 * Memoized per request: the root layout, the page, and any nested helper all
 * ask for the same account, and every call is a ~250ms round trip to Neon.
 * `cache()` is request-scoped, so a signed-in user's row is read once per
 * navigation instead of once per caller.
 */
export const getPortalUser = cache(async function getPortalUser(
  email: string,
): Promise<PortalUser | null> {
  if (!databaseConfigured) return null;

  const result = await db.query<{
    email: string;
    employee_slug: string | null;
    role: PortalRole;
    is_active: boolean;
  }>(
    `select email, employee_slug, role, is_active
       from approved_users
      where lower(email) = lower($1)
      limit 1`,
    [email],
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    email: row.email,
    employeeSlug: row.employee_slug,
    role: row.role,
    active: row.is_active,
  };
});

export async function getViewAsOptions(): Promise<ViewAsOption[]> {
  if (!databaseConfigured) return [];

  const result = await db.query<{
    email: string;
    employee_slug: string | null;
    role: PortalRole;
    name: string;
  }>(
    `select au.email,
            au.employee_slug,
            au.role,
            coalesce(e.full_name, u.name, au.email) as name
       from approved_users au
       left join employees e on e.slug = au.employee_slug
       left join "user" u on lower(u.email) = lower(au.email)
      where au.is_active = true
      order by coalesce(e.full_name, u.name, au.email), au.email`,
  );

  return result.rows.map((row) => ({
    email: row.email,
    employeeSlug: row.employee_slug,
    role: row.role,
    name: row.name,
  }));
}

/**
 * The employees whose ClickUp tasks this account may see, as slugs.
 *
 * Employees see only themselves. Managers additionally see their direct
 * reports, and People Ops / Admin see everyone. Delivery reviewers are
 * deliberately limited to themselves: their review assignments grant access to
 * performance profiles, not to day-to-day task lists.
 */
export async function getTaskVisibleEmployeeSlugs(current: PortalUser): Promise<string[]> {
  if (!current.active || !databaseConfigured) return [];

  if (current.role === 'admin' || current.role === 'people_ops') {
    const result = await db.query<{ slug: string }>(
      `select slug from employees where is_active = true order by full_name`,
    );
    return result.rows.map((row) => row.slug);
  }

  if (!current.employeeSlug) return [];

  if (current.role === 'manager') {
    const result = await db.query<{ slug: string }>(
      `select slug
         from employees
        where manager_slug = $1
          and is_active = true
          and slug <> $1
        order by full_name`,
      [current.employeeSlug],
    );
    return [current.employeeSlug, ...result.rows.map((row) => row.slug)];
  }

  return [current.employeeSlug];
}

export async function isApprovedEmail(email?: string | null) {
  if (!email || !databaseConfigured) return false;
  const user = await getPortalUser(email);
  return Boolean(user?.active);
}

/**
 * Memoized per request for the same reason as `getPortalUser`: the root layout
 * (app/layout.tsx) and the page below it both need the current account, and
 * without this the whole session + approved_users chain ran once for each.
 */
export const getCurrentPortalUser = cache(async function getCurrentPortalUser() {
  if (!databaseConfigured) return null;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.email) return null;

  const actualPortalUser = await getPortalUser(session.user.email);
  if (!actualPortalUser?.active) return null;

  let portalUser = actualPortalUser;
  let viewingAs: PortalUser | null = null;

  if (actualPortalUser.role === 'admin') {
    const cookieStore = await cookies();
    const requestedEmail = cookieStore.get(VIEW_AS_COOKIE)?.value;

    if (requestedEmail && requestedEmail.toLowerCase() !== actualPortalUser.email.toLowerCase()) {
      const requestedUser = await getPortalUser(requestedEmail);
      if (requestedUser?.active) {
        portalUser = requestedUser;
        viewingAs = requestedUser;
      }
    }
  }

  return { session, portalUser, actualPortalUser, viewingAs };
});

export async function requirePortalUser() {
  const current = await getCurrentPortalUser();
  if (!current) redirect('/sign-in');
  return current;
}

export async function isDirectManager(managerSlug: string, employeeSlug: string) {
  const result = await db.query(
    `select 1
       from employees
      where slug = $1
        and manager_slug = $2
        and is_active = true
      limit 1`,
    [employeeSlug, managerSlug],
  );
  return result.rowCount === 1;
}

async function isAssignedReviewer(reviewerSlug: string, employeeSlug: string) {
  const result = await db.query(
    `select 1
       from review_assignments
      where employee_slug = $1
        and reviewer_slug = $2
        and is_active = true
      limit 1`,
    [employeeSlug, reviewerSlug],
  );
  return result.rowCount === 1;
}

export async function canViewEmployeeProfile(current: PortalUser, employeeSlug: string) {
  if (!current.active) return false;
  if (current.role === 'admin' || current.role === 'people_ops') return true;
  if (current.employeeSlug === employeeSlug) return true;
  if (!current.employeeSlug) return false;

  if (current.role === 'manager' && await isDirectManager(current.employeeSlug, employeeSlug)) return true;
  if (current.role === 'delivery_reviewer' && await isAssignedReviewer(current.employeeSlug, employeeSlug)) return true;

  return false;
}

export async function requireEmployeeProfileAccess(employeeSlug: string) {
  const current = await requirePortalUser();
  const allowed = await canViewEmployeeProfile(current.portalUser, employeeSlug);
  if (!allowed) redirect('/unauthorized');
  return current;
}
