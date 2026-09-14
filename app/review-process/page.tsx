import type { Metadata } from 'next';

import { MarkdownPage } from '@/components/markdown-page';
import { readFrameworkFile } from '@/lib/content';

export const metadata: Metadata = { title: 'Review Process' };

export default function ReviewProcessPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <p className="eyebrow">October–December 2026</p>
          <h1 className="page-title">Review now. Level for 2027.</h1>
          <p className="page-subtitle">Three monthly performance reviews create the evidence base. Career-level assessment remains a separate leadership decision.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18 }}>
        <div className="shell timeline">
          <div className="timeline-step"><span className="timeline-number">1</span><strong>October review</strong><span>First formal evidence month</span></div>
          <div className="timeline-step"><span className="timeline-number">2</span><strong>November review</strong><span>Second month + trend</span></div>
          <div className="timeline-step"><span className="timeline-number">3</span><strong>December review</strong><span>Third month + assessment evidence</span></div>
          <div className="timeline-step"><span className="timeline-number">4</span><strong>Dec 31 → Jan 1</strong><span>Communicate level → level becomes active</span></div>
        </div>
      </section>

      <div className="shell content-layout">
        <aside className="side-card">
          <strong>Decision rule</strong>
          <p>Monthly KPI performance is important evidence, but a high score does not automatically produce a higher career level. Role scope, independence, sustained impact, and ladder expectations must be calibrated.</p>
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
