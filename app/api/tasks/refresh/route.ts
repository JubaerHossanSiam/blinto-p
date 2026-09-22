import { NextResponse } from 'next/server';

import { getCurrentPortalUser, getTaskVisibleEmployeeSlugs } from '@/lib/access';
import { getTaskBoard } from '@/lib/clickup-tasks';
import { getTaskRatings } from '@/lib/task-ratings';

export const dynamic = 'force-dynamic';

/**
 * Re-reads one person straight from ClickUp, skipping the 120s fetch cache the
 * board is normally served from. Scoped to a single slug so a refresh costs one
 * assignee's pages rather than the whole team's.
 */
export async function POST(request: Request) {
  const current = await getCurrentPortalUser();
  if (!current) {
    return NextResponse.json({ ok: false, message: 'Sign in required.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as { slug?: string } | null;
  const slug = body?.slug?.trim();
  if (!slug) {
    return NextResponse.json({ ok: false, message: 'Employee is required.' }, { status: 400 });
  }

  // Never widen what this account may see: the same list the board was built
  // from decides whether this slug is refreshable.
  const visible = await getTaskVisibleEmployeeSlugs(current.portalUser);
  if (!visible.includes(slug)) {
    return NextResponse.json({ ok: false, message: 'You cannot view this employee.' }, { status: 403 });
  }

  const [board, ratings] = await Promise.all([
    getTaskBoard([slug], true),
    getTaskRatings([slug]),
  ]);

  const group = board.groups.find((candidate) => candidate.slug === slug);
  if (!group) {
    return NextResponse.json({ ok: false, message: 'No task data for that employee.' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    group,
    ratings,
    connected: board.connected,
    message: board.message ?? null,
    syncedAt: board.fetchedAt,
  });
}
