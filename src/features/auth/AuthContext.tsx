import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../../services/firebase/firebase';

interface AuthContextValue {
  /** The signed-in Firebase user, or null if signed out. */
  user: User | null;
  /** True until the initial auth state has resolved once. */
  loading: boolean;
  /** Any error from the last sign-in attempt. */
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Provides Firebase auth state to the whole app.
 *
 * This context only reflects *identity* (who is signed in). It says
 * nothing about authorization — role, approval status, or what the
 * person is allowed to read/write. That is decided by Firestore
 * Security Rules on the backend and, from Phase 1 onward, by the
 * person's application/approval status stored in Firestore. Route
 * guards built on top of this context are a UX convenience only, never
 * the security boundary.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Sign-in failed. Please try again.',
      );
    }
  }

  async function signOut() {
    setError(null);
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Sign-out failed. Please try again.',
      );
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
