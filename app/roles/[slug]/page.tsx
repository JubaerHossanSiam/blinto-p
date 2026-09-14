import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { MarkdownPage } from '@/components/markdown-page';
import { readFrameworkFile } from '@/lib/content';
import { getPerson, people } from '@/lib/people';

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return people.map((person) => ({ slug: person.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const person = getPerson(slug);
  return { title: person ? `${person.name} · Role Success Plan` : 'Role Success Plan' };
}

export default async function RoleProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const person = getPerson(slug);
  if (!person) notFound();

  const content = readFrameworkFile(person.roleFile);

  return (
    <>
      <section className="page-hero">
        <div className="shell profile-top">
          <div className="profile-meta">
            <p className="eyebrow">{person.function}</p>
            <h1>{person.name}</h1>
            <p>{person.role}</p>
          </div>
          <span className="status-pill"><span className="status-dot" /> Career level not assigned</span>
        </div>
      </section>
      <div className="shell content-layout">
        <aside className="side-card">
          <strong>2027 Level Assessment</strong>
          <p>Evidence window: October–December 2026. Proposed level communicated by December 31 and effective January 1, 2027.</p>
        </aside>
        <MarkdownPage content={content} />
      </div>
    </>
  );
}
