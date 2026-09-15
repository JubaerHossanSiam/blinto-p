'use client';

import { useEffect, useRef, useState } from 'react';

import { authClient } from '@/lib/auth-client';
import type { PortalRole, ViewAsOption } from '@/lib/access';

type ProfileMenuProps = {
  name?: string | null;
  email: string;
  actualRole: PortalRole;
  viewingAsEmail: string | null;
  viewAsOptions: ViewAsOption[];
};

const roleLabels: Record<PortalRole, string> = {
  employee: 'Employee',
  manager: 'Manager',
  delivery_reviewer: 'Delivery Reviewer',
  people_ops: 'People Ops',
  admin: 'Admin',
};

export function ProfileMenu({ name, email, actualRole, viewingAsEmail, viewAsOptions }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const label = name?.trim() || email;
  const initial = label.charAt(0).toUpperCase();
  const selectedView = viewAsOptions.find((option) => option.email.toLowerCase() === viewingAsEmail?.toLowerCase());

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

  async function switchView(targetEmail: string) {
    setSwitching(true);
    const response = await fetch('/api/view-as', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail || null }),
    });

    if (response.ok) {
      window.location.href = '/portal';
      return;
    }

    setSwitching(false);
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
          <small>{selectedView ? `Viewing as ${selectedView.name}` : 'Account'}</small>
        </span>
        <span className="profile-chevron" aria-hidden="true">⌄</span>
      </button>

      {open ? (
        <div className="profile-popover" role="menu">
          <div className="profile-popover-user">
            <strong>{name || 'Blinto employee'}</strong>
            <span>{email}</span>
          </div>

          {actualRole === 'admin' && viewAsOptions.length ? (
            <div className="profile-view-as">
              <label htmlFor="profile-view-as-select">View as</label>
              <select
                id="profile-view-as-select"
                value={viewingAsEmail ?? ''}
                disabled={switching}
                onChange={(event) => switchView(event.target.value)}
              >
                <option value="">CEO / Admin — my real access</option>
                {viewAsOptions
                  .filter((option) => option.email.toLowerCase() !== email.toLowerCase())
                  .map((option) => (
                    <option value={option.email} key={option.email}>
                      {option.name} — {roleLabels[option.role]}
                    </option>
                  ))}
              </select>
              <small>
                {selectedView
                  ? `You are seeing exactly what ${selectedView.name} can access. Your login remains ${email}.`
                  : 'Choose a real approved user to test their exact portal access.'}
              </small>
            </div>
          ) : null}

          <a href="/portal" role="menuitem" onClick={() => setOpen(false)}>Dashboard</a>
          <button type="button" role="menuitem" onClick={signOut}>Sign out</button>
        </div>
      ) : null}
    </div>
  );
}
