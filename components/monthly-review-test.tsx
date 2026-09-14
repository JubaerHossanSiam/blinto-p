'use client';

import { useState } from 'react';
import Link from 'next/link';

const labels = ['Significant Improvement Needed', 'Needs Improvement', 'Effective', 'Strong', 'Exceptional'];
const impact = ['No Meaningful Impact', 'Limited Impact', 'Expected Impact', 'Strong Impact', 'Exceptional Impact'];
const names = ['Work Quality', 'Ownership', 'Communication', 'Problem Solving', 'Collaboration', 'Proactiveness', 'Client / Business Impact', 'Growth & Development', 'Role Excellence'];
const initial = {
  period: 'September 2026 — TEST',
  ratings: [5, 4, 4, 4, 4, 3, 3, 3, 4],
  delivery: 10, attendance: 10, policy: 10,
  strengths: 'Strong ownership, communication, problem solving, and collaboration. Delivery quality was rated Exceptional.',
  improvements: 'Focus on identifying risks and improvement opportunities earlier.',
  priorities: 'Flag delivery risks early. Propose one practical workflow improvement.',
  support: 'Weekly alignment with Fazle on priorities and blockers.',
  summary: 'Strong overall contribution in this simulated review, with proactiveness as a development focus.',
  reflection: '', meeting: false,
};
type Draft = typeof initial;
const key = 'blinto-ifrat-monthly-review-test-v1';

