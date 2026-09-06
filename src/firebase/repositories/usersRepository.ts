import {
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { db } from '../init';

export type AccountStatus = 'pending' | 'approved' | 'rejected';

export interface UserRecord {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  status: AccountStatus;
  isAdmin: boolean;
}

function usersCollection() {
  if (!db) throw new Error('Firestore is not configured.');
  return collection(db, 'users');
}

function userDocRef(uid: string) {
  if (!db) throw new Error('Firestore is not configured.');
  return doc(db, 'users', uid);
}

function fromSnapshot(uid: string, data: DocumentData): UserRecord {
  return {
    uid,
    email: data.email ?? null,
    displayName: data.displayName ?? null,
    photoURL: data.photoURL ?? null,
    status: (data.status as AccountStatus) ?? 'pending',
    isAdmin: data.isAdmin === true,
  };
}

/**
 * Called once per sign-in (see UserRecordContext). If the signed-in Google
 * account has no `users/{uid}` document yet, creates one in the `pending`
 * state. Firestore Rules (see firestore.rules) independently enforce that
 * a client can only ever create its OWN doc, and only with
 * status: 'pending' and isAdmin: false — the client cannot self-approve or
 * self-elevate no matter what this function sends.
 */
export async function ensureUserRecord(user: FirebaseUser): Promise<void> {
  const ref = userDocRef(user.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) return;

  await setDoc(ref, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    status: 'pending',
    isAdmin: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToUserRecord(
  uid: string,
  onChange: (record: UserRecord | null) => void,
): Unsubscribe {
  return onSnapshot(userDocRef(uid), (snapshot) => {
    onChange(snapshot.exists() ? fromSnapshot(uid, snapshot.data()) : null);
  });
}

/**
 * Admin-only in practice: Firestore Rules reject this update unless the
 * caller's own `users/{uid}` doc has `isAdmin: true`, and unless the write
 * touches only the `status`/`updatedAt` fields. The client-side `isAdmin`
 * check below is a UX convenience, not the security boundary.
 */
export async function setUserStatus(uid: string, status: AccountStatus): Promise<void> {
  await updateDoc(userDocRef(uid), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToPendingUsers(
  onChange: (records: UserRecord[]) => void,
): Unsubscribe {
  const pendingQuery = query(usersCollection(), where('status', '==', 'pending'));
  return onSnapshot(pendingQuery, (snapshot) => {
    onChange(
      snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) =>
        fromSnapshot(docSnap.id, docSnap.data()),
      ),
    );
  });
}
