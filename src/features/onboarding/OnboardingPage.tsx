import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useUserRecord } from './useUserRecord';
import { ApplicationForm } from './ApplicationForm';
import { PendingStatus, RejectedStatus } from './ApplicationStatus';
import { isApprovedRole } from '../../domain/onboarding/roles';

/**
 * The single hub for the Phase 1 application flow: shows the
 * application form if no `/users/{uid}` doc exists yet, a pending
 * banner while under review, a rejected banner (with an option to ask
 * for another review) if declined, and redirects straight to the
 * portal once the person holds an approved role.
 */
export function OnboardingPage() {
  const { user } = useAuth();
  const { record, loading, error } = useUserRecord();

  if (!user) {
    // Should not normally happen — this page sits behind ProtectedRoute
    // — but keeps the component safe to render standalone (e.g. tests).
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="page-status" role="status" aria-live="polite">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="form-error">
        {error}
      </p>
    );
  }

  if (!record) {
    return (
      <section aria-labelledby="onboarding-heading">
        <h1 id="onboarding-heading">Join SuperConnector</h1>
        <p>
          Tell us a bit about yourself. A batch moderator or admin reviews every
          application before you get portal access.
        </p>
        <ApplicationForm
          uid={user.uid}
          account={{
            email: user.email,
            fallbackDisplayName:
              user.displayName ?? user.email ?? 'Alumni member',
          }}
        />
      </section>
    );
  }

  if (record.role === 'pending') return <PendingStatus />;
  if (record.role === 'rejected') return <RejectedStatus record={record} />;
  if (isApprovedRole(record.role)) return <Navigate to="/dashboard" replace />;

  return null;
}
