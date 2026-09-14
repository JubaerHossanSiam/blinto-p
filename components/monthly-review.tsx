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

type DeliveryTask = {
  name: string;
  status: 'On Time' | 'Minor Delay' | 'Late';
  rework: 'None' | 'Minor' | 'Major';
  blockage: 'None' | 'Assignee' | 'Third Parties' | 'Client';
};

type MonthlyReviewProps = {
  employeeName: string;
  employeeSlug: string;
  monthKey: string;
  monthLabel: string;
  year?: number;
};

const septemberDeliveryTasks: DeliveryTask[] = [
  { name: 'Task 1', status: 'On Time', rework: 'None', blockage: 'None' },
  { name: 'Task 2', status: 'On Time', rework: 'None', blockage: 'Third Parties' },
  { name: 'Task 3', status: 'Minor Delay', rework: 'None', blockage: 'Third Parties' },
  { name: 'Task 4', status: 'Minor Delay', rework: 'Minor', blockage: 'Assignee' },
];

const statusScore: Record<DeliveryTask['status'], number> = { 'On Time': 10, 'Minor Delay': 6, Late: 2 };
const reworkScore: Record<DeliveryTask['rework'], number> = { None: 10, Minor: 6, Major: 2 };

function deliveryTaskScore(task: DeliveryTask) {
  const externalDelay = task.status !== 'On Time' && (task.blockage === 'Third Parties' || task.blockage === 'Client');
  const adjustedStatus = externalDelay ? 10 : statusScore[task.status];
  return Math.round((adjustedStatus * 0.7 + reworkScore[task.rework] * 0.3) * 10) / 10;
}

