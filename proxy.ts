import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

import { getPortalUser } from '@/lib/access';
import { auth } from '@/lib/auth';

const PUBLIC_PATHS = ['/sign-in', '/unauthorized', '/api/integrations/clickup/status', '/api/integrations/clickup/webhook'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Better Auth must remain reachable for Google sign-in/callback/session requests.
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Integration endpoints are public at the auth-proxy layer. The webhook itself
  // authenticates ClickUp using its HMAC signature and CLICKUP_WEBHOOK_SECRET.
  if (pathname === '/api/integrations/clickup/status' || pathname === '/api/integrations/clickup/webhook') {
    return NextResponse.next();
  }

  // Signed-out traffic is settled from the cookie alone. This runs on every
  // request the matcher accepts — including every RSC navigation and prefetch —
  // so it must not reach the database unless it actually has to.
  const hasSessionCookie = Boolean(getSessionCookie(request));

  if (!hasSessionCookie) {
    // /unauthorized is reachable signed-out; /sign-in only redirects away when
    // the visitor turns out to be approved, which they cannot be without a session.
    return PUBLIC_PATHS.includes(pathname)
      ? NextResponse.next()
      : NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // These pages render the same signed-in or not, so skip the lookup entirely.
  if (pathname === '/unauthorized') {
    return NextResponse.next();
  }

  // Only signed-in traffic reaches here. getPortalUser stays a live read so a
  // deactivated account loses access immediately rather than at cache expiry.
  const session = await auth.api.getSession({ headers: request.headers });
  const email = session?.user?.email;
  const portalUser = email ? await getPortalUser(email) : null;
  const approved = Boolean(portalUser?.active);

  if (pathname === '/sign-in') {
    return approved
      ? NextResponse.redirect(new URL('/portal', request.url))
      : NextResponse.next();
  }

  if (!session || !email) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (!approved) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
