'use client';

import { useState } from 'react';
import Link from 'next/link';

const ratingLabels = ['Significant Improvement Needed', 'Needs Improvement', 'Effective', 'Strong', 'Exceptional'];
const impactLabels = ['No Meaningful Impact', 'Limited Impact', 'Expected Impact', 'Strong Impact', 'Exceptional Impact'];
const kpis = [
  ['Work Quality', 'Strong = consistently accurate, complete work with little avoidable rework.', 'ClickUp work evidence'],
  ['Ownership', 'Strong = owns outcomes, follows through, and raises risks without being chased.', 'ClickUp work evidence'],
  ['Communication', 'Strong = clear, timely, audience-appropriate updates that reduce ambiguity.', 'ClickUp work evidence'],
  ['Problem Solving', 'Strong = diagnoses issues and proposes practical solutions independently.', 'ClickUp work evidence'],
  ['Collaboration', 'Strong = works constructively across functions and helps unblock others.', 'ClickUp work evidence'],
  ['Proactiveness', 'Strong = identifies risks and opportunities early and acts before escalation.', 'ClickUp work evidence'],
  ['Client / Business Impact', 'Strong Impact = creates clear client, revenue, efficiency, quality, or risk-reduction value.', 'ClickUp work evidence'],
  ['Growth & Development', 'Strong = demonstrates visible learning and applies it to improve role performance.', 'Manager monthly assessment'],
  ['Role Excellence', 'Strong = performs core expectations of the current role consistently and independently.', 'Manager monthly assessment'],
] as const;

const deliveryTasks = [
  { name: 'Task 1', status: 'On Time', rework: 'None', blockage: 'None' },
  { name: 'Task 2', status: 'On Time', rework: 'None', blockage: 'Third Parties' },
  { name: 'Task 3', status: 'Minor Delay', rework: 'None', blockage: 'Third Parties' },
  { name: 'Task 4', status: 'Minor Delay', rework: 'Minor', blockage: 'Assignee' },
] as const;

const completedTasks = 10;
const reviewedTasks = deliveryTasks.length;
const missingTaskReviews = completedTasks - reviewedTasks;
const coverage = Math.round((reviewedTasks / completedTasks) * 100);

const statusScore: Record<string, number> = { 'On Time': 10, 'Minor Delay': 6, Late: 2 };
const reworkScore: Record<string, number> = { None: 10, Minor: 6, Major: 2 };

function deliveryTaskScore(task: (typeof deliveryTasks)[number]) {
  const externalDelay = task.status !== 'On Time' && (task.blockage === 'Third Parties' || task.blockage === 'Client');
  const adjustedStatus = externalDelay ? 10 : statusScore[task.status];
  return Math.round((adjustedStatus * 0.7 + reworkScore[task.rework] * 0.3) * 10) / 10;
}

const deliveryPreview = Math.round((deliveryTasks.reduce((sum, task) => sum + deliveryTaskScore(task), 0) / deliveryTasks.length) * 10) / 10;

const initial = {
  ratings: [5, 4, 4, 4, 4, 3, 3, 3, 4],
  attendance: 10,
  policy: 10,
  strengths: 'Strong ownership, communication, problem solving, and collaboration. Work quality is currently rated Exceptional in the baseline values.',
  improvements: 'Identify delivery risks and improvement opportunities earlier instead of waiting for escalation.',
  priorities: 'Complete KPI review fields on every completed task before the monthly review is finalized.',
  support: 'Weekly alignment with Fazle on priorities, blockers, and decisions that need escalation.',
  summary: 'September is a baseline test. The score is preview-only until all completed tasks have KPI review coverage.',
  reflection: '',
  meeting: false,
};

type Draft = typeof initial;
const storageKey = 'blinto-ifrat-september-2026-baseline-v2';

