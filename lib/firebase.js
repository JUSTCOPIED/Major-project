import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL, // Must be set in .env.local (e.g. https://your-project-id-default-rtdb.firebaseio.com)
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Basic runtime validation so silent failures surface in console & UI can react.
export const FIREBASE_ENV_ISSUES = (() => {
  const missing = Object.entries({
    NEXT_PUBLIC_FIREBASE_API_KEY: firebaseConfig.apiKey,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
    NEXT_PUBLIC_FIREBASE_DATABASE_URL: firebaseConfig.databaseURL,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
    NEXT_PUBLIC_FIREBASE_APP_ID: firebaseConfig.appId
  }).filter(([, v]) => !v);
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.error("[Firebase] Missing required env vars:", missing.map(m=>m[0]).join(", "));
  } else if (!/^https:\/\/.*firebaseio\.com\/?$/.test(firebaseConfig.databaseURL || '')) {
    // eslint-disable-next-line no-console
    console.warn("[Firebase] databaseURL does not look like a valid Realtime Database URL:", firebaseConfig.databaseURL);
  }
  return missing.map(m=>m[0]);
})();

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
// getDatabase will still try to init even if URL missing; we expose flag instead
const database = getDatabase(app);
export { auth, database };