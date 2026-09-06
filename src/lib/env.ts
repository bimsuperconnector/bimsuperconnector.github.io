/**
 * Typed access to build-time environment variables.
 *
 * All of these are Firebase *web client configuration* values, not secrets.
 * They are safe to ship inside the built JS bundle (this is how every
 * Firebase web app works) but are still injected at build time via GitHub
 * Actions repository variables so nothing is hard-coded in source control.
 *
 * See the chat response for Phase 0 for exact setup steps.
 */
interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

function readEnv(name: string): string {
  const value = import.meta.env[name];
  return typeof value === 'string' ? value : '';
}

export function getFirebaseConfig(): FirebaseWebConfig {
  return {
    apiKey: readEnv('VITE_FIREBASE_API_KEY'),
    authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
    messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: readEnv('VITE_FIREBASE_APP_ID'),
    measurementId: readEnv('VITE_FIREBASE_MEASUREMENT_ID') || undefined,
  };
}

export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}
