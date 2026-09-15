'use client';

import { useState } from 'react';

import { authClient } from '@/lib/auth-client';

export function SignInButton() {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function signIn() {
    setPending(true);
    setError('');

    const result = await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/portal',
    });

    if (result.error) {
      setError(result.error.message ?? 'Google sign-in failed.');
      setPending(false);
    }
  }

  return (
    <div className="signin-action">
      <button className="google-signin-button" type="button" disabled={pending} onClick={signIn}>
        <span className="google-mark" aria-hidden="true">G</span>
        <span>{pending ? 'Opening Google…' : 'Continue with Google'}</span>
      </button>
      {error ? <p className="signin-error" role="alert">{error}</p> : null}
    </div>
  );
}
