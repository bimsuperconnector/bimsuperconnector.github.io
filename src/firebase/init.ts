import { type FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { type Auth, getAuth } from 'firebase/auth';
import { type Firestore, getFirestore } from 'firebase/firestore';
import { type FirebaseStorage, getStorage } from 'firebase/storage';
import { getFirebaseConfig, isFirebaseConfigured } from '../lib/env';

/**
 * Single source of Firebase initialization for the whole app.
 *
 * Nothing outside this file should call `initializeApp` / `getAuth` /
 * `getFirestore` / `getStorage` directly — repositories and services import
 * `auth`, `db`, and `storage` from here instead. This keeps Firebase
 * bootstrapping isolated and easy to audit, per ARCHITECTURE.md.
 */

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export const firebaseConfigured = isFirebaseConfigured();

if (firebaseConfigured) {
  app = getApps().length ? getApps()[0] : initializeApp(getFirebaseConfig());
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  // Do not throw at import time: the landing page and static routes must
  // still render (e.g. during local development before configuration is
  // supplied, or if a build somehow ships without config). Any code path
  // that actually needs Firebase should check `firebaseConfigured` first.
  // eslint-disable-next-line no-console
  console.warn(
    '[firebase] Web app configuration is missing. Set the VITE_FIREBASE_* build variables. ' +
      'Authentication and data features are disabled until this is configured.',
  );
}

export { app, auth, db, storage };
