import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { auth } from "@/services/firebase/config";
import {
  ensureUserDocument,
  signInWithGoogle,
  signOutUser,
  type AppUserDoc,
} from "@/services/firebase/auth";
import { AuthContext, type AuthContextValue } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const doc = await ensureUserDocument(firebaseUser);
          setProfile(doc);
        } catch (error) {
          console.error("Failed to load or create user profile:", error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      role: profile?.role ?? null,
      loading,
      signIn: async () => {
        await signInWithGoogle();
      },
      signOut: async () => {
        await signOutUser();
      },
    }),
    [user, profile, loading],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}