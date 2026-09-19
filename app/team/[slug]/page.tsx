import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ClickUpPerformanceEvidence } from '@/components/clickup-performance-evidence';
import { EmployeePerformanceProfile } from '@/components/employee-performance-profile';
import { requireEmployeeProfileAccess } from '@/lib/access';
import { getLiveClickUpEvidence } from '@/lib/clickup-performance';
import { readFrameworkFile } from '@/lib/content';
import { getPerson, people } from '@/lib/people';
import { getOfficialMonthlyResults } from '@/lib/monthly-performance-results';
import { parseRoleProfile } from '@/lib/performance-profile';

export const dynamic = 'force-dynamic';

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

  await requireEmployeeProfileAccess(slug);

  const roleContent = readFrameworkFile(person.roleFile);
  const roleProfile = parseRoleProfile(roleContent);
  const [clickUpEvidence, officialResults] = await Promise.all([getLiveClickUpEvidence(person), getOfficialMonthlyResults(person.slug)]);

  return (
    <>
      <EmployeePerformanceProfile person={person} roleProfile={roleProfile} clickUpEvidence={clickUpEvidence} />
      <ClickUpPerformanceEvidence evidence={clickUpEvidence} />
      {officialResults.length ? <section className="shell profile-sections"><section className="profile-section"><div className="profile-section-head"><div><p className="eyebrow">Official monthly results</p><h2>Finalized performance history</h2><p>Live ClickUp /80 evidence remains visible above. These are the month-end snapshots generated on the 1st and are the official historical results.</p></div></div><div className="evidence-grid">{officialResults.map(result=><article className="evidence-card" key={result.monthKey}><div className="evidence-card-top"><strong>{result.monthKey}</strong><span className={`tracker-status ${result.status==='complete'?'status-good':'status-warn'}`}>{result.status}</span></div><p>ClickUp: {result.clickUpScore===null?'—':`${result.clickUpScore} / 80`} · Manager: {result.managerScore===null?'—':`${result.managerScore} / 20`}</p><strong>{result.finalScore===null?'Official result unavailable':`${result.finalScore} / 100`}</strong></article>)}</div></section></section> : null}

      <section className="shell profile-sections" aria-label="Career level success benchmark">
        <section className="profile-section">
          <div className="profile-section-head">
            <div>
              <p className="eyebrow">Career Level Success Benchmark</p>
              <h2>What the career-level score means</h2>
              <p>Career Level Success measures readiness for the proposed level. It is separate from the monthly KPI score.</p>
            </div>
          </div>

          <div className="career-summary-grid">
            <div className="career-state-card">
              <span>95–100%</span>
              <strong>Strongly ready</strong>
              <p>Confirmed-level strength · midpoint to upper-middle salary-band positioning.</p>
            </div>
            <div className="career-state-card">
              <span>90–94%</span>
              <strong>Clearly ready</strong>
              <p>Eligible for the proposed level · lower-middle to midpoint band positioning.</p>
            </div>
            <div className="career-state-card">
              <span>85–89%</span>
              <strong>Meets benchmark</strong>
              <p>Eligible for the proposed level · normally enters the lower part of the salary band.</p>
            </div>
            <div className="career-state-card">
              <span>Below 85%</span>
              <strong>Not yet ready</strong>
              <p>Remain at the current level and close the identified development gaps.</p>
            </div>
          </div>

          <div className="card-data-note">
            <strong>Critical competency floor</strong>
            <span>Promotion eligibility requires at least 85% overall and no critical career dimension below 70%. Salary positioning also considers sustained maturity, internal equity, market position, and company capacity.</span>
          </div>
        </section>
      </section>
    </>
  );
}
