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
    copy: 'Use sustained evidence and role scope to confirm or adjust the proposed career level. KPI score alone never determines level.',
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
              A single place for Blinto&apos;s Employee Performance Cards, Role Success Plans, KPI reviews,
              proposed career levels, salary bands, and the 2027 career-level assessment.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/team">Open Performance Cards</Link>
              <Link className="button button-secondary" href="/framework">Explore the framework</Link>
            </div>
          </div>

          <aside className="hero-panel" aria-label="2027 career assessment timeline">
            <p className="eyebrow muted">2027 Career Level Assessment</p>
            <h2>Propose first.<br />Confirm with evidence.</h2>
            <div className="assessment-row"><span>Confirmed level</span><strong>Not assigned</strong></div>
            <div className="assessment-row"><span>Proposed level</span><strong>Available per employee</strong></div>
            <div className="assessment-row"><span>Review window</span><strong>Oct 1–Dec 10, 2026</strong></div>
            <div className="assessment-row"><span>Final communication</span><strong>Dec 16, 2026</strong></div>
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
            <p>Completed October–November reviews and supporting evidence through December 10 provide the evidence used to confirm or adjust each employee&apos;s proposed career level.</p>
          </div>
          <div className="timeline">
            <div className="timeline-step"><span className="timeline-number">1</span><strong>Now</strong><span>Proposed career level + salary band</span></div>
            <div className="timeline-step"><span className="timeline-number">2</span><strong>Oct–Nov</strong><span>Monthly KPI reviews + evidence</span></div>
            <div className="timeline-step"><span className="timeline-number">3</span><strong>December 11–16</strong><span>Calibrate by Dec 15 · announce Dec 16</span></div>
            <div className="timeline-step"><span className="timeline-number">4</span><strong>January 2027</strong><span>Confirmed level + approved salary changes</span></div>
          </div>
        </div>
      </section>
    </>
  );
}