export function MonthlyReviewTest() {
  const [draft, setDraft] = useState<Draft>({ ...initial, ratings: [...initial.ratings] });
  const [status, setStatus] = useState('Draft');
  const [notice, setNotice] = useState('');
  const [saved, setSaved] = useState(false);
  const round = (n: number) => Math.round(n * 10) / 10;
  const reliability = round(draft.delivery * .6 + draft.attendance * .2 + draft.policy * .2);
  const total = round(reliability + draft.ratings.reduce((sum, n) => sum + n * 2, 0));
  const band = total >= 90 ? 'Exceptional' : total >= 80 ? 'Strong' : total >= 60 ? 'Effective' : total >= 40 ? 'Needs Improvement' : 'Significant Improvement Needed';
  const feedbackReady = [draft.strengths, draft.improvements, draft.priorities, draft.support, draft.summary].every(s => s.trim());
  const completeReady = feedbackReady && draft.reflection.trim() && draft.meeting;
  function update<K extends keyof Draft>(field: K, value: Draft[K]) {
    setDraft(current => ({ ...current, [field]: value }));
    setStatus('Draft'); setSaved(false); setNotice('');
  }
  function save() {
    try {
      localStorage.setItem(key, JSON.stringify(draft));
      setSaved(true); setNotice('Test draft saved in this browser only.');
    } catch { setNotice('Could not save in this browser. Copy the review to keep your changes.'); }
  }
  function load() {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) { setNotice('No saved test draft in this browser.'); return; }
      const value = JSON.parse(raw);
      const textKeys = ['period', 'strengths', 'improvements', 'priorities', 'support', 'summary', 'reflection'];
      if (!value || !textKeys.every(k => typeof value[k] === 'string') ||
          !Array.isArray(value.ratings) || value.ratings.length !== 9 ||
          !value.ratings.every((n: number) => Number.isInteger(n) && n >= 1 && n <= 5) ||
          !['delivery', 'attendance', 'policy'].every(k => Number.isFinite(value[k]) && value[k] >= 0 && value[k] <= 10) ||
          typeof value.meeting !== 'boolean') throw new Error('Invalid draft');
      setDraft(value); setSaved(true); setStatus('Draft'); setNotice('Saved test draft loaded. Completion must be checked again.');
    } catch { setNotice('Saved draft could not be loaded. Current entries are unchanged.'); }
  }
  function text() {
    return [
      'IFRAT MONTHLY REVIEW — TEST ONLY — EXCLUDE FROM OFFICIAL SCORES',
      'Period: ' + draft.period, 'Review Manager: Fazle Rabbi', 'Delivery Reviewer: Not separately assigned',
      'Source test task: https://app.clickup.com/t/86eywj0dy',
      'Status: ' + status, 'Simulated score: ' + total.toFixed(1) + '/100 — ' + band,
      '', 'KPI 1: ' + reliability.toFixed(1) + '/10',
      'Simulated delivery: ' + draft.delivery + '/10; HRMS test attendance: ' + draft.attendance + '/10; HRMS test policy: ' + draft.policy + '/10',
      ...names.map((name, i) => name + ': ' + (i === 6 ? impact : labels)[draft.ratings[i] - 1] + ' — ' + (draft.ratings[i] * 2) + '/10'),
      '', 'MANAGER FEEDBACK — SAMPLE / TEST',
      'What went well: ' + draft.strengths, 'What needs improvement: ' + draft.improvements,
      'Next-month priorities: ' + draft.priorities, 'Support needed: ' + draft.support,
      'Manager summary: ' + draft.summary, '', 'Employee reflection: ' + (draft.reflection || 'Pending'),
      'Test 1:1: ' + (draft.meeting ? 'Marked complete' : 'Pending'),
      '', 'No live HRMS or ClickUp sync. Task-field selections are a test snapshot, not an aggregated monthly assessment.',
    ].join('\n');
  }
  async function copy() {
    try { await navigator.clipboard.writeText(text()); setNotice('Test review copied. Paste it into the ClickUp test task.'); }
    catch { setNotice('Clipboard unavailable. Use the selectable review text below.'); }
  }
  function finish() {
    if (!completeReady) { setNotice('Complete manager feedback, employee reflection, and the test 1:1 before finishing.'); return; }
    setStatus('Test complete'); setNotice('Test completed on this page only. Copy the review to transfer it to ClickUp.');
  }
  const feedbackFields = [
    ['strengths', 'What went well'], ['improvements', 'What needs improvement'],
    ['priorities', 'Next-month priorities'], ['support', 'Support needed'], ['summary', 'Manager summary'],
  ] as const;

  return (
    <div className="shell review-lab">
      <header className="review-lab-header">
        <p className="eyebrow">Monthly review pilot</p>
        <h1 className="page-title">Ifrat’s monthly review</h1>
        <p className="page-subtitle">Fazle reviews the evidence, adds feedback, and completes the review with Ifrat.</p>
        <div className="review-test-banner"><strong>TEST ONLY · Excluded from official performance</strong><p>Ratings are a snapshot of your ClickUp test. HRMS values and delivery score are simulated. Feedback is sample wording, not a verified assessment.</p></div>
        <div className="hero-actions">
          <a className="button button-secondary" href="https://app.clickup.com/t/86eywj0dy" target="_blank" rel="noreferrer">Open ClickUp test task ↗</a>
          <Link className="button button-secondary" href="/task-rating-guide">Rating guide</Link>
          <Link className="button button-secondary" href="/team/ifrat">Official performance card</Link>
        </div>
      </header>
      <div className="review-lab-layout">
        <div className="review-lab-main">
          <section className="panel" id="review-context">
            <h2>1. Review details</h2>
            <label className="review-input">Review period<input value={draft.period} onChange={e => update('period', e.target.value)} /></label>
            <dl className="review-facts"><div><dt>Employee</dt><dd>Ifrat</dd></div><div><dt>Review Manager</dt><dd>Fazle Rabbi</dd></div><div><dt>Delivery Reviewer</dt><dd>No separate reviewer. Fazle covers Ifrat’s delivery review directly.</dd></div></dl>
            <p>For other employees, Ifrat’s Delivery Reviewer feedback provides context without adding a second score.</p>
          </section>
          <section className="panel" id="hrms-test">
            <h2>2. Delivery &amp; HRMS test inputs</h2>
            <p>All three components use a 0–10 scale. These inputs are editable simulations; actual HRMS records are not connected.</p>
            <div className="review-input-grid">
              {([['delivery', 'Delivery Reliability · simulated'], ['attendance', 'Attendance Reliability · HRMS test'], ['policy', 'Leave & Policy Reliability · HRMS test']] as const).map(([field, label]) => (
                <label className="review-input" key={field}>{label}
                  <select value={draft[field]} onChange={e => update(field, Number(e.target.value))}>
                    {Array.from({ length: 101 }, (_, i) => i / 10).map(n => <option value={n} key={n}>{n.toFixed(1)} / 10</option>)}
                  </select>
                </label>
              ))}
            </div>
            <div className="info-box"><strong>KPI 1 = {reliability.toFixed(1)} / 10</strong>{draft.delivery} × 60% + {draft.attendance} × 20% + {draft.policy} × 20%</div>
            <p className="review-help">Delivery starts at an assumed 10/10 for this test. “On Time” has no approved numeric conversion yet. Approved leave is neutral; real attendance and policy scores must come from verified records.</p>
          </section>
          <section className="panel" id="monthly-ratings">
            <h2>3. Monthly KPI ratings</h2>
            <p>Use the test selections as simulated monthly inputs. In a real review, KPI 2–8 comes from eligible work evidence; the manager assesses KPI 9–10.</p>
            <div className="review-rating-list">
              {names.map((name, i) => (
                <div className="review-rating-row" key={name}>
                  <label htmlFor={'rating-' + i}><strong>{i + 2}. {name}</strong><small>{i >= 7 ? 'Manager monthly assessment' : 'ClickUp test snapshot'}</small></label>
                  <select id={'rating-' + i} value={draft.ratings[i]} onChange={e => { const ratings = [...draft.ratings]; ratings[i] = Number(e.target.value); update('ratings', ratings); }}>
                    {(i === 6 ? impact : labels).map((label, j) => <option value={j + 1} key={label}>{label}</option>)}
                  </select>
                  <strong>{(draft.ratings[i] * 2).toFixed(1)} / 10</strong>
                </div>
              ))}
            </div>
            <details className="review-details"><summary>Other values captured on the test task</summary><p>Delivery Status: On Time · Rework Required: None · Blockage Responsibility: Third Parties · Delivery Type: Internal.</p><p>These remain test context. Rework and blockage do not create extra score deductions in this simulation.</p></details>
          </section>
          <section className="panel" id="manager-feedback">
            <h2>4. Manager feedback</h2>
            <p>Fazle’s written review. Sample text is prefilled for testing; edit it to try the workflow. Written feedback does not add another score.</p>
            {feedbackFields.map(([field, label]) => <label className="review-input" key={field}>{label}<textarea rows={3} value={draft[field]} onChange={e => update(field, e.target.value)} /></label>)}
          </section>
          <section className="panel" id="employee-reflection">
            <h2>5. Employee reflection &amp; 1:1</h2>
            <label className="review-input">Ifrat’s reflection<textarea rows={5} value={draft.reflection} onChange={e => update('reflection', e.target.value)} placeholder="For this test: what went well, what was challenging, what did I learn, and what support do I need?" /></label>
            <label className="review-checkbox"><input type="checkbox" checked={draft.meeting} onChange={e => update('meeting', e.target.checked)} />Mark the test 1:1 as complete</label>
            <p className="review-help">This page does not verify who entered a reflection. Separate employee and manager sign-in is not part of this pilot.</p>
          </section>
          <section className="panel">
            <h2>6. Review summary for ClickUp</h2>
            <p>Copy this test summary into the existing ClickUp test task when ready. Nothing is sent automatically.</p>
            <button type="button" className="button" onClick={copy}>Copy test review</button>
            <details className="review-details"><summary>View or manually copy the review text</summary><textarea aria-label="Test review export" readOnly rows={18} value={text()} /></details>
          </section>
        </div>
        <aside className="panel review-summary" aria-label="Test score and review progress">
          <span className="card-kicker">Simulated monthly score</span>
          <p className="review-total">{total.toFixed(1)}<small>/100</small></p>
          <strong>{band}</strong>
          <p>Test status: <strong>{status}</strong></p>
          <ul className="review-checklist">
            <li>HRMS inputs: simulated</li>
            <li>Manager feedback: {feedbackReady ? 'filled' : 'incomplete'}</li>
            <li>Employee reflection: {draft.reflection.trim() ? 'filled' : 'pending'}</li>
            <li>Test 1:1: {draft.meeting ? 'complete' : 'pending'}</li>
          </ul>
          <button type="button" className="button button-block" onClick={finish}>Complete test review</button>
          <div className="review-draft-actions"><button type="button" onClick={save}>Save browser draft</button><button type="button" onClick={load}>Load saved draft</button></div>
          <p className="review-help">{saved ? 'Draft saved in this browser.' : 'Current edits are not saved.'} No shared storage or live ClickUp/HRMS sync. Saved drafts can be read by others using this browser.</p>
          <p className="review-notice" role="status" aria-live="polite">{notice}</p>
          <nav className="guide-index" aria-label="Review steps"><a href="#hrms-test">HRMS inputs</a><a href="#monthly-ratings">KPI breakdown</a><a href="#manager-feedback">Manager feedback</a><a href="#employee-reflection">Employee reflection</a></nav>
        </aside>
      </div>
    </div>
  );
}
