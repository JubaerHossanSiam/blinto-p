'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { currentUser, HrmsApiError, listUsers } from '@/lib/hrms-client';
import { people } from '@/lib/people';

export default function TeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    currentUser()
      .then(async (user) => {
        if (!user) {
          router.replace('/login');
          return;
        }

        try {
          await listUsers();
          setAllowed(true);
        } catch (error) {
          if (!(error instanceof HrmsApiError) || (error.status !== 401 && error.status !== 403)) throw error;
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="shell skeleton">Checking HR access…</div>;

  if (!allowed) {
    return (
      <section className="dashboard-shell">
        <div className="shell empty-state">
          <h2>HR / leadership access only</h2>
          <p>Your HRMS account is signed in, but it does not have permission to view the organization user directory.</p>
          <Link className="button button-secondary" href="/me">Back to My Performance</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-shell">
      <div className="shell">
        <div className="dashboard-head">
          <div>
            <p className="eyebrow">HR / Leadership</p>
            <h1>Team Performance</h1>
            <p>15 employees in the standard Blinto performance and 2027 leveling process.</p>
          </div>
        </div>

        <table className="team-table">
          <thead>
            <tr><th>Employee</th><th>Role</th><th>Career level</th><th>2027 assessment</th></tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.slug}>
                <td><Link href={`/roles/${person.slug}`}><strong>{person.name}</strong></Link><br /><span style={{ color: 'var(--muted)', fontSize: 11 }}>{person.function}</span></td>
                <td>{person.role}</td>
                <td>Not assigned</td>
                <td>Oct–Dec 2026 evidence window</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
