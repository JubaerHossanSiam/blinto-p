import type { Metadata } from 'next';
import Link from 'next/link';
import { MarkdownPage } from '@/components/markdown-page';
import { readFrameworkFile } from '@/lib/content';

export const metadata: Metadata = {
  title: 'System Rules',
  description: 'Blinto performance evidence, rating authority, validation, and monthly review rules.',
};

export default function PerformanceRulesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <p className="eyebrow">How the system works</p>
          <h1 className="page-title">Performance System Rules</h1>
          <p className="page-subtitle">One shared rulebook for employees, managers, reviewers, and administrators.</p>
          <div className="info-box guide-intro">
            <strong>Simple principle:</strong> performance evidence must be attributable, observable, authorized, and traceable.
          </div>
        </div>
      </section>
      <div className="shell content-layout">
        <aside className="side-card">
          <strong>Related references</strong>
          <nav className="guide-index" aria-label="Related performance references">
            <Link href="/task-rating-guide">Task Rating Guide</Link>
            <Link href="/review-process">Review Process</Link>
            <Link href="/framework">Performance Framework</Link>
          </nav>
        </aside>
        <div className="guide-sections">
          <section className="guide-section">
            <MarkdownPage content={readFrameworkFile('performance-rules.md')} />
          </section>
        </div>
      </div>
    </>
  );
}
