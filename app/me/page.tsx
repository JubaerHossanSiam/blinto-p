'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { currentUser, type HrmsUser, signOut } from '@/lib/hrms-client';
import { people } from '@/lib/people';

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function profileForUser(user: HrmsUser) {
  const fullName = user.name ?? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  const nameKey = normalize(fullName);
  const emailKey = normalize(user.email.split('@')[0] ?? '');

  return people.find((person) => {
    const personKey = normalize(person.name);
    const slugKey = normalize(person.slug);
    return Boolean(nameKey && (nameKey.includes(personKey) || personKey.includes(nameKey))) || emailKey.includes(slugKey);
  });
}

export default function MyPerformancePage() {
  const router = useRouter();
  const [user, setUser] = useState<HrmsUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    currentUser()
      .then((sessionUser) => {
        if (!sessionUser) {
          router.replace('/login');
          return;
        }
        setUser(sessionUser);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const profile = useMemo(() => user ? profileForUser(user) : undefined, [user]);

  async function handleSignOut() {
    await signOut().catch(() => undefined);
    router.replace('/login');
  }

  if (loading || !user) {
    return <div className="shell skeleton">Loading your performance profile…</div>;
  }

  const profileName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  const displayName = user.name ?? (profileName || user.email);

  return (
    <section className="dashboard-shell">
      <div className="shell">
        <div className="dashboard-head">
          <div>
            <p className="eyebrow">My Performance</p>
            <h1>{displayName}</h1>
            <p>{profile?.role ?? 'Blinto team member'}{profile ? ` · ${profile.function}` : ''}</p>
          </div>
          <button className="button button-secondary" onClick={handleSignOut}>Sign out</button>
        </div>

        <div className="metric-grid">
          <div className="metric"><span>Career level</span><strong>Not assigned</strong></div>
          <div className="metric"><span>Evidence window</span><strong>Oct–Dec 2026</strong></div>
          <div className="metric"><span>Level communication</span><strong>By Dec 31</strong></div>
          <div className="metric"><span>Effective</span><strong>Jan 1, 2027</strong></div>
        </div>

        <div className="dashboard-grid">
          <div className="panel">
            <h2>2026 review cycle</h2>
            <div className="review-row"><strong>October</strong><p>Monthly KPI review and evidence capture</p><span className="tag">Review month</span></div>
            <div className="review-row"><strong>November</strong><p>Monthly KPI review and performance trend</p><span className="tag">Review month</span></div>
            <div className="review-row"><strong>December</strong><p>Monthly KPI review + career assessment evidence</p><span className="tag">Review month</span></div>
            <div className="info-box" style={{ marginTop: 18 }}>
              <strong>KPI dashboard connection</strong>
              This V1 is connected to HRMS authentication. Individual KPI scores will appear here when the HRMS KPI/review API is exposed; no placeholder scores are being invented.
            </div>
          </div>

          <div className="panel">
            <h2>Role & career</h2>
            {profile ? (
              <>
                <p className="card-kicker">Role Success Plan</p>
                <h3 style={{ margin: '8px 0 8px' }}>{profile.role}</h3>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>Your role expectations are the context for both monthly performance reviews and the December career-level assessment.</p>
                <Link className="button button-secondary" style={{ marginTop: 18 }} href={`/roles/${profile.slug}`}>View Role Success Plan</Link>
              </>
            ) : (
              <div className="info-box">
                <strong>Profile mapping needed</strong>
                Your HRMS session is valid, but this account is not yet mapped to one of the 15 framework profiles.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
