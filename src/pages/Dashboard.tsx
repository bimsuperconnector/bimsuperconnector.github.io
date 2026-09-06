import { useAuth } from "@/features/auth/AuthContext";

export function Dashboard() {
  const { profile } = useAuth();

  return (
    <section>
      <h1 style={{ fontSize: 28 }}>
        Welcome{profile?.displayName ? `, ${profile.displayName}` : ""}
      </h1>
      <p style={{ color: "var(--color-body)" }}>
        This is a placeholder portal home. Profiles, directory, jobs,
        events and the rest of the alumni portal are built in the phases
        that follow.
      </p>
    </section>
  );
}
