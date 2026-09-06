import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

/**
 * Google Sign-In only. SuperConnector never collects or stores Google
 * passwords — Firebase Authentication handles the OAuth flow entirely.
 *
 * After sign-in, people land on /onboarding, which itself decides what
 * to show (application form, pending/rejected status, or a redirect
 * straight to /dashboard) based on their `/users/{uid}` record — see
 * OnboardingPage.
 */
export function LoginPage() {
  const { user, loading, error, signInWithGoogle } = useAuth();

  if (!loading && user) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <section aria-labelledby="login-heading" className="hero-band login-band">
      <h1 id="login-heading">Sign in</h1>
      <p className="hero-subhead">Use your Google account to sign in.</p>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button
        type="button"
        className="btn-primary"
        onClick={signInWithGoogle}
        disabled={loading}
      >
        Sign in with Google
      </button>
      <p className="legal-note">
        By continuing you agree to the <Link to="/terms">Terms of Service</Link>{' '}
        and <Link to="/privacy">Privacy Policy</Link>.
      </p>
    </section>
  );
}
