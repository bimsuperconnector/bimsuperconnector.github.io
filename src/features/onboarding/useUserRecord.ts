import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { subscribeToUserRecord } from '../../services/firebase/firestore';
import type { UserRecord } from '../../domain/onboarding/types';

interface UserRecordState {
  /** undefined = still loading, null = no application on file yet. */
  record: UserRecord | null | undefined;
  loading: boolean;
  error: string | null;
}

/**
 * Subscribes (in real time) to the signed-in person's own `/users/{uid}`
 * document — their role/application-status record. This is the client
 * read of the same authorization state Firestore rules enforce; it
 * drives UX only (which screen to show), never the actual security
 * decision.
 */
export function useUserRecord(): UserRecordState {
  const { user } = useAuth();
  const [record, setRecord] = useState<UserRecord | null | undefined>(
    undefined,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRecord(null);
      setError(null);
      return;
    }

    setRecord(undefined);
    setError(null);

    const unsubscribe = subscribeToUserRecord(
      user.uid,
      (next) => setRecord(next),
      (err) => setError(err.message),
    );
    return unsubscribe;
  }, [user]);

  return { record, loading: !!user && record === undefined, error };
}
