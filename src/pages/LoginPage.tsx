import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

/**
 * Google Sign-In only. SuperConnector never collects or stores Google
 * passwords — Firebase Authentication handles the OAuth flow entirely.
 *
 * Phase 0 scope: sign in and land on the (protected) dashboard
 * placeholder. The pending → review → approved/rejected application
 * flow described in CLAUDE.md is implemented in Phase 1.
 */
export function LoginPage() {
  const { user, loading, error, signInWithGoogle } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <section aria-labelledby="login-heading">
      <h1 id="login-heading">Sign in</h1>
      <p>Use your Google account to sign in.</p>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button type="button" onClick={signInWithGoogle} disabled={loading}>
        Sign in with Google
      </button>
      <p className="legal-note">
        By continuing you agree to the <Link to="/terms">Terms of Service</Link>{' '}
        and <Link to="/privacy">Privacy Policy</Link>.
      </p>
    </section>
  );
}
