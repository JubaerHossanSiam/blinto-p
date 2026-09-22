/**
 * Shell for the portal dashboard. Mirrors the card grid in app/portal/page.tsx
 * so the layout does not shift when the real content streams in.
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

      <div className="sk-grid cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="sk-card">
            <span className="sk sk-line short" />
            <span className="sk sk-line" />
            <span className="sk sk-line short" />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading your portal…</span>
    </div>
  );
}
