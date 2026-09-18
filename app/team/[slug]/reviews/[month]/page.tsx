import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { MonthlyReview } from '@/components/monthly-review';
import { ManagerReviewForm } from '@/components/manager-review-form';
import { SeptemberTrialReview } from '@/components/september-trial-review';
import { requireEmployeeProfileAccess } from '@/lib/access';
import { getLiveClickUpEvidence } from '@/lib/clickup-performance';
import { getMonthlyHrmsScore } from '@/lib/hrms-performance';
import { getManagerMonthlyReview } from '@/lib/manager-monthly-review';
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

  const access = await requireEmployeeProfileAccess(slug);
  const managerReview = await getManagerMonthlyReview(slug, month);
  const canEditManagerReview = (access.actualPortalUser.role === 'admin' && !access.viewingAs)
    || (access.portalUser.role === 'manager' && access.portalUser.employeeSlug !== slug);

  if (month === '2026-09') {
    const clickUpEvidence = await getLiveClickUpEvidence(person, month);
    return <><SeptemberTrialReview employeeName={person.name} employeeSlug={person.slug} clickUpEvidence={clickUpEvidence} /><div className="shell"><ManagerReviewForm employeeSlug={person.slug} monthKey={month} initial={managerReview} canEdit={canEditManagerReview} clickUpScore={clickUpEvidence.score} /></div></>;
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
