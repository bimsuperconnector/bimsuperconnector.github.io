import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";

export function Login() {
  const { user, loading, signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSignIn() {
    setError(null);
    setSigningIn(true);
    try {
      await signIn();
    } catch {
      setError("Sign-in failed. Please try again.");
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <section className="hero-band">
      <h1 style={{ fontSize: 32 }}>Sign in to SuperConnector</h1>
      <p style={{ color: "var(--color-body)", maxWidth: 480 }}>
        Use your Google account to sign in. New accounts require review by
        a batch moderator before you can access the alumni portal.
      </p>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => void handleSignIn()}
        disabled={signingIn || loading}
      >
        {signingIn ? "Signing in…" : "Continue with Google"}
      </button>
      {error && (
        <p role="alert" style={{ color: "#b00020", marginTop: 16 }}>
          {error}
        </p>
      )}
    </section>
  );
}
