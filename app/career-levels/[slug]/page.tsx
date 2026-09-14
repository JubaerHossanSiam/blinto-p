import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { MarkdownPage } from '@/components/markdown-page';
import { readFrameworkFile } from '@/lib/content';

const ladders = {
  engineering: { name: 'Engineering', file: 'career-ladder-engineering.md' },
  design: { name: 'Design', file: 'career-ladder-design.md' },
  growth: { name: 'Growth', file: 'career-ladder-growth.md' },
  'project-delivery': { name: 'Project Delivery', file: 'career-ladder-project-delivery.md' },
  'people-operations-finance': { name: 'People, Operations & Finance', file: 'career-ladder-people-operations-finance.md' },
} as const;

type LadderSlug = keyof typeof ladders;
type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(ladders).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const ladder = ladders[slug as LadderSlug];
  return { title: ladder ? `${ladder.name} Career Ladder` : 'Career Ladder' };
}

export default async function CareerLadderPage({ params }: PageProps) {
  const { slug } = await params;
  const ladder = ladders[slug as LadderSlug];
  if (!ladder) notFound();

  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <p className="eyebrow">Department Career Ladder</p>
          <h1 className="page-title">{ladder.name}</h1>
          <p className="page-subtitle">Reference criteria for December 2026 career-level assessment and future development conversations.</p>
        </div>
      </section>
      <div className="narrow" style={{ paddingBottom: 70 }}>
        <MarkdownPage content={readFrameworkFile(ladder.file)} />
      </div>
    </>
  );
}
