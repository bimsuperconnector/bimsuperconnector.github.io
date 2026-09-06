import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';
import { LinkButton } from '../ui/Button';

export function TopNav() {
  return (
    <header className="h-16 w-full bg-canvas">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="text-title-sm font-haas-disp text-ink">
          SuperConnector
        </Link>
        <nav className="hidden items-center gap-xl text-body-md text-body md:flex">
          <Link to="/#how-it-works" className="hover:text-ink">
            How it works
          </Link>
          <Link to="/#network" className="hover:text-ink">
            The network
          </Link>
        </nav>
        <LinkButton href="/login" variant="primary" className="px-lg py-sm">
          Sign in
        </LinkButton>
      </Container>
    </header>
  );
}
