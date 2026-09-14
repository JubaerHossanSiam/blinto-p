import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { EmployeePerformanceProfile } from '@/components/employee-performance-profile';
import { MonthlyReview } from '@/components/monthly-review';
import { readFrameworkFile } from '@/lib/content';
import { getPerson, people } from '@/lib/people';
import { parseRoleProfile } from '@/lib/performance-profile';

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return people.map((person) => ({ slug: person.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const person = getPerson(slug);
  return { title: person ? `${person.name} · Employee Performance Card` : 'Employee Performance Card' };
}

export default async function TeamMemberPage({ params }: PageProps) {
  const { slug } = await params;
  const person = getPerson(slug);
  if (!person) notFound();

  const roleContent = readFrameworkFile(person.roleFile);
  const roleProfile = parseRoleProfile(roleContent);

  return <>
    {slug === 'ifrat' ? (
      <div className="shell info-box" style={{ marginTop: 24 }}>
        <strong>September 2026 baseline review · Incomplete evidence</strong>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, margin: '16px 0' }}>
          <div><span style={{ display: 'block', opacity: 0.7 }}>Completed tasks</span><strong style={{ fontSize: 24 }}>10</strong></div>
          <div><span style={{ display: 'block', opacity: 0.7 }}>KPI reviewed</span><strong style={{ fontSize: 24 }}>4</strong></div>
          <div><span style={{ display: 'block', opacity: 0.7 }}>Missing KPI review</span><strong style={{ fontSize: 24 }}>6</strong></div>
          <div><span style={{ display: 'block', opacity: 0.7 }}>Coverage</span><strong style={{ fontSize: 24 }}>40%</strong></div>
        </div>
        <p><strong>Finalization gate:</strong> all 10 completed tasks must have their task-level KPI review completed before September can be finalized. The current KPI result is preview-only while 6 task reviews are missing.</p>
        <a className="card-link" href="#review-workspace">Open September review workspace below ↓</a>
      </div>
    ) : null}

    <EmployeePerformanceProfile person={person} roleProfile={roleProfile} />

    {slug === 'ifrat' ? (
      <section id="review-workspace" style={{ scrollMarginTop: 24 }}>
        <MonthlyReview />
      </section>
    ) : null}
  </>;
}
