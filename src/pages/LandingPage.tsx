import { Link } from 'react-router-dom';

/**
 * Public landing page. Per LEGAL.md / Phase 15, the eventual version
 * shows safe aggregate metrics only (never private data) plus a Login
 * call to action. Phase 0 ships the skeleton; real metrics arrive once
 * there is data and a Phase 15 pass to design the final layout.
 */
export function LandingPage() {
  return (
    <section aria-labelledby="landing-heading">
      <h1 id="landing-heading">SuperConnector</h1>
      <p>
        A private, free professional network for verified BIM alumni — profiles,
        monthly networking, jobs, ventures, and events.
      </p>
      <p>
        <Link to="/login" className="cta">
          Sign in to continue
        </Link>
      </p>
    </section>
  );
}
