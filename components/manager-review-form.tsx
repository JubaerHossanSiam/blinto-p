'use client';

import { useState } from 'react';
import type { ManagerMonthlyReview } from '@/lib/manager-monthly-review';

type Props = { employeeSlug:string; monthKey:string; initial:ManagerMonthlyReview; canEdit:boolean; clickUpScore?:number };

export function ManagerReviewForm({ employeeSlug, monthKey, initial, canEdit, clickUpScore }: Props) {
  const [review,setReview]=useState(initial); const [notice,setNotice]=useState('');
  const frozen = review.status === 'finalized' || review.status === 'locked';
  const editable = canEdit && !frozen;
  const managerTotal = review.growthScore !== null && review.roleExcellenceScore !== null ? review.growthScore + review.roleExcellenceScore : null;
  const finalTotal = clickUpScore !== undefined && managerTotal !== null ? Math.round((clickUpScore + managerTotal)*10)/10 : null;
  const set=(key:keyof ManagerMonthlyReview,value:unknown)=>setReview(r=>({...r,[key]:value}));

  async function save(status:'draft'|'submitted') {
    if (status === 'submitted' && (review.growthScore === null || review.roleExcellenceScore === null)) {
      return setNotice('Add both manager KPI scores before submitting.');
    }
    setNotice('Saving…');
    const response=await fetch(`/api/reviews/${employeeSlug}/${monthKey}/manager`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...review,status})});
    const data=await response.json() as {ok?:boolean;message?:string};
    if(!response.ok||!data.ok) return setNotice(data.message||'Could not save review.');
    setReview(r=>({...r,status})); setNotice(status==='submitted'?'Manager review submitted.':'Draft saved.');
  }
  const scoreInput=(label:string,key:'growthScore'|'roleExcellenceScore')=><label className="review-input">{label}<input type="number" min="0" max="10" step="0.5" disabled={!editable} value={review[key]??''} onChange={e=>set(key,e.target.value===''?null:Number(e.target.value))}/><small>/10</small></label>;
  return <section className="panel">
    <h2>Manager review</h2>
    <p>Manager-owned monthly assessment. ClickUp evidence is read-only. The manager review stays open through the last calendar day of the month. The system reminds managers at month-end and produces the official previous-month result automatically on the 1st.</p>
    <div className="review-input-grid">{scoreInput('Growth & Development','growthScore')}{scoreInput('Role Excellence','roleExcellenceScore')}</div>
    {clickUpScore!==undefined?<div className="info-box"><strong>Score preview: {clickUpScore}/80 + {managerTotal??'—'}/20 = {finalTotal??'—'}/100</strong></div>:null}
    {([['What went well','wentWell'],['What needs improvement','needsImprovement'],['Next-month priorities','nextPriorities'],['Support needed','supportNeeded'],['Manager summary','managerSummary']] as const).map(([label,key])=><label className="review-input" key={key}>{label}<textarea rows={3} disabled={!editable} value={review[key]} onChange={e=>set(key,e.target.value)}/></label>)}
    {editable?<div className="hero-actions"><button className="button button-secondary" type="button" onClick={()=>save('draft')}>Save draft</button><button className="button" type="button" onClick={()=>save('submitted')}>Submit manager review</button></div>:<p className="career-note">Read-only. Only this employee’s manager or the CEO/Admin can edit a draft/submitted review; finalized reviews are frozen.</p>}
    <p className="review-notice" role="status">{notice}</p>
  </section>;
}
