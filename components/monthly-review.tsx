'use client';

import { useState } from 'react';
import Link from 'next/link';

const ratingLabels = ['Significant Improvement Needed', 'Needs Improvement', 'Effective', 'Strong', 'Exceptional'];
const impactLabels = ['No Meaningful Impact', 'Limited Impact', 'Expected Impact', 'Strong Impact', 'Exceptional Impact'];

const kpis = [
  { name: 'Work Quality', benchmark: 'Strong = consistently accurate, complete work with little avoidable rework.', source: 'ClickUp work evidence' },
  { name: 'Ownership', benchmark: 'Strong = owns outcomes, follows through, and raises risks without being chased.', source: 'ClickUp work evidence' },
  { name: 'Communication', benchmark: 'Strong = clear, timely, audience-appropriate updates that reduce ambiguity.', source: 'ClickUp work evidence' },
  { name: 'Problem Solving', benchmark: 'Strong = diagnoses issues and proposes practical solutions independently.', source: 'ClickUp work evidence' },
  { name: 'Collaboration', benchmark: 'Strong = works constructively across functions and helps unblock others.', source: 'ClickUp work evidence' },
  { name: 'Proactiveness', benchmark: 'Strong = identifies risks and opportunities early and acts before escalation.', source: 'ClickUp work evidence' },
  { name: 'Client / Business Impact', benchmark: 'Strong Impact = work creates clear client, revenue, efficiency, quality, or risk-reduction value.', source: 'ClickUp work evidence' },
  { name: 'Growth & Development', benchmark: 'Strong = demonstrates visible learning and applies it to improve role performance.', source: 'Manager monthly assessment' },
  { name: 'Role Excellence', benchmark: 'Strong = performs the core expectations of the current role/level consistently and independently.', source: 'Manager monthly assessment' },
] as const;

const initial = {
  period: 'September 2026',
  ratings: [5, 4, 4, 4, 4, 3, 3, 3, 4],
  delivery: 10,
  attendance: 10,
  policy: 10,
  strengths: 'Strong ownership, communication, problem solving, and collaboration. Delivery quality was rated Exceptional.',
  improvements: 'Identify delivery risks and improvement opportunities earlier instead of waiting for escalation.',
  priorities: 'Flag delivery risks early and propose at least one practical workflow improvement during the month.',
  support: 'Weekly alignment with Fazle on priorities, blockers, and decisions that need escalation.',
  summary: 'Strong overall contribution, with proactiveness and earlier risk identification as the main development focus.',
  reflection: '',
  meeting: false,
};

type Draft = typeof initial;
const storageKey = 'blinto-ifrat-monthly-review-v1';