export function MonthlyReview() {
  const [draft, setDraft] = useState<Draft>({ ...initial, ratings: [...initial.ratings] });
  const [notice, setNotice] = useState('');
  const [status, setStatus] = useState('In review');
  const round = (n: number) => Math.round(n * 10) / 10;
  const reliability = round(deliveryPreview * .6 + draft.attendance * .2 + draft.policy * .2);
  const total = round(reliability + draft.ratings.reduce((sum, n) => sum + n * 2, 0));
  const band = total >= 90 ? 'Exceptional' : total >= 80 ? 'Strong' : total >= 60 ? 'Effective' : total >= 40 ? 'Needs Improvement' : 'Significant Improvement Needed';
  const coverageReady = reviewedTasks === completedTasks;

  function update<K extends keyof Draft>(field: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setStatus('In review');
    setNotice('');
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
      setNotice('September baseline draft saved in this browser.');
    } catch {
      setNotice('Could not save this browser draft.');
    }
  }

  function load() {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return setNotice('No saved September baseline draft in this browser.');
    try {
      const value = JSON.parse(raw);
      if (!Array.isArray(value.ratings) || value.ratings.length !== 9) throw new Error();
      setDraft(value);
      setStatus('In review');
      setNotice('Saved September baseline loaded.');
    } catch {
      setNotice('Saved baseline could not be loaded.');
    }
  }

  function finalText() {
    return [
      'IFRAT — SEPTEMBER 2026 BASELINE REVIEW',
      'Status: ' + status,
      'KPI review coverage: ' + reviewedTasks + '/' + completedTasks + ' tasks (' + coverage + '%)',
      'Preview score: ' + total.toFixed(1) + '/100 — ' + band,
      '',
      'ClickUp Delivery Reliability: ' + deliveryPreview.toFixed(1) + '/10',
      'Delivery & Reliability: ' + reliability.toFixed(1) + '/10',
      ...kpis.map(([name], i) => `${i + 2}. ${name}: ${(i === 6 ? impactLabels : ratingLabels)[draft.ratings[i] - 1]} — ${(draft.ratings[i] * 2).toFixed(1)}/10`),
      '',
      'Manager summary: ' + draft.summary,
      'Employee reflection: ' + (draft.reflection || 'Pending'),
      '1:1 completed: ' + (draft.meeting ? 'Yes' : 'No'),
      '',
      'Finalization rule: 100% KPI review coverage is required for completed tasks.',
    ].join('\n');
  }

  async function copy() {
    try { await navigator.clipboard.writeText(finalText()); setNotice('September baseline copied.'); }
    catch { setNotice('Clipboard unavailable. Use the review text below.'); }
  }

  const completeReady = coverageReady && draft.reflection.trim() && draft.meeting;

  return (
    <div className="shell review-lab">
      <header className="review-lab-header">
        <p className="eyebrow">Baseline review workspace</p>
        <h1 className="page-title">Ifrat · September 2026</h1>
        <p className="page-subtitle">September is a trial month. This test intentionally simulates 10 completed tasks with KPI review values completed on only 4 tasks.</p>
        <div className="hero-actions">
          <a className="button button-secondary" href="https://app.clickup.com/t/86eywj0dy" target="_blank" rel="noreferrer">Open ClickUp source task ↗</a>
          <Link className="button button-secondary" href="/task-rating-guide">Rating guide</Link>
          <Link className="button" href="/framework">Formula guide</Link>
        </div>
      </header>

      <div className="review-lab-layout">
        <div className="review-lab-main">
          <section className="panel">
            <h2>1. KPI review coverage gate</h2>
            <div className="info-box">
              <strong>{reviewedTasks} of {completedTasks} completed tasks reviewed · {coverage}% coverage</strong>
              <p>{missingTaskReviews} completed tasks are still missing KPI review values. The monthly review remains incomplete until coverage reaches 100%.</p>
            </div>
            <p>The preview can use currently available evidence, but the final score cannot be approved while completed tasks are still unreviewed.</p>
          </section>

          <section className="panel">
            <h2>2. Delivery Reliability formula</h2>
            <p>Each reviewed task receives a Delivery Reliability score from Delivery Status and Rework Required. Client or third-party-caused delays neutralize the timing penalty.</p>
            <div className="info-box"><strong>Per task</strong><p>70% adjusted Delivery Status + 30% Rework Required.</p></div>
            <div className="kpi-table-wrap">
              <table className="kpi-score-table">
                <thead><tr><th>Task</th><th>Delivery Status</th><th>Rework</th><th>Blockage</th><th>Delivery score</th></tr></thead>
                <tbody>{deliveryTasks.map((task) => <tr key={task.name}><td>{task.name}</td><td>{task.status}</td><td>{task.rework}</td><td>{task.blockage}</td><td><strong>{deliveryTaskScore(task).toFixed(1)}</strong><span>/10</span></td></tr>)}</tbody>
              </table>
            </div>
            <div className="info-box"><strong>ClickUp Delivery Reliability preview = {deliveryPreview.toFixed(1)} / 10</strong><p>Average of the {reviewedTasks} reviewed tasks. This remains provisional because {missingTaskReviews} completed tasks are not yet reviewed.</p></div>
          </section>

          <section className="panel">
            <h2>3. KPI 1 — Delivery &amp; Reliability</h2>
            <div className="review-input-grid">
              <label className="review-input">ClickUp Delivery Reliability<input value={`${deliveryPreview.toFixed(1)} / 10`} readOnly /></label>
              {([['attendance', 'Attendance Reliability'], ['policy', 'Leave & Policy Reliability']] as const).map(([field, label]) => (
                <label className="review-input" key={field}>{label}
                  <select value={draft[field]} onChange={(e) => update(field, Number(e.target.value))}>
                    {Array.from({ length: 11 }, (_, i) => i).map((n) => <option value={n} key={n}>{n.toFixed(1)} / 10</option>)}
                  </select>
                </label>
              ))}
            </div>
            <div className="info-box"><strong>KPI 1 preview = {reliability.toFixed(1)} / 10</strong><p>{deliveryPreview.toFixed(1)} × 60% + {draft.attendance} × 20% + {draft.policy} × 20%</p></div>
          </section>

          <section className="panel">
            <h2>4. Monthly KPI values</h2>
            <div className="review-rating-list">
              {kpis.map(([name, benchmark, source], i) => (
                <div className="review-rating-row" key={name}>
                  <label htmlFor={'rating-' + i}><strong>{i + 2}. {name}</strong><small>{source}</small><small><b>Benchmark:</b> {benchmark}</small></label>
                  <select id={'rating-' + i} value={draft.ratings[i]} onChange={(e) => { const ratings = [...draft.ratings]; ratings[i] = Number(e.target.value); update('ratings', ratings); }}>
                    {(i === 6 ? impactLabels : ratingLabels).map((label, j) => <option value={j + 1} key={label}>{label}</option>)}
                  </select>
                  <strong>{(draft.ratings[i] * 2).toFixed(1)} / 10</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>5. Manager feedback</h2>
            {([['strengths', 'What went well'], ['improvements', 'What needs improvement'], ['priorities', 'Next-month priorities'], ['support', 'Support needed'], ['summary', 'Manager summary']] as const).map(([field, label]) => <label className="review-input" key={field}>{label}<textarea rows={3} value={draft[field]} onChange={(e) => update(field, e.target.value)} /></label>)}
          </section>

          <section className="panel">
            <h2>6. Employee reflection &amp; 1:1</h2>
            <label className="review-input">Ifrat’s reflection<textarea rows={5} value={draft.reflection} onChange={(e) => update('reflection', e.target.value)} /></label>
            <label className="review-checkbox"><input type="checkbox" checked={draft.meeting} onChange={(e) => update('meeting', e.target.checked)} />September baseline 1:1 completed</label>
          </section>

          <section className="panel">
            <h2>7. Baseline record</h2>
            <button type="button" className="button" onClick={copy}>Copy September baseline</button>
            <details className="review-details"><summary>View/copy baseline text</summary><textarea readOnly rows={18} value={finalText()} /></details>
          </section>
        </div>

        <aside className="panel review-summary">
          <span className="card-kicker">September preview score</span>
          <p className="review-total">{total.toFixed(1)}<small>/100</small></p>
          <strong>{band}</strong>
          <p>Status: <strong>{coverageReady ? status : 'Incomplete evidence'}</strong></p>
          <ul className="review-checklist">
            <li>KPI coverage: {reviewedTasks}/{completedTasks} · {coverage}%</li>
            <li>Missing task reviews: {missingTaskReviews}</li>
            <li>Delivery Reliability: {deliveryPreview.toFixed(1)}/10 preview</li>
            <li>Employee reflection: {draft.reflection.trim() ? 'complete' : 'pending'}</li>
            <li>1:1: {draft.meeting ? 'complete' : 'pending'}</li>
          </ul>
          <button type="button" className="button button-block" onClick={() => {
            if (!coverageReady) return setNotice(`Cannot complete: ${missingTaskReviews} completed tasks still need KPI review values.`);
            if (!completeReady) return setNotice('Add Ifrat’s reflection and complete the 1:1 before marking the baseline complete.');
            setStatus('Complete');
            setNotice('September baseline marked complete in this workspace.');
          }}>Complete September baseline</button>
          <div className="review-draft-actions"><button type="button" onClick={save}>Save draft</button><button type="button" onClick={load}>Load draft</button></div>
          <p className="review-notice" role="status">{notice}</p>
        </aside>
      </div>
    </div>
  );
}
