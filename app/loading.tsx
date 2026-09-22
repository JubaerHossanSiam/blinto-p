/**
 * Default route-level loading UI.
 *
 * Every route in this app renders dynamically (the root layout reads cookies
 * and headers for the signed-in user), and Next.js skips prefetching dynamic
 * routes unless they have a loading boundary. Without this file a navigation
 * left the previous page on screen, with no feedback, until the whole server
 * render finished. Nested loading.tsx files override this one.
 */
export default function Loading() {
  return (
    <div className="shell route-skeleton">
      <div className="route-skeleton-head">
        <span className="sk sk-eyebrow" />
        <span className="sk sk-title" />
        <span className="sk sk-line" />
        <span className="sk sk-line short" />
      </div>
      <div className="sk-rows">
        <span className="sk sk-row" />
        <span className="sk sk-row" />
        <span className="sk sk-row" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
