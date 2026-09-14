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
          <h1 className="page-title">Proposed now. Confirmed by evidence.</h1>
          <p className="page-subtitle">Each employee starts with a proposed career level. Three monthly performance reviews create the evidence used to confirm or adjust that proposal.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18 }}>
        <div className="shell timeline">
          <div className="timeline-step"><span className="timeline-number">1</span><strong>Proposed level</strong><span>Starting assessment position</span></div>
          <div className="timeline-step"><span className="timeline-number">2</span><strong>Oct–Nov</strong><span>Monthly KPI reviews + trend</span></div>
          <div className="timeline-step"><span className="timeline-number">3</span><strong>December</strong><span>Third review + leadership calibration</span></div>
          <div className="timeline-step"><span className="timeline-number">4</span><strong>Dec 31 → Jan 1</strong><span>Confirm level → level becomes active</span></div>
        </div>
      </section>

      <div className="shell content-layout">
        <aside className="side-card">
          <strong>Decision rule</strong>
          <p>Monthly KPI performance is important evidence, but a score does not automatically confirm or change a career level. Role scope, independence, sustained impact, and ladder expectations must be calibrated.</p>
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
