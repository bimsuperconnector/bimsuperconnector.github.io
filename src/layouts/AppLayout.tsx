import { Link, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";

export function AppLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <Link to="/dashboard" className="top-nav__brand">
          SuperConnector
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "var(--color-muted)", fontSize: 14 }}>
            {user?.displayName ?? user?.email}
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void signOut()}
          >
            Log out
          </button>
        </div>
      </nav>
      <main className="app-shell__content">
        <Outlet />
      </main>
    </div>
  );
}
