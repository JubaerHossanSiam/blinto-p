import { NextResponse } from 'next/server';

import { getCurrentPortalUser } from '@/lib/access';
import { db } from '@/lib/db';

type Context = { params: Promise<{ taskId: string; fieldId: string }> };

export async function PUT(request: Request, { params }: Context) {
  const current = await getCurrentPortalUser();
  if (!current || current.actualPortalUser.role !== 'admin' || current.viewingAs) {
    return NextResponse.json({ ok: false, message: 'CEO/Admin access required.' }, { status: 403 });
  }

  const { taskId, fieldId } = await params;
  const body = await request.json() as { action?: 'validate' | 'reject'; employeeSlug?: string };
  if (!body.employeeSlug || (body.action !== 'validate' && body.action !== 'reject')) {
    return NextResponse.json({ ok: false, message: 'Employee and valid action are required.' }, { status: 400 });
  }

  if (body.action === 'validate') {
    await db.query(
      `update task_rating_integrity
          set verification_status='verified',
              verified_score=current_score, verified_label=current_label,
              verified_actor_clickup_id=current_actor_clickup_id,
              verified_actor_name=current_actor_name,
              validation_reason='Validated as a legitimate exception by CEO/Admin.',
              validated_by_email=$4, validated_at=now(), updated_at=now()
        where task_id=$1 and field_id=$2 and employee_slug=$3`,
      [taskId, fieldId, body.employeeSlug, current.actualPortalUser.email],
    );
  } else {
    await db.query(
      `update task_rating_integrity
          set verification_status='invalid',
              validation_reason='Rejected by CEO/Admin.',
              validated_by_email=$4, validated_at=now(), updated_at=now()
        where task_id=$1 and field_id=$2 and employee_slug=$3`,
      [taskId, fieldId, body.employeeSlug, current.actualPortalUser.email],
    );
  }

  return NextResponse.json({ ok: true });
}
