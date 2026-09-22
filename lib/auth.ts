import { betterAuth } from 'better-auth';

import { databaseConfigured, db } from '@/lib/db';

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
  baseURL: process.env.BETTER_AUTH_URL,
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
