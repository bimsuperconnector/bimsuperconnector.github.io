import { useAuth } from '../features/auth/AuthContext';

/**
 * Placeholder for the authenticated portal. Phase 1 replaces this with
 * the real pending/approved application flow; for Phase 0 it only proves
 * that the protected-route + Firebase Auth architecture works end to end.
 */
export function DashboardPage() {
  const { user, signOut } = useAuth();

  return (
    <section aria-labelledby="dashboard-heading">
      <h1 id="dashboard-heading">Dashboard</h1>
      <p>Signed in as {user?.displayName ?? user?.email}.</p>
      <p>
        The member portal (profile, directory, connector, jobs, events, etc.) is
        implemented in later phases.
      </p>
      <button type="button" onClick={signOut}>
        Sign out
      </button>
    </section>
  );
}
