import { SignInButton } from '@/components/sign-in-button';

export default function SignInPage() {
  return (
    <main className="shell" style={{ maxWidth: 520, paddingTop: 120, paddingBottom: 120, textAlign: 'center' }}>
      <p className="eyebrow">Blinto Team Performance</p>
      <h1 className="page-title">Employee Sign In</h1>
      <p className="page-subtitle">Use your approved Google account to continue.</p>
      <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}>
        <SignInButton />
      </div>
    </main>
  );
}
