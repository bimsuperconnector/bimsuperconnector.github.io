import { Link } from "react-router-dom";

export function Landing() {
  return (
    <section className="hero-band">
      <h1 style={{ fontSize: 40, fontWeight: 400 }}>
        The private network for BIM alumni
      </h1>
      <p style={{ maxWidth: 560, color: "var(--color-body)" }}>
        Find classmates, discover opportunities, and build your
        professional circle — built by and for verified BIM alumni only.
      </p>
      <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
        <Link to="/login" className="btn btn-primary">
          Sign up for free
        </Link>
      </div>
    </section>
  );
}
