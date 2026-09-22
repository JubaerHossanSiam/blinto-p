import { betterAuth } from 'better-auth';

import { databaseConfigured, db } from '@/lib/db';

function toOrigin(value?: string | null) {
  if (!value) return undefined;
  try {
    return new URL(value.trim()).origin;
  } catch {
    return undefined;
  }
}

// Better Auth trusts exactly one origin by default — the one derived from
// baseURL — and answers every other POST to /api/auth/* with 403 "Invalid
// origin". On Vercel that single origin is never enough: production, each
// preview build and local dev all answer on different hostnames, and a
// BETTER_AUTH_URL left pointing at localhost breaks sign-in outright.
//
// Vercel injects both of these at runtime: VERCEL_PROJECT_PRODUCTION_URL is the
// stable production hostname, VERCEL_URL the hostname of the deployment
// actually serving this request (a throwaway one on previews). Neither carries
// a scheme.
const vercelProductionURL = toOrigin(
  process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
);

const vercelDeploymentURL = toOrigin(
  process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
);

// A loopback BETTER_AUTH_URL is correct locally and never correct on a
// deployment, so it is discarded when running on Vercel rather than being
// allowed to poison redirect_uri. Copying .env.local into the Vercel project
// verbatim is exactly how this portal ended up serving
// redirect_uri=http://localhost:3000/... from production.
function usableAuthURL() {
  const configured = toOrigin(process.env.BETTER_AUTH_URL);
  if (!configured) return undefined;
  if (!process.env.VERCEL) return process.env.BETTER_AUTH_URL;
  const { hostname } = new URL(configured);
  const loopback = hostname === 'localhost' || hostname === '::1' || hostname.startsWith('127.');
  return loopback ? undefined : process.env.BETTER_AUTH_URL;
}

// baseURL decides the redirect_uri sent to Google, and Google only redirects
// back to URIs registered in the Cloud console — so it has to stay one fixed,
// registered origin. Preview builds consequently land on the production domain
// once sign-in completes; registering every preview hostname is not possible.
const baseURL = usableAuthURL() ?? vercelProductionURL;

// The sign-in POST still has to be accepted from wherever the browser is, which
// is why preview hostnames are trusted even though they are not valid
// redirect targets. Anything else (a custom domain, a tunnel, 127.0.0.1) goes
// in BETTER_AUTH_TRUSTED_ORIGINS as a comma-separated list.
const trustedOrigins = [
  vercelProductionURL,
  vercelDeploymentURL,
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '').split(',').map(toOrigin),
].filter((origin): origin is string => Boolean(origin));

async function approvedGoogleEmail(email?: string | null) {
  if (!email || !databaseConfigured) return false;
  const result = await db.query(
    `select 1
       from approved_users
      where lower(email) = lower($1)
        and is_active = true
      limit 1`,
    [email],
  );
  return result.rowCount === 1;
}

export const auth = betterAuth({
  database: db,
  baseURL,
  trustedOrigins,
  secret: process.env.BETTER_AUTH_SECRET,
  // NOTE: session.cookieCache is deliberately NOT enabled here.
  //
  // It looks like an easy win — it would serve the session from a signed
  // cookie instead of a ~250ms round trip to Neon. But turning it on makes
  // getSession() run setCookieCache(), which writes a cookie, and that path
  // threw "Failed to get session" (better-auth wraps any error inside
  // getSession in APIError FAILED_TO_GET_SESSION). getSession() is called from
  // the root layout and every page, i.e. during render, so if you revisit this
  // idea it needs to be driven from proxy.ts or a route handler — somewhere a
  // cookie write is legal — with the render side reading via getCookieCache().
  //
  // The per-request duplication this was meant to solve is handled instead by
  // the React cache() wrappers in lib/access.ts.
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      requireEmailVerification: true,
    },
  },
  user: {
    validateUserInfo: async ({ user, source }) => {
      if (source.oauth?.providerId !== 'google') {
        return {
          error: 'google_only',
          errorDescription: 'Use your approved Google account to sign in.',
        };
      }

      if (!await approvedGoogleEmail(user.email)) {
        return {
          error: 'email_not_approved',
          errorDescription: 'This Google account is not approved for the Blinto Performance Portal.',
        };
      }
    },
  },
});
