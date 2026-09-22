import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { getCurrentPortalUser } from '@/lib/access';
import { TASK_CACHE_TAG } from '@/lib/clickup-tasks';

export const dynamic = 'force-dynamic';

/**
 * Drops the cached ClickUp reads so the next render of the board fetches live.
 * Invalidating rather than returning data keeps the board a plain server
 * component: the caller follows this with router.refresh() and the page
 * rebuilds itself from fresh ClickUp responses.
 */
export async function POST() {
  const current = await getCurrentPortalUser();
  if (!current) {
    return NextResponse.json({ ok: false, message: 'Sign in required.' }, { status: 401 });
  }

  // { expire: 0 } rather than the usual "max": max serves stale content while
  // it refetches in the background, which would leave the person who just
  // pressed Sync looking at the same data they pressed it to replace.
  revalidateTag(TASK_CACHE_TAG, { expire: 0 });
  return NextResponse.json({ ok: true, syncedAt: new Date().toISOString() });
}
