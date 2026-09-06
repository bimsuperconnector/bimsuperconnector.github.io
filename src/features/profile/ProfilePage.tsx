import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useProfile } from './useProfile';
import { ProfileView } from './ProfileView';
import { ProfileEditForm } from './ProfileEditForm';

/**
 * Phase 2 profile view/edit screen. Only reachable via PortalRoute (an
 * approved member), same as Dashboard — see src/app/App.tsx.
 */
export function ProfilePage() {
  const { user } = useAuth();
  const { profile, loading, error, reload } = useProfile(user?.uid);
  const [editing, setEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="page-status" role="status" aria-live="polite">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="form-error">
        {error}
      </p>
    );
  }

  if (!user || !profile) {
    return (
      <p>
        No profile found yet — this shouldn&apos;t normally happen for an
        approved member.
      </p>
    );
  }

  return (
    <section aria-labelledby="profile-heading">
      <h1 id="profile-heading">Your profile</h1>

      {savedMessage && !editing && <p role="status">{savedMessage}</p>}

      {editing ? (
        <ProfileEditForm
          uid={user.uid}
          profile={profile}
          onSaved={() => {
            setEditing(false);
            setSavedMessage('Your profile has been updated.');
            reload();
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <ProfileView
          profile={profile}
          onEdit={() => {
            setSavedMessage(null);
            setEditing(true);
          }}
        />
      )}
    </section>
  );
}
