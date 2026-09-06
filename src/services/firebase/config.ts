import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// All values come from build-time env vars (see .env.example). Never
// hardcode project-specific values here — this file must stay portable
// across local/dev/production Firebase projects.
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

function assertConfigured(config: FirebaseOptions): void {
  const required: (keyof FirebaseOptions)[] = [
    "apiKey",
    "authDomain",
    "projectId",
    "appId",
  ];
  const missing = required.filter((key) => !config[key]);
  if (missing.length > 0) {
    // Fail loudly in dev rather than silently calling an unconfigured
    // Firebase project. In production this should never trigger because
    // the GitHub Actions build injects real values.
    console.error(
      `Firebase config is missing required field(s): ${missing.join(", ")}. ` +
        "Did you create a .env file from .env.example?",
    );
  }
}

assertConfigured(firebaseConfig);

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
