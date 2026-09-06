import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useUserRecord } from '../features/onboarding/useUserRecord';
import { isReviewerRole, ROLE_LABELS } from '../domain/onboarding/roles';

/**
 * The authenticated portal home — only reachable once PortalRoute
 * confirms an approved role. Phase 2 adds the Profile quick link;
 * directory/connector/jobs/events modules are later phases. The
 * "quick links" list below follows Design-superconnector.md's
 * `demo-grid-card` treatment (see .dashboard-links in src/index.css).
 */
export function DashboardPage() {
  const { user, signOut } = useAuth();
  const { record } = useUserRecord();

  return (
    <section aria-labelledby="dashboard-heading">
      <h1 id="dashboard-heading">Dashboard</h1>
      <p className="dashboard-greeting">
        Signed in as {user?.displayName ?? user?.email}
        {record && <> · {ROLE_LABELS[record.role]}</>}
      </p>

      <ul className="dashboard-links">
        <li>
          <Link to="/profile" className="dashboard-link-card">
            <span className="dashboard-link-title">Your profile</span>
            <span className="dashboard-link-desc">
              View and edit your name, photo, batch, education and work history.
            </span>
          </Link>
        </li>
        {record && isReviewerRole(record.role) && (
          <li>
            <Link to="/review" className="dashboard-link-card">
              <span className="dashboard-link-title">Review applications</span>
              <span className="dashboard-link-desc">
                Approve or decline pending alumni applications.
              </span>
            </Link>
          </li>
        )}
      </ul>

      <p className="dashboard-note">
        Directory, monthly networking, jobs and events are implemented in later
        phases.
      </p>

      <button type="button" className="btn-secondary" onClick={signOut}>
        Sign out
      </button>
    </section>
  );
}
