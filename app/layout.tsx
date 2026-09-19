import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';

import { SiteHeader } from '@/components/site-header';
import { getCurrentPortalUser, getViewAsOptions } from '@/lib/access';

import './globals.css';
import './performance-profile.css';
import './responsive.css';
import './mobile-nav.css';
import './role-preview.css';

export const metadata: Metadata = {
  title: {
    default: 'Blinto Performance',
    template: '%s · Blinto Performance',
  },
  description: 'Blinto employee performance portal.',
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const current = await getCurrentPortalUser();
  const viewAsOptions = current?.actualPortalUser.role === 'admin' ? await getViewAsOptions() : [];

  return (
    <html lang="en">
      <body>
        {current ? (
          <SiteHeader
            userName={current.session.user.name}
            userEmail={current.session.user.email}
            actualRole={current.actualPortalUser.role}
            effectiveRole={current.portalUser.role}
            viewingAsEmail={current.viewingAs?.email ?? null}
            viewAsOptions={viewAsOptions}
          />
        ) : null}
        <main>{children}</main>
        {current ? (
          <footer className="site-footer">
            <div className="shell footer-inner">
              <span>Blinto Performance · <Link href="/task-rating-guide">Task Rating Guide</Link> · <Link href="/rules">System Rules</Link></span>
              <span>Performance evidence → role assessment → career decision</span>
            </div>
          </footer>
        ) : null}
      </body>
    </html>
  );
}
