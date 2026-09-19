import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { people } from '@/lib/people';
import { getLiveClickUpEvidence } from '@/lib/clickup-performance';
import { getManagerMonthlyReview } from '@/lib/manager-monthly-review';

export const dynamic = 'force-dynamic';

function previousMonthKey() {
  const parts = new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',timeZone:'Asia/Dhaka'}).formatToParts(new Date());
  let year=Number(parts.find(p=>p.type==='year')?.value);
  let month=Number(parts.find(p=>p.type==='month')?.value)-1;
  if(month===0){month=12;year-=1;}
  return `${year}-${String(month).padStart(2,'0')}`;
}

export async function GET(request:Request){
  if(process.env.CRON_SECRET && request.headers.get('authorization')!==`Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ok:false},{status:401});
  }
  const monthKey=previousMonthKey();
  const results=[];
  for(const person of people){
    const [evidence,manager]=await Promise.all([getLiveClickUpEvidence(person,monthKey),getManagerMonthlyReview(person.slug,monthKey)]);
    const managerScore=manager.growthScore!==null&&manager.roleExcellenceScore!==null ? manager.growthScore+manager.roleExcellenceScore : null;
    const complete=evidence.evidenceComplete&&evidence.score!==undefined&&managerScore!==null&&manager.status==='submitted';
    const finalScore=complete ? Math.round((evidence.score!+managerScore!)*10)/10 : null;
    await db.query(`insert into monthly_performance_results(employee_slug,month_key,clickup_score,manager_score,final_score,status,generated_at)
      values($1,$2,$3,$4,$5,$6,now())
      on conflict(employee_slug,month_key) do update set clickup_score=excluded.clickup_score,manager_score=excluded.manager_score,final_score=excluded.final_score,status=excluded.status,generated_at=now()`,
      [person.slug,monthKey,evidence.score??null,managerScore,finalScore,complete?'complete':'incomplete']);
    await db.query(`update manager_monthly_reviews set status='locked', locked_at=now(), updated_at=now()
      where employee_slug=$1 and month_key=$2 and status='submitted'`,[person.slug,monthKey]);
    results.push({employee:person.slug,status:complete?'complete':'incomplete',finalScore});
  }
  return NextResponse.json({ok:true,monthKey,results});
}