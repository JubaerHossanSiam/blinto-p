import type { Metadata } from 'next';
import Link from 'next/link';

import { MarkdownPage } from '@/components/markdown-page';
import { readFrameworkFile } from '@/lib/content';

export const metadata: Metadata = { title: 'Career Levels' };

const ladders = [
  ['Engineering', 'engineering'],
  ['Design', 'design'],
  ['Growth', 'growth'],
  ['Project Delivery', 'project-delivery'],
  ['People, Operations & Finance', 'people-operations-finance'],
] as const;

export default function CareerLevelsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <p className="eyebrow">Career</p>
          <h1 className="page-title">Career Leveling Framework</h1>
          <p className="page-subtitle">The reference for evaluating scope, independence, impact, and role maturity. No employee has a level assigned yet.</p>
        </div>
      </section>
      <div className="shell content-layout">
        <aside className="side-card">
          <strong>Department ladders</strong>
          {ladders.map(([name, slug]) => (
            <Link className="card-link" style={{ display: 'block', marginTop: 10 }} href={`/career-levels/${slug}`} key={slug}>{name} →</Link>
          ))}
        </aside>
        <MarkdownPage content={readFrameworkFile('career-framework.md')} />
      </div>
    </>
  );
}
