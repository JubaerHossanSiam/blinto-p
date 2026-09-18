import { NextResponse } from 'next/server';

import { getCurrentPortalUser } from '@/lib/access';
import { getLiveClickUpEvidence } from '@/lib/clickup-performance';
import { people } from '@/lib/people';

export const dynamic = 'force-dynamic';

export async function POST() {
  const current = await getCurrentPortalUser();
  if (!current || current.actualPortalUser.role !== 'admin' || current.viewingAs) {
    return NextResponse.json({ ok: false, message: 'Admin access required.' }, { status: 403 });
  }

  const results = await Promise.all(
    people.map(async (person) => ({
      slug: person.slug,
      evidence: await getLiveClickUpEvidence(person, '2026-09', true),
    })),
  );

  const connected = results.filter((item) => item.evidence.connected).length;
  const ratedTasks = results.reduce((sum, item) => sum + item.evidence.ratedTasks, 0);

  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    employeesSynced: connected,
    ratedTasks,
    message: `Fresh ClickUp data loaded for ${connected} employees.`,
  });
}
