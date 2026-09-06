import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRecord } from '../context/UserRecordContext';

/**
 * Gates /app/admin on the `isAdmin` flag. As with ProtectedRoute, this is
 * UX only — Firestore Rules independently require isAdmin: true on the
 * caller's own doc before any admin write (approving/rejecting another
 * user) is accepted.
 *
 * Full role hierarchy (superAdmin/platformAdmin/batchModerator/etc.) and a
 * real admin dashboard are Phase 11. This is intentionally the smallest
 * possible approve/reject console so Phase 1's acceptance criteria
 * ("Approval/rejection flow") can be met without building Phase 11 early.
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { record, loading } = useUserRecord();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-body-md text-muted">
        Loading…
      </div>
    );
  }

  if (!record?.isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
