import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';

export function Footer() {
  return (
    <footer className="bg-canvas py-xxl text-body-md text-muted">
      <Container className="flex flex-col gap-lg md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} SuperConnector. For alumni, by alumni.</p>
        <nav className="flex gap-lg">
          <Link to="/terms" className="hover:text-ink">
            Terms
          </Link>
          <Link to="/privacy" className="hover:text-ink">
            Privacy
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
