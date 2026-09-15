import type { Metadata } from 'next';
import Link from 'next/link';

import { people } from '@/lib/people';

export const metadata: Metadata = { title: 'Role Success Plans' };

export default function RolesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <p className="eyebrow">Role</p>
          <h1 className="page-title">Role Success Plans</h1>
          <p className="page-subtitle">Role expectations, functions, and reporting ownership across Blinto&apos;s standard performance framework.</p>
        </div>
      </section>
      <section className="shell role-grid">
        {people.map((person) => (
          <Link className="card role-card" href={`/roles/${person.slug}`} key={person.slug}>
            <span className="function">{person.function}</span>
            <h3>{person.name}</h3>
            <span className="role">{person.role}</span>
            <span className="role" style={{ marginTop: 10 }}><strong>Manager:</strong> {person.manager}</span>
            <span className="card-link">View role profile →</span>
          </Link>
        ))}
      </section>
    </>
  );
}
