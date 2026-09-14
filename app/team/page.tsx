import Link from 'next/link';

import { people } from '@/lib/people';

export default function TeamPage() {
  return (
    <section className="dashboard-shell">
      <div className="shell">
        <div className="dashboard-head">
          <div>
            <p className="eyebrow">Blinto Team</p>
            <h1>Performance Framework Roster</h1>
            <p>15 employees currently included in the standard Blinto performance and 2027 leveling process.</p>
          </div>
        </div>

        <div className="info-box" style={{ marginBottom: 22 }}>
          <strong>Standalone V1</strong>
          This page is maintained from the framework repository. Authentication, employee accounts, and HRMS integration are intentionally out of scope for now.
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
