import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { getPortalUser } from '@/lib/access';

const VIEW_AS_COOKIE = 'blinto_view_as';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const actualUser = await getPortalUser(session.user.email);
  if (!actualUser?.active || actualUser.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as { email?: string | null } | null;
  const email = body?.email?.trim() || '';
  const cookieStore = await cookies();

  if (!email || email.toLowerCase() === actualUser.email.toLowerCase()) {
    cookieStore.delete(VIEW_AS_COOKIE);
    return NextResponse.json({ ok: true, viewingAs: null });
  }

  const target = await getPortalUser(email);
  if (!target?.active) {
    return NextResponse.json({ error: 'Approved active user not found' }, { status: 404 });
  }

  cookieStore.set(VIEW_AS_COOKIE, target.email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.json({ ok: true, viewingAs: target.email });
}
