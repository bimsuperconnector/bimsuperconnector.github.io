import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <section>
      <h1>Page not found</h1>
      <p>
        <Link to="/">Return home</Link>
      </p>
    </section>
  );
}
