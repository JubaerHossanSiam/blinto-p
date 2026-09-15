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
