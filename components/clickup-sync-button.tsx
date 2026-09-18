'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ClickUpSyncButton() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('Bypass the 5-minute cache and fetch fresh ClickUp evidence now.');

  async function syncNow() {
    setState('syncing');
    setMessage('Fetching fresh ClickUp data…');
    try {
      const response = await fetch('/api/integrations/clickup/sync', { method: 'POST' });
      const data = await response.json() as { ok?: boolean; message?: string; employeesSynced?: number; ratedTasks?: number };
      if (!response.ok || !data.ok) throw new Error(data.message || 'Sync failed.');
      setState('done');
      setMessage(`${data.message} ${data.ratedTasks ?? 0} rated task records found in the trial window.`);
      router.refresh();
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Unable to sync ClickUp.');
    }
  }

  return (
    <div className="profile-card">
      <span className="card-kicker">ClickUp data</span>
      <h2>Manual test sync</h2>
      <p>{message}</p>
      <button className="button" type="button" onClick={syncNow} disabled={state === 'syncing'}>
        {state === 'syncing' ? 'Syncing…' : 'Sync ClickUp now'}
      </button>
      {state === 'done' ? <span className="tracker-status status-good" style={{ marginLeft: 12 }}>Synced</span> : null}
      {state === 'error' ? <span className="tracker-status status-risk" style={{ marginLeft: 12 }}>Failed</span> : null}
    </div>
  );
}
