import { useAuth } from '../../context/AuthContext';

export function AppHomePage() {
  const { user } = useAuth();
  return (
    <div className="rounded-md border border-hairline p-xl">
      <h1 className="text-title-lg text-ink">Welcome{user?.displayName ? `, ${user.displayName}` : ''}</h1>
      <p className="mt-sm text-body-md text-body">
        This is the private SuperConnector portal shell. Profile, directory,
        matching, jobs, events, and notifications are built out in later
        phases on top of this foundation.
      </p>
    </div>
  );
}
