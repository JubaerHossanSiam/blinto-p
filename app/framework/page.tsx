import type { Metadata } from 'next';
import Link from 'next/link';

import { MarkdownPage } from '@/components/markdown-page';
import { readFrameworkFile } from '@/lib/content';

export const metadata: Metadata = { title: 'Performance Framework' };

export default function FrameworkPage() {
  const content = readFrameworkFile('kpi-framework.md');

  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <p className="eyebrow">Performance</p>
          <h1 className="page-title">100-Point KPI Framework</h1>
          <p className="page-subtitle">The common evidence model used for monthly performance reviews across Blinto.</p>
        </div>
      </section>
      <div className="shell content-layout">
        <aside className="side-card">
          <strong>Important</strong>
          <p>A KPI score measures performance evidence. It does not automatically assign or change a career level.</p>
          <Link className="card-link" href="/task-rating-guide">Task rating guide →</Link>
          <Link className="card-link" href="/review-process">Review process →</Link>
        </aside>
        <MarkdownPage content={content} />
      </div>
    </>
  );
}
