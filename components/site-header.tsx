import Link from 'next/link';

const nav = [
  ['Framework', '/framework'],
  ['Rating Guide', '/task-rating-guide'],
  ['Career Levels', '/career-levels'],
  ['Roles', '/roles'],
  ['Review Process', '/review-process'],
  ['Team', '/team'],
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/">
          <span className="brand-mark">B</span>
          <span>
            <strong>Blinto Performance</strong>
            <small>Team Performance Framework</small>
          </span>
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          {nav.map(([label, href]) => (
            <Link href={href} key={href}>{label}</Link>
          ))}
        </nav>
        <Link className="button button-small" href="/team">Performance Cards</Link>
      </div>
    </header>
  );
}
