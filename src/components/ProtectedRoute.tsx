import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";

const APPROVED_ROLES = new Set([
  "superAdmin",
  "platformAdmin",
  "applicationAdmin",
  "batchModerator",
  "member",
]);

/**
 * Route-guard for the authenticated portal. This is a UX convenience only
 * — the real authorization boundary is Firestore Security Rules, which
 * this component never substitutes for.
 *
 * - Not signed in -> /login
 * - Signed in but pending/rejected -> /pending
 * - Signed in and approved -> render the nested route
 */
export function ProtectedRoute() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="page-loading">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !APPROVED_ROLES.has(role)) {
    return <Navigate to="/pending" replace />;
  }

  return <Outlet />;
}
