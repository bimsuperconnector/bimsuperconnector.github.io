import { Link, Outlet } from 'react-router-dom';

/**
 * Shared shell for every page. Deliberately unstyled beyond basic,
 * accessible structure — Design-superconnector.md (colors, typography,
 * spacing, components) has not been supplied yet, so no visual design
 * decisions are baked in here. Once that file exists, this layout is
 * where its design system gets applied.
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
