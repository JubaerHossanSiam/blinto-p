import Link from 'next/link';

import { people } from '@/lib/people';
import { getCareerLevel } from '@/lib/performance-profile';
import { getPerformanceRecord } from '@/lib/performance-records';

export default function TeamPage() {
  return (
    <section className="dashboard-shell">
      <div className="shell">
        <div className="dashboard-head">
          <div>
            <p className="eyebrow">Blinto Team</p>
            <h1>Employee Performance Cards</h1>
            <p>One employee-facing card for role success, work evidence, monthly KPI reviews, manager feedback, and the 2027 career assessment.</p>
          </div>
        </div>

        <div className="info-box" style={{ marginBottom: 22 }}>
          <strong>Website = performance card · ClickUp = work evidence</strong>
          ClickUp remains the operational source of truth for tasks and review evidence. These cards present the approved performance story clearly for each of the 14 active employees.
        </div>

        <table className="team-table">
          <thead>
            <tr><th>Employee</th><th>Role</th><th>Review manager</th><th>Assessment cycle</th><th>Proposed career</th><th>Card</th></tr>
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
                  <td><strong>{record.reviewManager ?? 'To be assigned'}</strong></td>
                  <td>Oct–Dec 2026</td>
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
    </section>
  );
}
