import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { SiteHeader } from '@/components/site-header';

import './globals.css';
import './performance-profile.css';

export const metadata: Metadata = {
  title: {
    default: 'Blinto Performance',
    template: '%s · Blinto Performance',
  },
  description: 'Blinto team performance, role expectations, KPI reviews, and career framework.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="shell footer-inner">
            <span>Blinto Performance</span>
            <span>Performance evidence → role assessment → career decision</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
