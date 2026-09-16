import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { MonthlyReview } from '@/components/monthly-review';
import { SeptemberTrialReview } from '@/components/september-trial-review';
import { requireEmployeeProfileAccess } from '@/lib/access';
import { getMonthlyHrmsScore } from '@/lib/hrms-performance';
import { getPerson, people } from '@/lib/people';

export const dynamic = 'force-dynamic';

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

  await requireEmployeeProfileAccess(slug);

  if (month === '2026-09') {
    return <SeptemberTrialReview employeeName={person.name} employeeSlug={person.slug} />;
  }

  const hrms = await getMonthlyHrmsScore(person.slug, month);

  return (
    <MonthlyReview
      employeeName={person.name}
      employeeSlug={person.slug}
      monthKey={month}
      monthLabel={monthLabel}
      attendanceScore={hrms.attendanceScore}
      leavePolicyScore={hrms.leavePolicyScore}
      hrmsStatus={hrms.syncStatus}
      hrmsSyncedAt={hrms.syncedAt}
    />
  );
}
