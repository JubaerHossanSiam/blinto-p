'use client';

import { useEffect, useRef, useState } from 'react';

import { authClient } from '@/lib/auth-client';

type ProfileMenuProps = {
  name?: string | null;
  email: string;
};

export function ProfileMenu({ name, email }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const label = name?.trim() || email;
  const initial = label.charAt(0).toUpperCase();

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/sign-in';
        },
      },
    });
  }

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        className="profile-trigger"
        type="button"
        aria-label="Open profile menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="profile-avatar" aria-hidden="true">{initial}</span>
        <span className="profile-trigger-copy">
          <strong>{label}</strong>
          <small>Account</small>
        </span>
        <span className="profile-chevron" aria-hidden="true">⌄</span>
      </button>

      {open ? (
        <div className="profile-popover" role="menu">
          <div className="profile-popover-user">
            <strong>{name || 'Blinto employee'}</strong>
            <span>{email}</span>
          </div>
          <a href="/portal" role="menuitem" onClick={() => setOpen(false)}>Dashboard</a>
          <button type="button" role="menuitem" onClick={signOut}>Sign out</button>
        </div>
      ) : null}
    </div>
  );
}
