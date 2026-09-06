import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type DocumentData,
} from "firebase/firestore";
import { auth, db } from "./config";

export type AppRole =
  | "superAdmin"
  | "platformAdmin"
  | "applicationAdmin"
  | "batchModerator"
  | "member"
  | "pending"
  | "rejected";

export interface AppUserDoc extends DocumentData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: AppRole;
  createdAt: unknown;
}

const googleProvider = new GoogleAuthProvider();

/**
 * Opens the Google Sign-In popup. Firestore user-doc creation is handled
 * separately by `ensureUserDocument`, called from the auth state listener,
 * so this function only handles the identity step.
 */
export async function signInWithGoogle(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Ensures a `users/{uid}` document exists for a freshly authenticated
 * Firebase user. New users are created with role "pending" — the review
 * queue, profile form and approval workflow itself are built in Phase 1.
 * This function never edits an existing document's role: role changes are
 * a protected, server/rules-controlled transition, not a client concern.
 */
export async function ensureUserDocument(user: User): Promise<AppUserDoc> {
  const userRef = doc(db, "users", user.uid);
  const existing = await getDoc(userRef);

  if (existing.exists()) {
    return existing.data() as AppUserDoc;
  }

  const newUser: AppUserDoc = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: "pending",
    createdAt: serverTimestamp(),
  };

  await setDoc(userRef, newUser);
  return newUser;
}

export async function fetchUserDocument(
  uid: string,
): Promise<AppUserDoc | null> {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? (snapshot.data() as AppUserDoc) : null;
}
