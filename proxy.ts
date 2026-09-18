import { NextRequest, NextResponse } from 'next/server';

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

  const session = await auth.api.getSession({ headers: request.headers });
  const email = session?.user?.email;
  const portalUser = email ? await getPortalUser(email) : null;
  const approved = Boolean(portalUser?.active);

  if (PUBLIC_PATHS.includes(pathname)) {
    if (approved && pathname === '/sign-in') {
      return NextResponse.redirect(new URL('/portal', request.url));
    }
    return NextResponse.next();
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
