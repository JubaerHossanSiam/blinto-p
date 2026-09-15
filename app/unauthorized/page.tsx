import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="shell" style={{ maxWidth: 720, paddingTop: 80, paddingBottom: 80 }}>
      <p className="eyebrow">Blinto Performance Portal</p>
      <h1 className="page-title">Access not available</h1>
      <p className="page-subtitle">Your account is signed in, but this employee profile is outside your current access scope.</p>
      <div className="hero-actions" style={{ marginTop: 24 }}>
        <Link className="button" href="/portal">Back to my portal</Link>
        <Link className="button button-secondary" href="/framework">View framework</Link>
      </div>
    </main>
  );
}
