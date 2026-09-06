import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useUserRecord } from '../features/onboarding/useUserRecord';
import { isReviewerRole, ROLE_LABELS } from '../domain/onboarding/roles';

/**
 * Placeholder for the authenticated portal — only reachable once
 * PortalRoute confirms an approved role. Phase 2+ replace this with the
 * real profile/directory/connector/jobs/events modules; for Phase 1 it
 * proves the pending → review → approved flow works end to end and
 * surfaces a link to the review queue for reviewer roles.
 */
export function DashboardPage() {
  const { user, signOut } = useAuth();
  const { record } = useUserRecord();

  return (
    <section aria-labelledby="dashboard-heading">
      <h1 id="dashboard-heading">Dashboard</h1>
      <p>Signed in as {user?.displayName ?? user?.email}.</p>
      {record && <p>Role: {ROLE_LABELS[record.role]}</p>}
      <p>
        The member portal (profile, directory, connector, jobs, events, etc.) is
        implemented in later phases.
      </p>
      {record && isReviewerRole(record.role) && (
        <p>
          <Link to="/review">Review applications</Link>
        </p>
      )}
      <button type="button" onClick={signOut}>
        Sign out
      </button>
    </section>
  );
}
