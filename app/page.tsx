import Link from 'next/link';

const pillars = [
  {
    kicker: 'Performance',
    title: 'Monthly KPI reviews',
    copy: 'Use observable work evidence and the 100-point framework to review performance consistently.',
    href: '/framework',
  },
  {
    kicker: 'Role',
    title: 'Role Success Plans',
    copy: 'Make each role mission, responsibilities, success measures, and expectations visible to the team.',
    href: '/roles',
  },
  {
    kicker: 'Career',
    title: 'Career assessment',
    copy: 'Use sustained evidence and role scope to propose a career level. KPI score alone never determines level.',
    href: '/career-levels',
  },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div>
            <p className="eyebrow">Blinto Team Performance</p>
            <h1>Know the role. See the evidence. Grow with clarity.</h1>
            <p className="hero-copy">
              A single place for Blinto&apos;s employee performance profiles, Role Success Plans, KPI reviews,
              and the 2027 career-level assessment.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/team">Open Employee Profiles</Link>
              <Link className="button button-secondary" href="/framework">Explore the framework</Link>
            </div>
          </div>

          <aside className="hero-panel" aria-label="2027 career assessment timeline">
            <p className="eyebrow muted">2027 Career Level Assessment</p>
            <h2>Evidence first.<br />Level second.</h2>
            <div className="assessment-row"><span>Current level</span><strong>Not assigned</strong></div>
            <div className="assessment-row"><span>Review window</span><strong>Oct–Dec 2026</strong></div>
            <div className="assessment-row"><span>Level communicated</span><strong>By Dec 31, 2026</strong></div>
            <div className="assessment-row"><span>Effective date</span><strong>Jan 1, 2027</strong></div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <h2>Three connected systems</h2>
            <p>Performance provides evidence. Role expectations provide context. Career decisions require judgment and calibration.</p>
          </div>
          <div className="grid-3">
            {pillars.map((pillar) => (
              <Link className="card" href={pillar.href} key={pillar.title}>
                <span className="card-kicker">{pillar.kicker}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.copy}</p>
                <span className="card-link">Explore →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-head">
            <h2>First leveling cycle</h2>
            <p>The October–December review period establishes evidence for Blinto&apos;s first proposed employee levels.</p>
          </div>
          <div className="timeline">
            <div className="timeline-step"><span className="timeline-number">1</span><strong>October</strong><span>First formal monthly KPI review</span></div>
            <div className="timeline-step"><span className="timeline-number">2</span><strong>November</strong><span>Second review and performance trend</span></div>
            <div className="timeline-step"><span className="timeline-number">3</span><strong>December</strong><span>Third review + career-level calibration</span></div>
            <div className="timeline-step"><span className="timeline-number">4</span><strong>January 2027</strong><span>Confirmed level becomes active</span></div>
          </div>
        </div>
      </section>
    </>
  );
}
