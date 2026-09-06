import { useAuth } from "@/features/auth/AuthContext";

/**
 * Shown to signed-in users whose role is "pending" or "rejected". The
 * full onboarding/application form is built in Phase 1 — this Phase 0
 * placeholder only proves the auth -> role -> route architecture works.
 */
export function Pending() {
  const { role, signOut } = useAuth();

  const message =
    role === "rejected"
      ? "Your application was not approved. If you believe this is a mistake, please contact an administrator."
      : "Thanks for signing in. Your application is awaiting review by a batch moderator. This usually doesn't take long.";

  return (
    <section className="hero-band">
      <h1 style={{ fontSize: 28 }}>Almost there</h1>
      <p style={{ color: "var(--color-body)", maxWidth: 480 }}>{message}</p>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => void signOut()}
      >
        Log out
      </button>
    </section>
  );
}
