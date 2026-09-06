import { Link, Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="app-shell">
      <nav className="top-nav">
        <Link to="/" className="top-nav__brand">
          SuperConnector
        </Link>
        <Link to="/login" className="btn btn-secondary">
          Log in
        </Link>
      </nav>
      <main className="app-shell__content">
        <Outlet />
      </main>
      <footer
        style={{
          padding: "var(--space-xl) var(--space-xxl)",
          borderTop: "1px solid var(--color-hairline)",
          color: "var(--color-muted)",
          fontSize: 14,
        }}
      >
        <Link to="/terms">Terms</Link> · <Link to="/privacy">Privacy</Link>
      </footer>
    </div>
  );
}
