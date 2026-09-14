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

  return <>{slug === 'ifrat' ? <div className="shell info-box" style={{ marginTop: 24 }}><strong>Monthly review pilot available</strong><Link className="card-link" href="/review-test/ifrat">Open separate test review →</Link><p>Simulated data; excluded from this official performance card.</p></div> : null}<EmployeePerformanceProfile person={person} roleProfile={roleProfile} /></>;
}
