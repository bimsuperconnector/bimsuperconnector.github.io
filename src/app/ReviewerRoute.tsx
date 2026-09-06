import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useUserRecord } from '../features/onboarding/useUserRecord';
import { isReviewerRole } from '../domain/onboarding/roles';

/** Gates a route on the person holding a reviewer role (batch moderator
 * or any admin role). See PortalRoute for why this composes
 * ProtectedRoute rather than editing it. */
export function ReviewerRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <RequireReviewerRole>{children}</RequireReviewerRole>
    </ProtectedRoute>
  );
}

function RequireReviewerRole({ children }: { children: ReactNode }) {
  const { record, loading } = useUserRecord();

  if (loading) {
    return (
      <div className="page-status" role="status" aria-live="polite">
        Loading…
      </div>
    );
  }

  if (!record || !isReviewerRole(record.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
