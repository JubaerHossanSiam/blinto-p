import { headers } from 'next/headers';
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

export async function getPortalUser(email: string): Promise<PortalUser | null> {
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
}

export async function isApprovedEmail(email?: string | null) {
  if (!email || !databaseConfigured) return false;
  const user = await getPortalUser(email);
  return Boolean(user?.active);
}

export async function getCurrentPortalUser() {
  if (!databaseConfigured) return null;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.email) return null;

  const portalUser = await getPortalUser(session.user.email);
  if (!portalUser?.active) return null;

  return { session, portalUser };
}

export async function requirePortalUser() {
  const current = await getCurrentPortalUser();
  if (!current) redirect('/sign-in');
  return current;
}

async function isDirectManager(managerSlug: string, employeeSlug: string) {
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
