/**
 * Shell for the team roster table. Also covers /team/[slug] and the nested
 * review route until those add their own loading.tsx.
 */
export default function Loading() {
  return (
    <section className="dashboard-shell">
      <div className="shell route-skeleton">
        <div className="route-skeleton-head">
          <span className="sk sk-eyebrow" />
          <span className="sk sk-title" />
          <span className="sk sk-line" />
        </div>

        <div className="sk-rows">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className="sk sk-row" />
          ))}
        </div>

        <span className="sr-only">Loading employee performance cards…</span>
      </div>
    </section>
  );
}
