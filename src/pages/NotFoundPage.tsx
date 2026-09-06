import { Link } from 'react-router-dom';
import { Container } from '../components/ui/Container';

export function NotFoundPage() {
  return (
    <section className="py-section">
      <Container className="text-center">
        <h1 className="text-display-md text-ink">Page not found</h1>
        <p className="mt-md text-body-md text-body">
          That page doesn't exist, or you don't have access to it.
        </p>
        <Link to="/" className="mt-lg inline-block text-body-md text-link">
          Back to the homepage
        </Link>
      </Container>
    </section>
  );
}
