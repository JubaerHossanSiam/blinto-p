'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { PortalRole } from '@/lib/access';

const nav = [
  ['Dashboard', '/portal'],
  ['Framework', '/framework'],
  ['Rating Guide', '/task-rating-guide'],
  ['Rules', '/rules'],
  ['Career Levels', '/career-levels'],
  ['Roles', '/roles'],
  ['Review Process', '/review-process'],
] as const;

type MobileNavProps = {
  role: PortalRole;
};

export function MobileNav({ role }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const canViewTeam = role === 'admin' || role === 'people_ops';
  // Mirrors the desktop header: plain employees are not offered the board.
  const canViewTasks = role !== 'employee';

  return (
    <div className="mobile-nav">
      <button
        className="mobile-nav-trigger"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="mobile-nav-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      {open ? (
        <>
          <button className="mobile-nav-backdrop" type="button" aria-label="Close navigation" onClick={() => setOpen(false)} />
          <nav id="mobile-navigation" className="mobile-nav-panel" aria-label="Mobile navigation">
            <div className="mobile-nav-heading">
              <span>Navigation</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation">×</button>
            </div>
            <div className="mobile-nav-links">
              {nav.map(([label, href]) => (
                <Link href={href} key={href} onClick={() => setOpen(false)}>{label}<span aria-hidden="true">→</span></Link>
              ))}
              {canViewTasks ? (
                <Link href="/tasks" onClick={() => setOpen(false)}>Tasks<span aria-hidden="true">→</span></Link>
              ) : null}
              {canViewTeam ? (
                <Link href="/team" onClick={() => setOpen(false)}>Team<span aria-hidden="true">→</span></Link>
              ) : null}
            </div>
          </nav>
        </>
      ) : null}
    </div>
  );
}
