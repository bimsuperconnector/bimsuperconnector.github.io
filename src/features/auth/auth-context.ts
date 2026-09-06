import { createContext } from "react";
import type { User } from "firebase/auth";
import type { AppRole, AppUserDoc } from "@/services/firebase/auth";

export interface AuthContextValue {
  /** Firebase Auth identity, or null when signed out. */
  user: User | null;
  /** Firestore users/{uid} document, or null while loading/signed out. */
  profile: AppUserDoc | null;
  role: AppRole | null;
  /** True until the initial auth state + profile fetch resolves. */
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);