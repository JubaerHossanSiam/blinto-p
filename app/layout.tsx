import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';

import { SiteHeader } from '@/components/site-header';
import { getCurrentPortalUser } from '@/lib/access';

import './globals.css';
import './performance-profile.css';

export const metadata: Metadata = {
  title: {
    default: 'Blinto Performance',
    template: '%s · Blinto Performance',
  },
  description: 'Blinto employee performance portal.',
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const current = await getCurrentPortalUser();

  return (
    <html lang="en">
      <body>
        {current ? <SiteHeader /> : null}
        <main>{children}</main>
        {current ? (
          <footer className="site-footer">
            <div className="shell footer-inner">
              <span>Blinto Performance · <Link href="/task-rating-guide">Task Rating Guide</Link></span>
              <span>Performance evidence → role assessment → career decision</span>
            </div>
          </footer>
        ) : null}
      </body>
    </html>
  );
}
