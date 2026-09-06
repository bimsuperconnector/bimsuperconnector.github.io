import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserRecord } from '../context/UserRecordContext';

/**
 * Full Phase 1 gate: signed out -> /login, signed in but not yet approved
 * (pending or rejected) -> /pending, approved -> render.
 *
 * This is a UX convenience only. Firestore Rules remain the authoritative
 * enforcement point for every collection this app will ever read/write —
 * this component just avoids flashing private UI at someone who isn't
 * approved yet.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, configured } = useAuth();
  const { record, loading: recordLoading } = useUserRecord();

  if (!configured) {
    return <Navigate to="/login" replace />;
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-body-md text-muted">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (recordLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-body-md text-muted">
        Loading…
      </div>
    );
  }

  if (!record || record.status !== 'approved') {
    return <Navigate to="/pending" replace />;
  }

  return <>{children}</>;
}