export function MonthlyReview() {
  const [draft, setDraft] = useState<Draft>({ ...initial, ratings: [...initial.ratings] });
  const [status, setStatus] = useState('Draft');
  const [notice, setNotice] = useState('');
  const [saved, setSaved] = useState(false);

  const round = (n: number) => Math.round(n * 10) / 10;
  const reliability = round(draft.delivery * 0.6 + draft.attendance * 0.2 + draft.policy * 0.2);
  const total = round(reliability + draft.ratings.reduce((sum, n) => sum + n * 2, 0));
  const band = total >= 90 ? 'Exceptional' : total >= 80 ? 'Strong' : total >= 60 ? 'Effective' : total >= 40 ? 'Needs Improvement' : 'Significant Improvement Needed';
  const feedbackReady = [draft.strengths, draft.improvements, draft.priorities, draft.support, draft.summary].every((s) => s.trim());
  const completeReady = feedbackReady && draft.reflection.trim() && draft.meeting;

  function update<K extends keyof Draft>(field: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setStatus('Draft');
    setSaved(false);
    setNotice('');
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
      setSaved(true);
      setNotice('Draft saved in this browser.');
    } catch {
      setNotice('Could not save in this browser. Copy the review to keep your changes.');
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setNotice('No saved review draft in this browser.');
        return;
      }
      const value = JSON.parse(raw);
      if (!value || !Array.isArray(value.ratings) || value.ratings.length !== 9) throw new Error('Invalid review');
      setDraft(value);
      setSaved(true);
      setStatus('Draft');
      setNotice('Saved review draft loaded.');
    } catch {
      setNotice('Saved draft could not be loaded. Current entries are unchanged.');
    }
  }

  function exportText() {
    return [
      'IFRAT — MONTHLY PERFORMANCE REVIEW',
      'Period: ' + draft.period,
      'Review Manager: Fazle Rabbi',
      'Final score: ' + total.toFixed(1) + '/100 — ' + band,
      '',
      'KPI 1 — Delivery & Reliability: ' + reliability.toFixed(1) + '/10',
      'Delivery: ' + draft.delivery.toFixed(1) + '/10; Attendance: ' + draft.attendance.toFixed(1) + '/10; Policy: ' + draft.policy.toFixed(1) + '/10',
      ...kpis.map((kpi, i) => `${i + 2}. ${kpi.name}: ${(i === 6 ? impactLabels : ratingLabels)[draft.ratings[i] - 1]} — ${(draft.ratings[i] * 2).toFixed(1)}/10`),
      '',
      'MANAGER FEEDBACK',
      'What went well: ' + draft.strengths,
      'What needs improvement: ' + draft.improvements,
      'Next-month priorities: ' + draft.priorities,
      'Support needed: ' + draft.support,
      'Manager summary: ' + draft.summary,
      '',
      'EMPLOYEE REFLECTION',
      draft.reflection || 'Pending',
      '',
      '1:1 completed: ' + (draft.meeting ? 'Yes' : 'No'),
      '',
      'Note: HRMS/ClickUp values shown on this page are currently entered manually until live integrations are connected.',
    ].join('\n');
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(exportText());
      setNotice('Review copied. Paste it into the monthly ClickUp review task.');
    } catch {
      setNotice('Clipboard unavailable. Use the review text below to copy manually.');
    }
  }

  function finish() {
    if (!completeReady) {
      setNotice('Complete manager feedback, employee reflection, and the 1:1 before finalizing the review.');
      return;
    }
    setStatus('Completed');
    setNotice('Review marked completed on this page. Copy the final review into ClickUp for the official record.');
  }

  const feedbackFields = [
    ['strengths', 'What went well'],
    ['improvements', 'What needs improvement'],
    ['priorities', 'Next-month priorities'],
    ['support', 'Support needed'],
    ['summary', 'Manager summary'],
  ] as const;

  return (
    <div className="shell review-lab">
      <header className="review-lab-header">
        <p className="eyebrow">Monthly performance review</p>
        <h1 className="page-title">Ifrat · {draft.period}</h1>
        <p className="page-subtitle">The production review template. Current numbers are sample/manual inputs until ClickUp and HRMS integrations are connected.</p>
        <div className="hero-actions">
          <a className="button button-secondary" href="https://app.clickup.com/t/86eywj0dy" target="_blank" rel="noreferrer">Open source ClickUp task ↗</a>
          <Link className="button button-secondary" href="/task-rating-guide">Rating guide</Link>
          <Link className="button button-secondary" href="/team/ifrat">Performance card</Link>
        </div>
      </header>

      <div className="review-lab-layout">
        <div className="review-lab-main">
          <section className="panel" id="review-context">
            <h2>1. Review details</h2>
            <label className="review-input">Review period<input value={draft.period} onChange={(e) => update('period', e.target.value)} /></label>
            <dl className="review-facts">
              <div><dt>Employee</dt><dd>Ifrat</dd></div>
              <div><dt>Review Manager</dt><dd>Fazle Rabbi</dd></div>
              <div><dt>Delivery Reviewer</dt><dd>Fazle covers Ifrat’s delivery review directly. For other employees, Ifrat can provide delivery-review context.</dd></div>
            </dl>
          </section>

          <section className="panel" id="hrms-inputs">
            <h2>2. Delivery &amp; HRMS evidence</h2>
            <p>These values are objective evidence inputs. They are entered manually for now; the final system should pull verified HRMS/ClickUp data automatically.</p>
            <div className="review-input-grid">
              {([['delivery', 'Delivery Reliability'], ['attendance', 'Attendance Reliability'], ['policy', 'Leave & Policy Reliability']] as const).map(([field, label]) => (
                <label className="review-input" key={field}>{label}
                  <select value={draft[field]} onChange={(e) => update(field, Number(e.target.value))}>
                    {Array.from({ length: 101 }, (_, i) => i / 10).map((n) => <option value={n} key={n}>{n.toFixed(1)} / 10</option>)}
                  </select>
                </label>
              ))}
            </div>
            <div className="info-box"><strong>KPI 1 = {reliability.toFixed(1)} / 10</strong>{draft.delivery} × 60% + {draft.attendance} × 20% + {draft.policy} × 20%</div>
            <details className="review-details" open>
              <summary>What are we comparing these values against?</summary>
              <p><strong>Delivery Reliability:</strong> compare actual monthly delivery behavior with the approved ClickUp delivery rules and completed work evidence.</p>
              <p><strong>Attendance Reliability:</strong> compare verified HRMS attendance records with the company attendance policy. Approved leave is neutral.</p>
              <p><strong>Leave &amp; Policy Reliability:</strong> compare verified HRMS/policy records with the documented leave and workplace rules.</p>
            </details>
          </section>

          <section className="panel" id="monthly-ratings">
            <h2>3. KPI evidence vs benchmark</h2>
            <p>Do not score from memory. Read the benchmark first, then compare the month’s evidence against it. “Strong” is the expected high-performance reference point; move lower or higher only when the evidence supports it.</p>
            <div className="review-rating-list">
              {kpis.map((kpi, i) => (
                <div className="review-rating-row" key={kpi.name}>
                  <label htmlFor={'rating-' + i}>
                    <strong>{i + 2}. {kpi.name}</strong>
                    <small>{kpi.source}</small>
                    <small><b>Benchmark:</b> {kpi.benchmark}</small>
                  </label>
                  <select id={'rating-' + i} value={draft.ratings[i]} onChange={(e) => {
                    const ratings = [...draft.ratings];
                    ratings[i] = Number(e.target.value);
                    update('ratings', ratings);
                  }}>
                    {(i === 6 ? impactLabels : ratingLabels).map((label, j) => <option value={j + 1} key={label}>{label}</option>)}
                  </select>
                  <strong>{(draft.ratings[i] * 2).toFixed(1)} / 10</strong>
                </div>
              ))}
            </div>
            <details className="review-details">
              <summary>Evidence currently captured on Ifrat’s source task</summary>
              <p>Delivery Status: On Time · Rework Required: None · Blockage Responsibility: Third Parties · Delivery Type: Internal.</p>
              <p>These fields are evidence, not automatic extra deductions. The reviewer uses them to justify the rating selected above.</p>
            </details>
          </section>

          <section className="panel" id="manager-feedback">
            <h2>4. Manager review</h2>
            <p>The manager explains the score with specific evidence and sets the next-month focus. Written feedback does not create a second score.</p>
            {feedbackFields.map(([field, label]) => (
              <label className="review-input" key={field}>{label}<textarea rows={3} value={draft[field]} onChange={(e) => update(field, e.target.value)} /></label>
            ))}
          </section>

          <section className="panel" id="employee-reflection">
            <h2>5. Employee reflection &amp; review meeting</h2>
            <label className="review-input">Ifrat’s reflection<textarea rows={5} value={draft.reflection} onChange={(e) => update('reflection', e.target.value)} placeholder="What went well? What was challenging? What did I learn? What support do I need next month?" /></label>
            <label className="review-checkbox"><input type="checkbox" checked={draft.meeting} onChange={(e) => update('meeting', e.target.checked)} />Monthly 1:1 review completed</label>
          </section>

          <section className="panel" id="final-record">
            <h2>6. Final review record</h2>
            <p>Until direct integration is available, copy the finalized review into the employee’s monthly ClickUp review task. ClickUp remains the official monthly review record.</p>
            <button type="button" className="button" onClick={copy}>Copy final review</button>
            <details className="review-details"><summary>View/copy review text</summary><textarea aria-label="Monthly review export" readOnly rows={18} value={exportText()} /></details>
          </section>
        </div>

        <aside className="panel review-summary" aria-label="Monthly score and review progress">
          <span className="card-kicker">Monthly performance score</span>
          <p className="review-total">{total.toFixed(1)}<small>/100</small></p>
          <strong>{band}</strong>
          <p>Status: <strong>{status}</strong></p>
          <ul className="review-checklist">
            <li>Objective evidence: entered</li>
            <li>Manager feedback: {feedbackReady ? 'complete' : 'incomplete'}</li>
            <li>Employee reflection: {draft.reflection.trim() ? 'complete' : 'pending'}</li>
            <li>1:1 review: {draft.meeting ? 'complete' : 'pending'}</li>
          </ul>
          <button type="button" className="button button-block" onClick={finish}>Finalize review</button>
          <div className="review-draft-actions"><button type="button" onClick={save}>Save browser draft</button><button type="button" onClick={load}>Load saved draft</button></div>
          <p className="review-help">{saved ? 'Draft saved in this browser.' : 'Current edits are not saved.'} Shared storage and live HRMS/ClickUp sync are not connected yet.</p>
          <p className="review-notice" role="status" aria-live="polite">{notice}</p>
          <nav className="guide-index" aria-label="Review steps">
            <a href="#hrms-inputs">Objective evidence</a>
            <a href="#monthly-ratings">KPI benchmark</a>
            <a href="#manager-feedback">Manager review</a>
            <a href="#employee-reflection">Employee reflection</a>
            <a href="#final-record">Final record</a>
          </nav>
        </aside>
      </div>
    </div>
  );
}
