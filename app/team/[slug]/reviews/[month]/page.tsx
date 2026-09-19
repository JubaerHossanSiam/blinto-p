import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ManagerReviewForm } from '@/components/manager-review-form';
import { SeptemberTrialReview } from '@/components/september-trial-review';
import { isDirectManager, requireEmployeeProfileAccess } from '@/lib/access';
import { getLiveClickUpEvidence } from '@/lib/clickup-performance';
import { getManagerMonthlyReview } from '@/lib/manager-monthly-review';
import { getMonthlyHrmsScores } from '@/lib/hrms-performance';
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
  const [managerReview, hrmsScores] = await Promise.all([
    getManagerMonthlyReview(slug, month),
    person.hrmsEmployeeId ? getMonthlyHrmsScores(person.hrmsEmployeeId, month) : Promise.resolve(null),
  ]);
  const canEditManagerReview = (access.actualPortalUser.role === 'admin' && !access.viewingAs)
    || (access.portalUser.role === 'manager' && Boolean(access.portalUser.employeeSlug) && await isDirectManager(access.portalUser.employeeSlug!, slug));

  if (month === '2026-09') {
    const clickUpEvidence = await getLiveClickUpEvidence(person, month);
    return <><SeptemberTrialReview employeeName={person.name} employeeSlug={person.slug} clickUpEvidence={clickUpEvidence} hrmsScores={hrmsScores} /><div className="shell"><ManagerReviewForm employeeSlug={person.slug} monthKey={month} initial={managerReview} canEdit={canEditManagerReview} clickUpScore={clickUpEvidence.score} /></div></>;
  }

  const clickUpEvidence = await getLiveClickUpEvidence(person, month);

  return (
    <div className="shell review-lab">
      <header className="review-lab-header">
        <p className="eyebrow">Official monthly performance review</p>
        <h1 className="page-title">{person.name} · {monthLabel} 2026</h1>
        <p className="page-subtitle">Official score = authority-verified ClickUp task evidence /80 + manager monthly assessment /20. Only verified completed-task evidence counts.</p>
      </header>

      <section className="panel">
        <h2>Verified task KPI evidence</h2>
        <div className="info-box"><strong>{clickUpEvidence.score === undefined ? 'Insufficient Evidence' : `${clickUpEvidence.score.toFixed(1)} / 80`}</strong><p>{clickUpEvidence.ratedTasks} verified completed task{clickUpEvidence.ratedTasks === 1 ? '' : 's'} recorded for {monthLabel}.</p></div>
        <div className="kpi-table-wrap">
          <table className="kpi-score-table">
            <thead><tr><th>KPI</th><th>Verified average</th><th>Rated tasks</th></tr></thead>
            <tbody>{clickUpEvidence.kpis.map((kpi) => <tr key={kpi.label}><td><strong>{kpi.label}</strong></td><td>{kpi.average === undefined ? '—' : `${kpi.average.toFixed(1)} / 10`}</td><td>{kpi.ratedTasks}</td></tr>)}</tbody>
          </table>
        </div>
        {clickUpEvidence.message ? <p className="career-note">{clickUpEvidence.message}</p> : null}
      </section>

      <ManagerReviewForm employeeSlug={person.slug} monthKey={month} initial={managerReview} canEdit={canEditManagerReview} clickUpScore={clickUpEvidence.score} />
    </div>
  );
}
