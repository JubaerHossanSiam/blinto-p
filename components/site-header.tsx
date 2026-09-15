import Link from 'next/link';

import { MobileNav } from '@/components/mobile-nav';
import { ProfileMenu } from '@/components/profile-menu';

const nav = [
  ['Framework', '/framework'],
  ['Rating Guide', '/task-rating-guide'],
  ['Career Levels', '/career-levels'],
  ['Roles', '/roles'],
  ['Review Process', '/review-process'],
  ['Team', '/team'],
] as const;

type SiteHeaderProps = {
  userName?: string | null;
  userEmail: string;
};

export function SiteHeader({ userName, userEmail }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/portal">
          <span className="brand-mark">B</span>
          <span className="brand-copy">
            <strong>Blinto Performance</strong>
            <small>Team Performance</small>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Primary navigation">
          {nav.map(([label, href]) => (
            <Link href={href} key={href}>{label}</Link>
          ))}
        </nav>

        <div className="header-actions">
          <MobileNav />
          <ProfileMenu name={userName} email={userEmail} />
        </div>
      </div>
    </header>
  );
}
