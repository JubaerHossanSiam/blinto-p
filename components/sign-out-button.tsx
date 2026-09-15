'use client';

import { authClient } from '@/lib/auth-client';

export function SignOutButton() {
  return (
    <button
      className="button button-secondary button-small"
      type="button"
      onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/sign-in'; } } })}
    >
      Sign out
    </button>
  );
}
