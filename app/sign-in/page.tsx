import { SignInButton } from '@/components/sign-in-button';

export default function SignInPage() {
  return (
    <main className="signin-page">
      <section className="signin-card" aria-labelledby="signin-title">
        <div className="signin-brand" aria-hidden="true">B</div>
        <p className="signin-kicker">Blinto Team Performance</p>
        <h1 id="signin-title">Employee sign in</h1>
        <p className="signin-copy">Access your performance dashboard, reviews, career framework, and team information with your approved Google account.</p>
        <SignInButton />
        <p className="signin-note">Blinto employees and approved collaborators only.</p>
      </section>
    </main>
  );
}