export function MonthlyReview({ employeeName, employeeSlug, monthKey, monthLabel, year = 2026 }: MonthlyReviewProps) {
  const isSeptemberBaseline = employeeSlug === 'ifrat' && monthKey === '2026-09';
  const deliveryTasks = isSeptemberBaseline ? septemberDeliveryTasks : [];
  const completedTasks = isSeptemberBaseline ? 10 : 0;
  const reviewedTasks = deliveryTasks.length;
  const missingTaskReviews = Math.max(completedTasks - reviewedTasks, 0);
  const coverage = completedTasks ? Math.round((reviewedTasks / completedTasks) * 100) : 0;
  const clickUpRatings = isSeptemberBaseline ? [5, 4, 4, 4, 4, 3, 3] : [0, 0, 0, 0, 0, 0, 0];
  const deliveryPreview = deliveryTasks.length
    ? Math.round((deliveryTasks.reduce((sum, task) => sum + deliveryTaskScore(task), 0) / deliveryTasks.length) * 10) / 10
    : 0;

  const [managerRatings, setManagerRatings] = useState(isSeptemberBaseline ? [3, 4] : [0, 0]);
  const [attendance, setAttendance] = useState(isSeptemberBaseline ? 10 : 0);
  const [policy, setPolicy] = useState(isSeptemberBaseline ? 10 : 0);
  const [strengths, setStrengths] = useState(isSeptemberBaseline ? 'Strong ownership, communication, problem solving, and collaboration.' : '');
  const [improvements, setImprovements] = useState(isSeptemberBaseline ? 'Identify delivery risks and improvement opportunities earlier instead of waiting for escalation.' : '');
  const [priorities, setPriorities] = useState(isSeptemberBaseline ? 'Complete KPI review fields on every completed task before the monthly review is finalized.' : '');
  const [support, setSupport] = useState(isSeptemberBaseline ? 'Weekly alignment with Fazle on priorities, blockers, and decisions that need escalation.' : '');
  const [summary, setSummary] = useState(isSeptemberBaseline ? 'September is a baseline test. The score is preview-only until all completed tasks have KPI review coverage.' : '');
  const [reflection, setReflection] = useState('');
  const [meeting, setMeeting] = useState(false);
  const [notice, setNotice] = useState('');
  const [status, setStatus] = useState(isSeptemberBaseline ? 'In review' : 'Pending');

  const storageKey = `blinto-${employeeSlug}-${monthKey}-review-v1`;
  const round = (n: number) => Math.round(n * 10) / 10;
  const reliability = deliveryTasks.length ? round(deliveryPreview * .6 + attendance * .2 + policy * .2) : undefined;
  const allRatings = [...clickUpRatings, ...managerRatings];
  const allScoresPresent = allRatings.every((rating) => rating > 0) && reliability !== undefined;
  const total = allScoresPresent ? round(reliability + allRatings.reduce((sum, n) => sum + n * 2, 0)) : undefined;
  const band = total === undefined ? 'Pending' : total >= 90 ? 'Exceptional' : total >= 80 ? 'Strong' : total >= 60 ? 'Effective' : total >= 40 ? 'Needs Improvement' : 'Significant Improvement Needed';
  const coverageReady = completedTasks > 0 && reviewedTasks === completedTasks;

  function updateManagerRating(index: number, value: number) {
    const next = [...managerRatings];
    next[index] = value;
    setManagerRatings(next);
    setStatus('In review');
    setNotice('');
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ managerRatings, attendance, policy, strengths, improvements, priorities, support, summary, reflection, meeting }));
      setNotice(`${monthLabel} review draft saved in this browser.`);
    } catch {
      setNotice('Could not save this browser draft.');
    }
  }

  function load() {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return setNotice(`No saved ${monthLabel} review draft in this browser.`);
    try {
      const value = JSON.parse(raw);
      if (Array.isArray(value.managerRatings)) setManagerRatings(value.managerRatings);
      if (typeof value.attendance === 'number') setAttendance(value.attendance);
      if (typeof value.policy === 'number') setPolicy(value.policy);
      setStrengths(value.strengths ?? '');
      setImprovements(value.improvements ?? '');
      setPriorities(value.priorities ?? '');
      setSupport(value.support ?? '');
      setSummary(value.summary ?? '');
      setReflection(value.reflection ?? '');
      setMeeting(Boolean(value.meeting));
      setStatus('In review');
      setNotice(`Saved ${monthLabel} review loaded.`);
    } catch {
      setNotice('Saved review could not be loaded.');
    }
  }

  const reviewReady = coverageReady && managerRatings.every((rating) => rating > 0) && reflection.trim() && meeting;

  return (
    <div className="shell review-lab">
      <header className="review-lab-header">
        <p className="eyebrow">Monthly performance review</p>
        <h1 className="page-title">{employeeName} · {monthLabel} {year}</h1>
        <p className="page-subtitle">One reusable monthly-review template. ClickUp-derived KPI values are read-only; only monthly manager assessments and review conversation fields are entered here.</p>
        <div className="hero-actions">
          <Link className="button" href={`/team/${employeeSlug}`}>Back to Performance Card</Link>
          <Link className="button button-secondary" href="/task-rating-guide">Rating guide</Link>
          <Link className="button button-secondary" href="/framework">Formula guide</Link>
          {isSeptemberBaseline ? <a className="button button-secondary" href="https://app.clickup.com/t/86eywj0dy" target="_blank" rel="noreferrer">Open ClickUp test task ↗</a> : null}
        </div>
      </header>

      <div className="review-lab-layout">
        <div className="review-lab-main">
          <section className="panel">
            <h2>1. Task KPI coverage</h2>
            {completedTasks ? (
              <>
                <div className="info-box"><strong>{reviewedTasks} of {completedTasks} completed tasks reviewed · {coverage}% coverage</strong><p>{missingTaskReviews} completed tasks are still missing KPI review values.</p></div>
                <p>The score can preview from available evidence, but the review cannot be finalized until completed-task KPI coverage reaches 100%.</p>
              </>
            ) : (
              <div className="info-box"><strong>ClickUp evidence pending</strong><p>No completed-task review data has been loaded for {monthLabel} yet. This month remains Pending.</p></div>
            )}
          </section>

          <section className="panel">
            <h2>2. Delivery Reliability</h2>
            <p>Per reviewed task: <strong>70% adjusted Delivery Status + 30% Rework Required</strong>. Client or third-party-caused delay neutralizes the timing penalty.</p>
            {deliveryTasks.length ? (
              <>
                <div className="kpi-table-wrap"><table className="kpi-score-table"><thead><tr><th>Task</th><th>Delivery Status</th><th>Rework</th><th>Blockage</th><th>Score</th></tr></thead><tbody>{deliveryTasks.map((task) => <tr key={task.name}><td>{task.name}</td><td>{task.status}</td><td>{task.rework}</td><td>{task.blockage}</td><td><strong>{deliveryTaskScore(task).toFixed(1)}</strong><span>/10</span></td></tr>)}</tbody></table></div>
                <div className="info-box"><strong>ClickUp Delivery Reliability preview = {deliveryPreview.toFixed(1)} / 10</strong><p>Average of the {reviewedTasks} reviewed tasks.</p></div>
              </>
            ) : <p>No Delivery Reliability value yet.</p>}
          </section>

          <section className="panel">
            <h2>3. KPI 1 — Delivery &amp; Reliability</h2>
            <div className="review-input-grid">
              <label className="review-input">ClickUp Delivery Reliability<input value={deliveryTasks.length ? `${deliveryPreview.toFixed(1)} / 10` : 'Pending'} readOnly /></label>
              <label className="review-input">Attendance Reliability · HRMS test/manual
                <select value={attendance} onChange={(e) => { setAttendance(Number(e.target.value)); setStatus('In review'); }}>
                  {Array.from({ length: 11 }, (_, i) => i).map((n) => <option value={n} key={n}>{n === 0 ? 'Pending' : `${n.toFixed(1)} / 10`}</option>)}
                </select>
              </label>
              <label className="review-input">Leave &amp; Policy Reliability · HRMS test/manual
                <select value={policy} onChange={(e) => { setPolicy(Number(e.target.value)); setStatus('In review'); }}>
                  {Array.from({ length: 11 }, (_, i) => i).map((n) => <option value={n} key={n}>{n === 0 ? 'Pending' : `${n.toFixed(1)} / 10`}</option>)}
                </select>
              </label>
            </div>
            <div className="info-box"><strong>KPI 1 = {reliability === undefined ? 'Pending' : `${reliability.toFixed(1)} / 10`}</strong>{reliability !== undefined ? <p>{deliveryPreview.toFixed(1)} × 60% + {attendance} × 20% + {policy} × 20%</p> : null}</div>
          </section>

          <section className="panel">
            <h2>4. Monthly KPI values</h2>
            <p className="career-note"><strong>No duplicate scoring:</strong> KPIs 2–8 are aggregated from finalized ClickUp task fields and are read-only. Growth &amp; Development and Role Excellence are assessed once per month by the Review Manager.</p>
            <div className="review-rating-list">
              {kpis.map(([name, benchmark, source], i) => {
                const fromClickUp = i < 7;
                const value = fromClickUp ? clickUpRatings[i] : managerRatings[i - 7];
                const labels = i === 6 ? impactLabels : ratingLabels;
                const label = value > 0 ? labels[value - 1] : 'Pending';
                return (
                  <div className="review-rating-row" key={name}>
                    <label><strong>{i + 2}. {name}</strong><small>{source}</small><small><b>Benchmark:</b> {benchmark}</small></label>
                    {fromClickUp ? (
                      <div><strong>{label}</strong><small style={{ display: 'block' }}>Read-only · aggregated from ClickUp</small></div>
                    ) : (
                      <select value={value} onChange={(e) => updateManagerRating(i - 7, Number(e.target.value))}>
                        <option value={0}>Select monthly assessment</option>
                        {labels.map((option, j) => <option value={j + 1} key={option}>{option}</option>)}
                      </select>
                    )}
                    <strong>{value > 0 ? `${(value * 2).toFixed(1)} / 10` : '— /10'}</strong>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel">
            <h2>5. Manager feedback</h2>
            {[
              ['What went well', strengths, setStrengths],
              ['What needs improvement', improvements, setImprovements],
              ['Next-month priorities', priorities, setPriorities],
              ['Support needed', support, setSupport],
              ['Manager summary', summary, setSummary],
            ].map(([label, value, setter]) => <label className="review-input" key={label as string}>{label as string}<textarea rows={3} value={value as string} onChange={(e) => { (setter as (value: string) => void)(e.target.value); setStatus('In review'); }} /></label>)}
          </section>

          <section className="panel">
            <h2>6. Employee reflection &amp; 1:1</h2>
            <label className="review-input">{employeeName}’s reflection<textarea rows={5} value={reflection} onChange={(e) => { setReflection(e.target.value); setStatus('In review'); }} /></label>
            <label className="review-checkbox"><input type="checkbox" checked={meeting} onChange={(e) => { setMeeting(e.target.checked); setStatus('In review'); }} />{monthLabel} 1:1 completed</label>
          </section>
        </div>

        <aside className="panel review-summary">
          <span className="card-kicker">{monthLabel} review score</span>
          <p className="review-total">{total === undefined ? '—' : total.toFixed(1)}<small>/100</small></p>
          <strong>{band}</strong>
          <p>Status: <strong>{coverageReady ? status : completedTasks ? 'Incomplete evidence' : 'Pending'}</strong></p>
          <ul className="review-checklist">
            <li>KPI coverage: {completedTasks ? `${reviewedTasks}/${completedTasks} · ${coverage}%` : 'Pending'}</li>
            <li>Missing task reviews: {completedTasks ? missingTaskReviews : '—'}</li>
            <li>ClickUp KPIs 2–8: read-only</li>
            <li>Manager KPIs 9–10: {managerRatings.every((rating) => rating > 0) ? 'complete' : 'pending'}</li>
            <li>Employee reflection: {reflection.trim() ? 'complete' : 'pending'}</li>
            <li>1:1: {meeting ? 'complete' : 'pending'}</li>
          </ul>
          <button type="button" className="button button-block" onClick={() => {
            if (!completedTasks) return setNotice('Cannot complete: ClickUp completed-task evidence has not been loaded for this month.');
            if (!coverageReady) return setNotice(`Cannot complete: ${missingTaskReviews} completed tasks still need KPI review values.`);
            if (!reviewReady) return setNotice('Complete manager KPIs, employee reflection, and the 1:1 before finalizing this month.');
            setStatus('Complete');
            setNotice(`${monthLabel} review marked complete in this browser workspace.`);
          }}>Complete {monthLabel} review</button>
          <div className="review-draft-actions"><button type="button" onClick={save}>Save draft</button><button type="button" onClick={load}>Load draft</button></div>
          <p className="review-notice" role="status">{notice}</p>
        </aside>
      </div>
    </div>
  );
}
