import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { MonthlyReview } from '@/components/monthly-review';
import { getPerson, people } from '@/lib/people';

const monthMap: Record<string, string> = {
  '2026-09': 'September',
  '2026-10': 'October',
  '2026-11': 'November',
  '2026-12': 'December',
};

type PageProps = { params: Promise<{ slug: string; month: string }> };

export function generateStaticParams() {
  return people.flatMap((person) => Object.keys(monthMap).map((month) => ({ slug: person.slug, month })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, month } = await params;
  const person = getPerson(slug);
  const monthLabel = monthMap[month];
  return {
    title: person && monthLabel ? `${person.name} · ${monthLabel} 2026 Review` : 'Monthly Performance Review',
    robots: { index: false, follow: false },
  };
}

export default async function EmployeeMonthlyReviewPage({ params }: PageProps) {
  const { slug, month } = await params;
  const person = getPerson(slug);
  const monthLabel = monthMap[month];
  if (!person || !monthLabel) notFound();

  return <MonthlyReview employeeName={person.name} employeeSlug={person.slug} monthKey={month} monthLabel={monthLabel} />;
}
