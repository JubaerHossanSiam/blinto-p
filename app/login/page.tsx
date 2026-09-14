'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { currentUser, HrmsApiError, signIn } from '@/lib/hrms-client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    currentUser().then((user) => {
      if (user) router.replace('/me');
    }).catch(() => undefined);
  }, [router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await signIn(email, password);
      router.replace('/me');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof HrmsApiError ? cause.message : 'Unable to sign in right now.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={onSubmit}>
        <p className="eyebrow">Blinto HRMS</p>
        <h1>Sign in to your performance profile</h1>
        <p>Use the same credentials you use for Blinto HRMS.</p>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </div>

        {error ? <div className="form-error">{error}</div> : null}
        <button className="button button-block" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="login-note">Authentication stays in HRMS. Blinto Performance does not store your password or session token.</p>
      </form>
    </div>
  );
}
