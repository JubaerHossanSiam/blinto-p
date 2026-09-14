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
        <strong>Current review workspace · October 2026</strong>
        <Link className="card-link" href="/monthly-reviews/ifrat">Open October review workspace →</Link>
        <p>This is the working form for the current monthly review. The finalized, approved result belongs on this Performance Card; the workspace is not a second performance record.</p>
      </div>
    ) : null}
    <EmployeePerformanceProfile person={person} roleProfile={roleProfile} />
  </>;
}
