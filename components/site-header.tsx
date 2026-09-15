import Link from 'next/link';

import { MobileNav } from '@/components/mobile-nav';
import { ProfileMenu } from '@/components/profile-menu';
import type { PortalRole, ViewAsOption } from '@/lib/access';

const nav = [
  ['Framework', '/framework'],
  ['Rating Guide', '/task-rating-guide'],
  ['Career Levels', '/career-levels'],
  ['Roles', '/roles'],
  ['Review Process', '/review-process'],
] as const;

type SiteHeaderProps = {
  userName?: string | null;
  userEmail: string;
  actualRole: PortalRole;
  effectiveRole: PortalRole;
  viewingAsEmail: string | null;
  viewAsOptions: ViewAsOption[];
};

export function SiteHeader({ userName, userEmail, actualRole, effectiveRole, viewingAsEmail, viewAsOptions }: SiteHeaderProps) {
  const canViewTeam = effectiveRole === 'admin' || effectiveRole === 'people_ops';

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
          {canViewTeam ? <Link href="/team">Team</Link> : null}
        </nav>

        <div className="header-actions">
          <MobileNav role={effectiveRole} />
          <ProfileMenu
            name={userName}
            email={userEmail}
            actualRole={actualRole}
            viewingAsEmail={viewingAsEmail}
            viewAsOptions={viewAsOptions}
          />
        </div>
      </div>
    </header>
  );
}
