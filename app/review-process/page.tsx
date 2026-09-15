import type { Metadata } from 'next';
import Link from 'next/link';

import { MarkdownPage } from '@/components/markdown-page';
import { readFrameworkFile } from '@/lib/content';

export const metadata: Metadata = { title: 'Review Process' };

export default function ReviewProcessPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <p className="eyebrow">Launch Sep 16 · Trial Sep 20–30 · Counted evidence Oct 1–Dec 10, 2026</p>
          <h1 className="page-title">Test first. Count real evidence from October.</h1>
          <p className="page-subtitle">The portal launches September 16. September 20–30 is a live trial for every employee, with clearly marked test data that does not count toward career assessment. The official evidence window starts October 1 and closes December 10.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18 }}>
        <div className="shell timeline">
          <div className="timeline-step"><span className="timeline-number">1</span><strong>Sep 16</strong><span>Employee portal launch</span></div>
          <div className="timeline-step"><span className="timeline-number">2</span><strong>Sep 20–30</strong><span>Live trial · test reviews for everyone · not counted</span></div>
          <div className="timeline-step"><span className="timeline-number">3</span><strong>Oct 1–Dec 10</strong><span>Official career-assessment evidence window</span></div>
          <div className="timeline-step"><span className="timeline-number">4</span><strong>Dec 11–16 → Jan 1</strong><span>Calibrate + discuss → announce Dec 16 → effective Jan 1</span></div>
        </div>
      </section>

      <section className="shell panel" style={{ marginBottom: 24 }}><h2>September trial reviews</h2><p>Every employee has a September trial review so the complete workflow can be tested before October. September values are simulated/test data and are excluded from the career-assessment calculation.</p><Link className="button" href="/team/ifrat/reviews/2026-09">Open a September trial review</Link></section>

      <div className="shell content-layout">
        <aside className="side-card">
          <strong>Decision rule</strong>
          <p>September never counts toward the career decision. October and November completed monthly reviews are the counted quantitative history; work and role evidence through December 10 also informs the career assessment. A score does not automatically confirm or change a career level.</p>
        </aside>
        <div>
          <MarkdownPage content={readFrameworkFile('monthly-kpi-review.md')} />
          <div style={{ height: 18 }} />
          <MarkdownPage content={readFrameworkFile('final-assessment.md')} />
        </div>
      </div>
    </>
  );
}
