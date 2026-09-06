import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Foundation-level guard: redirects signed-out visitors to /login.
 *
 * This intentionally does NOT yet check profile-approval status —
 * that pending/approved/rejected gate belongs to Phase 1 (Authentication
 * & onboarding) and to Firestore Rules, which remain the authoritative
 * enforcement point regardless of what this component does.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();

  if (!configured) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-body-md text-muted">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
