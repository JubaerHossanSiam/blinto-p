import { TaskBoard } from '@/components/task-board';
import { getTaskVisibleEmployeeSlugs, requirePortalUser } from '@/lib/access';
import { getTaskBoard } from '@/lib/clickup-tasks';
import { getTaskRatings } from '@/lib/task-ratings';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const { portalUser } = await requirePortalUser();
  const visibleSlugs = await getTaskVisibleEmployeeSlugs(portalUser);
  const [board, ratings] = await Promise.all([
    getTaskBoard(visibleSlugs),
    getTaskRatings(visibleSlugs),
  ]);

  // Rating authority is decided server-side on save; this only controls whether
  // the button is worth offering.
  const canRate = portalUser.role === 'manager'
    || portalUser.role === 'delivery_reviewer'
    || portalUser.role === 'people_ops'
    || portalUser.role === 'admin';

  return (
    <main className="shell task-shell">
      <header className="task-header">
        <p className="eyebrow">ClickUp</p>
        <h1 className="page-title">Assigned Tasks</h1>
      </header>

      {board.message ? (
        <div className="info-box task-notice">
          <strong>ClickUp tasks are not loading</strong>
          <p>{board.message}</p>
        </div>
      ) : null}

      {board.groups.length ? (
        <TaskBoard
          groups={board.groups}
          connected={board.connected}
          ratings={ratings}
          viewerSlug={portalUser.employeeSlug}
          canRate={canRate}
        />
      ) : (
        <p className="task-empty">
          {portalUser.role === 'manager'
            // The board is now direct reports only, so a manager with none has
            // nobody to show rather than a broken account.
            ? 'No direct reports are assigned to you, so there are no tasks to rate.'
            : 'This account is not linked to an employee record, so no tasks can be shown.'}
        </p>
      )}
    </main>
  );
}
