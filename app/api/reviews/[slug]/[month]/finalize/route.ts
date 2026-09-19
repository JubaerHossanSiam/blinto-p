import { NextResponse } from 'next/server';
import { getCurrentPortalUser } from '@/lib/access';
import { db } from '@/lib/db';

type Params = { params: Promise<{ slug:string; month:string }> };

export async function PUT(request:Request,{params}:Params){
  const {slug,month}=await params;
  const current=await getCurrentPortalUser();
  if(!current || current.actualPortalUser.role!=='admin' || current.viewingAs) return NextResponse.json({ok:false,message:'CEO/Admin access required.'},{status:403});
  const body=await request.json().catch(()=>({}));
  const action=body.action;
  const existing=await db.query('select status,growth_score,role_excellence_score from manager_monthly_reviews where employee_slug=$1 and month_key=$2 limit 1',[slug,month]);
  const row=existing.rows[0];
  if(!row) return NextResponse.json({ok:false,message:'Manager review has not been submitted.'},{status:404});
  if(action==='finalize'){
    if(row.status!=='submitted') return NextResponse.json({ok:false,message:'Manager must submit the review before finalization.'},{status:409});
    if(row.growth_score===null||row.role_excellence_score===null) return NextResponse.json({ok:false,message:'Both manager KPI scores are required.'},{status:400});
    await db.query("update manager_monthly_reviews set status='finalized', finalized_at=now(), finalized_by_email=$3, updated_at=now() where employee_slug=$1 and month_key=$2",[slug,month,current.session.user.email]);
    return NextResponse.json({ok:true,status:'finalized'});
  }
  if(action==='lock'){
    if(row.status!=='finalized') return NextResponse.json({ok:false,message:'Finalize the review before locking it.'},{status:409});
    await db.query("update manager_monthly_reviews set status='locked', locked_at=now(), updated_at=now() where employee_slug=$1 and month_key=$2",[slug,month]);
    return NextResponse.json({ok:true,status:'locked'});
  }
  if(action==='reopen'){
    if(row.status!=='finalized'&&row.status!=='locked') return NextResponse.json({ok:false,message:'Only finalized or locked reviews can be reopened.'},{status:409});
    await db.query("update manager_monthly_reviews set status='submitted', reopened_at=now(), reopened_by_email=$3, finalized_at=null, finalized_by_email=null, locked_at=null, updated_at=now() where employee_slug=$1 and month_key=$2",[slug,month,current.session.user.email]);
    return NextResponse.json({ok:true,status:'submitted'});
  }
  return NextResponse.json({ok:false,message:'Unknown action.'},{status:400});
}