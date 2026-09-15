'use client';

import Link from 'next/link';
import { useState } from 'react';

const nav = [
  ['Dashboard', '/portal'],
  ['Framework', '/framework'],
  ['Rating Guide', '/task-rating-guide'],
  ['Career Levels', '/career-levels'],
  ['Roles', '/roles'],
  ['Review Process', '/review-process'],
  ['Team', '/team'],
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);

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
            </div>
          </nav>
        </>
      ) : null}
    </div>
  );
}
