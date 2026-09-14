import Link from 'next/link';

import { people } from '@/lib/people';

export default function TeamPage() {
  return (
    <section className="dashboard-shell">
      <div className="shell">
        <div className="dashboard-head">
          <div>
            <p className="eyebrow">Blinto Team</p>
            <h1>Employee Performance Profiles</h1>
            <p>Role Success Plan, deliverables, monthly KPI tracker, and 2027 career assessment for the 15 employees in the standard performance framework.</p>
          </div>
        </div>

        <div className="info-box" style={{ marginBottom: 22 }}>
          <strong>One profile, three connected systems</strong>
          Role expectations and deliverables define what success means. Monthly KPI reviews show how performance is trending. The annual career assessment uses sustained evidence to determine the first career level for January 2027.
        </div>

        <table className="team-table">
          <thead>
            <tr><th>Employee</th><th>Role</th><th>Role plan</th><th>KPI cycle</th><th>Career</th></tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.slug}>
                <td>
                  <Link href={`/team/${person.slug}`}><strong>{person.name}</strong></Link><br />
                  <span style={{ color: 'var(--muted)', fontSize: 11 }}>{person.function}</span>
                </td>
                <td>{person.role}</td>
                <td><span className="tracker-status status-good">Assigned</span></td>
                <td>Oct–Dec 2026</td>
                <td>Level not assigned</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
