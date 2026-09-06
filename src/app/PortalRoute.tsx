import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useUserRecord } from '../features/onboarding/useUserRecord';
import { isApprovedRole } from '../domain/onboarding/roles';

/**
 * Gates a route on the person holding an approved role (member or
 * higher) — the actual member portal, as opposed to the onboarding
 * flow. Composed on top of `ProtectedRoute` (which only checks Firebase
 * Auth identity) rather than modifying it, so Phase 0's tested
 * behavior is untouched.
 *
 * As with ProtectedRoute, this is a UX convenience only: Firestore
 * Security Rules are the actual security boundary.
 */
export function PortalRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <RequireApprovedRole>{children}</RequireApprovedRole>
    </ProtectedRoute>
  );
}

function RequireApprovedRole({ children }: { children: ReactNode }) {
  const { record, loading } = useUserRecord();

  if (loading) {
    return (
      <div className="page-status" role="status" aria-live="polite">
        Loading…
      </div>
    );
  }

  if (!record || !isApprovedRole(record.role)) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
