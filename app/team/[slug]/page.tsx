import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EmployeePerformanceProfile } from '@/components/employee-performance-profile';
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
        <strong>September 2026 baseline review · In review</strong>
        <Link className="card-link" href="/monthly-reviews/ifrat">Open September review workspace →</Link>
        <p>September is being used to test the full review flow with visible values before the formal October–December cycle. The Performance Card below is the permanent view; the workspace is where the baseline values are reviewed and adjusted.</p>
      </div>
    ) : null}
    <EmployeePerformanceProfile person={person} roleProfile={roleProfile} />
  </>;
}
