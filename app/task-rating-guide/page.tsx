import type { Metadata } from 'next';
import Link from 'next/link';
import { MarkdownPage } from '@/components/markdown-page';
import { readFrameworkFile } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Task Rating Guide',
  description: 'Choose ClickUp KPI values using shared standards, field-specific examples, and observable work evidence.',
};

export default function TaskRatingGuidePage() {
  const sections = readFrameworkFile('task-rating-guide.md').split('\n## ').slice(1).map((section, index) => {
    const breakAt = section.indexOf('\n');
    return { id: `guide-${index + 1}`, title: section.slice(0, breakAt), body: section.slice(breakAt + 1) };
  });
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <p className="eyebrow">ClickUp reviewer reference</p>
          <h1 className="page-title">Task Rating Guide</h1>
          <p className="page-subtitle">What to check. Which value to select. What evidence to record.</p>
          <div className="info-box guide-intro"><strong>Effective means expectations were met.</strong>Compare the work with its agreed brief, deadline, and responsibility. Leave a field blank when there is no valid observation.</div>
        </div>
      </section>
      <div className="shell content-layout">
        <aside className="side-card">
          <strong>Jump to a field</strong>
          <nav className="guide-index" aria-label="Rating guide sections">
            {sections.map((section) => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}
          </nav>
          <Link className="card-link" href="/framework">Performance framework →</Link>
        </aside>
        <div className="guide-sections">
          {sections.map((section) => (
            <section className="guide-section" id={section.id} key={section.id}>
              <h2>{section.title}</h2>
              <MarkdownPage content={section.body} />
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
