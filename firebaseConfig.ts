import * as firebaseApp from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import type { Auth } from "firebase/auth";

// Firebase configuration
// Priority: Runtime Injection (window.__ENV__) -> Build time (process.env)
const getEnvVar = (key: keyof NonNullable<Window['__ENV__']>, fallback: string | undefined) => {
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[key]) {
    return window.__ENV__[key];
  }
  return fallback;
};

const firebaseConfig = {
  apiKey: getEnvVar('FIREBASE_API_KEY', process.env.FIREBASE_API_KEY),
  authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN', process.env.FIREBASE_AUTH_DOMAIN),
  projectId: getEnvVar('FIREBASE_PROJECT_ID', process.env.FIREBASE_PROJECT_ID),
  storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET', process.env.FIREBASE_STORAGE_BUCKET),
  messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID', process.env.FIREBASE_MESSAGING_SENDER_ID),
  appId: getEnvVar('FIREBASE_APP_ID', process.env.FIREBASE_APP_ID)
};

// Use explicit type any or inferred type to avoid import errors for FirebaseApp
let app: any;
let auth: Auth | undefined;
let googleProvider: GoogleAuthProvider | undefined;

// Validate Config to prevent crash
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined") {
  try {
    // Initialize Firebase
    // Check if app is already initialized to avoid duplicate app errors in dev
    // Using namespace import access to ensure compatibility with different module resolutions
    app = firebaseApp.getApps().length === 0 
      ? firebaseApp.initializeApp(firebaseConfig) 
      : firebaseApp.getApp();
    
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Firebase Initialization Failed:", error);
  }
} else {
  console.warn("Firebase API Key is missing. Check .env file or server configuration.");
}

export { auth, googleProvider };