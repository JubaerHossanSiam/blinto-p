'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import type { RatingIntegrityIssue, RatingIntegritySummary } from '@/lib/rating-integrity';

export function RatingIntegrityPanel({ summary, issues, canValidate = false }: { summary: RatingIntegritySummary; issues: RatingIntegrityIssue[]; canValidate?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function act(issue: RatingIntegrityIssue, action: 'validate' | 'reject') {
    const key = `${issue.taskId}:${issue.fieldId}:${issue.employeeSlug}`;
    setBusy(key);
    await fetch(`/api/rating-integrity/${encodeURIComponent(issue.taskId)}/${encodeURIComponent(issue.fieldId)}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action, employeeSlug: issue.employeeSlug }),
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <section className="profile-section">
      <div className="profile-section-head">
        <div>
          <p className="eyebrow">Rating Integrity · October 2026</p>
          <h2>Performance evidence exceptions</h2>
          <p>Only exceptions need attention. Normal verified ratings continue into KPI calculations without manual review.</p>
        </div>
      </div>
      <div className="metric-grid">
        <div className="metric"><span>Eligible tasks</span><strong>{summary.eligible}</strong></div>
        <div className="metric"><span>Verified</span><strong>{summary.verified}</strong></div>
        <div className="metric"><span>Needs validation</span><strong>{summary.needsValidation}</strong></div>
        <div className="metric"><span>Invalid</span><strong>{summary.invalid}</strong></div>
      </div>
      <div className="panel" style={{ marginTop: 14 }}>
        <h2>Requires attention</h2>
        {!issues.length ? <p>No rating-integrity exceptions for October.</p> : issues.map((issue) => {
          const key = `${issue.taskId}:${issue.fieldId}:${issue.employeeSlug}`;
          return (
            <div className="review-row" key={key}>
              <div><strong>{issue.employeeName}</strong><p>{issue.status === 'invalid' ? 'Invalid' : 'Needs validation'}</p></div>
              <div>
                <a href={issue.taskUrl} target="_blank" rel="noreferrer"><strong>{issue.taskName}</strong></a>
                <p>{issue.currentLabel ?? 'No rating'} · by {issue.actorName ?? 'Unknown'} · {issue.reason}</p>
              </div>
              {canValidate ? <div style={{ display: 'flex', gap: 6 }}>
                <button className="button button-small" disabled={busy === key} onClick={() => act(issue, 'validate')}>Validate</button>
                <button className="button button-secondary button-small" disabled={busy === key} onClick={() => act(issue, 'reject')}>Reject</button>
              </div> : <span className="tag">CEO validation</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
