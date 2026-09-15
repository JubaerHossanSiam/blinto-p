import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requirePortalUser } from '@/lib/access';
import { people } from '@/lib/people';
import { getCareerLevel } from '@/lib/performance-profile';
import { getPerformanceRecord } from '@/lib/performance-records';

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const { portalUser } = await requirePortalUser();

  if (portalUser.role !== 'admin' && portalUser.role !== 'people_ops') {
    redirect('/unauthorized');
  }

  return (
    <section className="dashboard-shell">
      <div className="shell">
        <div className="dashboard-head">
          <div>
            <p className="eyebrow">Blinto Team</p>
            <h1>Employee Performance Cards</h1>
            <p>Organization-wide performance access for Admin and People Ops.</p>
          </div>
        </div>

        <div className="info-box" style={{ marginBottom: 22 }}>
          <strong>Website = performance card · ClickUp = work evidence</strong>
          ClickUp remains the operational source of truth for task-level scoring and review evidence. Delivery Reviewer input is qualitative monthly feedback that summarizes this evidence; it does not add a second score.
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="team-table">
            <thead>
              <tr><th>Employee</th><th>Role</th><th>Review manager</th><th>Delivery reviewer</th><th>Assessment cycle</th><th>Proposed career</th><th>Card</th></tr>
            </thead>
            <tbody>
              {people.map((person) => {
                const record = getPerformanceRecord(person.slug);
                const level = getCareerLevel(record.career.proposedLevel);

                return (
                  <tr key={person.slug}>
                    <td>
                      <Link href={`/team/${person.slug}`}><strong>{person.name}</strong></Link><br />
                      <span style={{ color: 'var(--muted)', fontSize: 11 }}>{person.function}</span>
                    </td>
                    <td>{person.role}</td>
                    <td><strong>{record.reviewManager ?? person.manager}</strong></td>
                    <td>{record.deliveryReviewer ? <><strong>{record.deliveryReviewer}</strong><br /><span style={{ color: 'var(--muted)', fontSize: 11 }}>Feedback only</span></> : <span style={{ color: 'var(--muted)' }}>Covered by review manager</span>}</td>
                    <td>Oct 1–Dec 10, 2026</td>
                    <td>
                      <strong>Proposed {record.career.proposedLevel ?? '—'}</strong><br />
                      <span style={{ color: 'var(--muted)', fontSize: 11 }}>{level?.salaryBand ?? 'Under assessment'}</span>
                    </td>
                    <td><Link className="card-link" href={`/team/${person.slug}`}>Open card →</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
