'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Board-wide refresh. The task list is otherwise served from a 120s cache, so
 * a change made in ClickUp can take up to two minutes to appear; this drops
 * that cache and re-renders the page against live data.
 */
export function TaskSyncButton() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'syncing' | 'error'>('idle');

  async function sync() {
    setState('syncing');
    try {
      const response = await fetch('/api/tasks/refresh', { method: 'POST' });
      if (!response.ok) throw new Error('sync failed');
      router.refresh();
      // The refresh is a server round trip; leaving the button busy until it
      // lands stops a second click firing another full ClickUp fetch.
      setTimeout(() => setState('idle'), 1200);
    } catch {
      setState('error');
    }
  }

  return (
    <button
      className="button button-secondary task-sync-button"
      type="button"
      onClick={sync}
      disabled={state === 'syncing'}
    >
      <span aria-hidden="true" className={`task-sync-icon${state === 'syncing' ? ' task-sync-icon-spin' : ''}`} />
      {state === 'syncing' ? 'Syncing…' : state === 'error' ? 'Retry sync' : 'Sync from ClickUp'}
    </button>
  );
}
