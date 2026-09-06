import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  type UserRecord,
  ensureUserRecord,
  subscribeToUserRecord,
} from '../firebase/repositories/usersRepository';
import { firebaseConfigured } from '../firebase/init';

interface UserRecordContextValue {
  record: UserRecord | null;
  /** True while we don't yet know the record (auth resolving, doc loading, or first-time creation in flight). */
  loading: boolean;
}

const UserRecordContext = createContext<UserRecordContextValue | undefined>(undefined);

export function UserRecordProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [record, setRecord] = useState<UserRecord | null>(null);
  const [recordLoading, setRecordLoading] = useState(false);

  useEffect(() => {
    if (!firebaseConfigured || !user) {
      setRecord(null);
      return;
    }

    let cancelled = false;
    let cleanup: (() => void) | undefined;
    setRecordLoading(true);

    // Create the pending users/{uid} doc on first sign-in. Firestore Rules
    // are what actually enforce that this can only ever be created as
    // 'pending' with isAdmin: false — see usersRepository.ts.
    ensureUserRecord(user)
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[onboarding] Failed to create user record', error);
      })
      .finally(() => {
        if (cancelled) return;
        cleanup = subscribeToUserRecord(user.uid, (nextRecord) => {
          if (cancelled) return;
          setRecord(nextRecord);
          setRecordLoading(false);
        });
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [user]);

  const loading = authLoading || (Boolean(user) && recordLoading && !record);

  return (
    <UserRecordContext.Provider value={{ record, loading }}>
      {children}
    </UserRecordContext.Provider>
  );
}

export function useUserRecord(): UserRecordContextValue {
  const ctx = useContext(UserRecordContext);
  if (!ctx) {
    throw new Error('useUserRecord must be used within a UserRecordProvider');
  }
  return ctx;
}
