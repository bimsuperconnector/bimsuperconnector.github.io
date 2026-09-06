import { Link, Outlet } from 'react-router-dom';

/**
 * Shared shell for every page. Styled with Design-superconnector.md's
 * tokens via src/index.css / src/styles/tokens.css (now that the owner
 * has supplied that file) — see CLAUDE.md's Design section.
 */
export function RootLayout() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="app-header">
        <Link to="/" className="brand">
          SuperConnector
        </Link>
      </header>

      <main id="main-content" className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <nav aria-label="Legal">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </nav>
        <p className="footer-note">
          Private alumni network. No ads, no commissions.
        </p>
      </footer>
    </div>
  );
}
