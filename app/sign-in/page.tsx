import { SignInButton } from '@/components/sign-in-button';

export default function SignInPage() {
  return (
    <main className="shell" style={{ maxWidth: 720, paddingTop: 80, paddingBottom: 80 }}>
      <p className="eyebrow">Blinto Performance Portal</p>
      <h1 className="page-title">Sign in</h1>
      <p className="page-subtitle">Use an approved Google account. Signing in proves your identity; portal access is granted only when your email is active in the Blinto approved-user list.</p>
      <div className="panel" style={{ marginTop: 28 }}>
        <h2>Employee access</h2>
        <p>Employees see their own Performance Card and Blinto performance framework. Managers see their direct reports. Delivery reviewers, People Ops, and administrators receive the additional access assigned to their role.</p>
        <SignInButton />
      </div>
    </main>
  );
}
