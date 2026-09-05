import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

/**
 * Gates a route on the person being signed in.
 *
 * IMPORTANT: this is a UX convenience, not the security boundary. Every
 * protected read/write is enforced independently by Firestore Security
 * Rules. Starting Phase 1, this will also need to check approval status
 * (pending/approved/rejected) once that state exists in Firestore — for
 * Phase 0 it only checks Firebase Auth identity.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-status" role="status" aria-live="polite">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
