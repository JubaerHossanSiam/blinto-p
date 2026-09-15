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
    <div>
      <button className="button" type="button" disabled={pending} onClick={signIn}>
        {pending ? 'Opening Google…' : 'Continue with Google'}
      </button>
      {error ? <p className="review-notice" role="alert">{error}</p> : null}
    </div>
  );
}
