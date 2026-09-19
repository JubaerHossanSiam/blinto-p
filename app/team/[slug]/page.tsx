import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ClickUpPerformanceEvidence } from '@/components/clickup-performance-evidence';
import { EmployeePerformanceProfile } from '@/components/employee-performance-profile';
import { requireEmployeeProfileAccess } from '@/lib/access';
import { getLiveClickUpEvidence } from '@/lib/clickup-performance';
import { readFrameworkFile } from '@/lib/content';
import { getPerson, people } from '@/lib/people';
import { parseRoleProfile } from '@/lib/performance-profile';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ slug: string }> };

function currentDhakaMonthKey() {
  const parts = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', timeZone: 'Asia/Dhaka' }).formatToParts(new Date());
  const year = parts.find((part) => part.type === 'year')?.value ?? '2026';
  const month = parts.find((part) => part.type === 'month')?.value ?? '09';
  return `${year}-${month}`;
}

function evidenceMonthKeys(endKey: string) {
  const keys: string[] = [];
  let year = 2026;
  let month = 9;
  while (`${year}-${String(month).padStart(2, '0')}` <= endKey) {
    keys.push(`${year}-${String(month).padStart(2, '0')}`);
    month += 1;
    if (month === 13) { month = 1; year += 1; }
  }
  return keys;
}

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
  const activeMonthKey = currentDhakaMonthKey();
  const monthKeys = evidenceMonthKeys(activeMonthKey);
  const monthlyClickUpEvidence = await Promise.all(
    monthKeys.map(async (monthKey) => ({ monthKey, evidence: await getLiveClickUpEvidence(person, monthKey) })),
  );
  const clickUpEvidence = monthlyClickUpEvidence.find((item) => item.monthKey === activeMonthKey)?.evidence
    ?? await getLiveClickUpEvidence(person, activeMonthKey);

  return (
    <>
      <EmployeePerformanceProfile person={person} roleProfile={roleProfile} clickUpEvidence={clickUpEvidence} />
      <ClickUpPerformanceEvidence evidence={clickUpEvidence} monthlyEvidence={monthlyClickUpEvidence} defaultMonthKey={activeMonthKey} />

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
