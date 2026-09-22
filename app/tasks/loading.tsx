/**
 * /tasks is the slowest route in the app: the ClickUp board is paginated from
 * the upstream API on every render. This shell mirrors app/tasks/page.tsx so
 * the header lands in its final position and only the board area swaps in.
 */
export default function Loading() {
  return (
    <main className="shell route-skeleton">
      <header className="route-skeleton-head">
        <span className="sk sk-eyebrow" />
        <span className="sk sk-title" />
        <span className="sk sk-line" />
      </header>

      <div className="sk-rows">
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className="sk sk-row" />
        ))}
      </div>

      <span className="sr-only">Loading assigned tasks from ClickUp…</span>
    </main>
  );
}
