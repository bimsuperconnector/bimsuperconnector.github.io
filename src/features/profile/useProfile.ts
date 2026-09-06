import { useCallback, useEffect, useState } from 'react';
import { fetchProfile } from '../../services/firebase/firestore';
import type { ProfileApplication } from '../../domain/onboarding/types';

interface ProfileState {
  /** undefined = still loading, null = no profile doc found. */
  profile: ProfileApplication | null | undefined;
  loading: boolean;
  error: string | null;
  /** Re-fetches after a successful save so the view mode reflects it. */
  reload: () => void;
}

/**
 * Loads the signed-in person's own `/profiles/{uid}` document for the
 * Phase 2 profile view/edit screen. A one-time fetch (+ manual reload
 * after save) is enough here — unlike `useUserRecord` (which gates
 * routing and genuinely needs a live subscription), nothing else
 * writes to this document while the person is looking at it.
 */
export function useProfile(uid: string | undefined): ProfileState {
  const [profile, setProfile] = useState<ProfileApplication | null | undefined>(
    undefined,
  );
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setProfile(undefined);
    setError(null);

    fetchProfile(uid)
      .then((next) => {
        if (!cancelled) setProfile(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Could not load your profile.',
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [uid, reloadToken]);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  return { profile, loading: !!uid && profile === undefined, error, reload };
}
