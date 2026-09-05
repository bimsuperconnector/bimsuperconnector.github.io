import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Firebase configuration.
 *
 * These values are the standard *public* Firebase Web config (API key,
 * project id, etc.). They identify the project but do not grant access —
 * every read/write is authorized by Firestore Security Rules, not by
 * secrecy of this config. Never put private OAuth client secrets,
 * service-account keys, or GitHub tokens here or anywhere in frontend code.
 *
 * All values come from Vite env vars (VITE_ prefix) so nothing is
 * hard-coded and the same build can target dev/prod Firebase projects.
 * See /.env.example for the required variable names.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

function assertConfigPresent() {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    // Fail loudly and early in development rather than silently
    // producing a broken, half-initialized Firebase app.
    // eslint-disable-next-line no-console
    console.error(
      `Missing Firebase config values: ${missing.join(', ')}. ` +
        'Copy .env.example to .env and fill in your Firebase project settings.',
    );
  }
}

assertConfigPresent();

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(firebaseApp);
export const db: Firestore = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

// Request only the minimal scopes needed to identify the person and show
// their basic Google profile (name/photo/email). No broader Google scopes
// are requested at sign-in time.
googleProvider.setCustomParameters({ prompt: 'select_account' });
