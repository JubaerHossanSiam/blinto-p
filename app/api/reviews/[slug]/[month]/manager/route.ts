import { NextResponse } from 'next/server';
import { getCurrentPortalUser } from '@/lib/access';
import { db } from '@/lib/db';

type Params = { params: Promise<{ slug: string; month: string }> };

async function canManage(slug: string) {
  const current = await getCurrentPortalUser();
  if (!current) return null;
  if (current.actualPortalUser.role === 'admin' && !current.viewingAs) return current;
  if (current.portalUser.role !== 'manager' || !current.portalUser.employeeSlug) return null;
  const result = await db.query('select 1 from employees where slug=$1 and manager_slug=$2 and is_active=true limit 1', [slug, current.portalUser.employeeSlug]);
  return result.rowCount === 1 ? current : null;
}

export async function PUT(request: Request, { params }: Params) {
  const { slug, month } = await params;
  const current = await canManage(slug);
  if (!current) return NextResponse.json({ ok:false, message:'Manager or admin access required.' }, { status:403 });
  const body = await request.json();
  const existing = await db.query('select status from manager_monthly_reviews where employee_slug=$1 and month_key=$2 limit 1', [slug, month]);
  const existingStatus = existing.rows[0]?.status as string | undefined;
  if (existingStatus === 'finalized' || existingStatus === 'locked') {
    return NextResponse.json({ ok:false, message:'This monthly review is finalized and cannot be edited.' }, { status:409 });
  }
  const score = (value: unknown) => value === null || value === '' ? null : Number(value);
  const growth = score(body.growthScore), role = score(body.roleExcellenceScore);
  if ((growth !== null && (growth < 0 || growth > 10)) || (role !== null && (role < 0 || role > 10))) {
    return NextResponse.json({ ok:false, message:'Manager KPI scores must be between 0 and 10.' }, { status:400 });
  }
  const status = body.status === 'submitted' ? 'submitted' : 'draft';
  if (status === 'submitted' && (growth === null || role === null)) {
    return NextResponse.json({ ok:false, message:'Both manager KPI scores are required before submission.' }, { status:400 });
  }
  await db.query(`insert into manager_monthly_reviews
    (employee_slug,month_key,growth_score,role_excellence_score,went_well,needs_improvement,next_priorities,support_needed,manager_summary,status,reviewed_by_email,updated_at)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,now())
    on conflict (employee_slug,month_key) do update set growth_score=excluded.growth_score, role_excellence_score=excluded.role_excellence_score,
    went_well=excluded.went_well, needs_improvement=excluded.needs_improvement, next_priorities=excluded.next_priorities,
    support_needed=excluded.support_needed, manager_summary=excluded.manager_summary, status=excluded.status,
    reviewed_by_email=excluded.reviewed_by_email, submitted_at=case when excluded.status='submitted' then now() else manager_monthly_reviews.submitted_at end, updated_at=now()`, [
      slug, month, growth, role, String(body.wentWell ?? ''), String(body.needsImprovement ?? ''),
      String(body.nextPriorities ?? ''), String(body.supportNeeded ?? ''), String(body.managerSummary ?? ''),
      status, current.session.user.email
    ]);
  return NextResponse.json({ ok:true, status });
}
