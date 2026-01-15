
import * as firebaseApp from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration
// Strictly uses environment variables. 
// Make sure these are defined in your .env file or deployment environment.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
// Check if app is already initialized to avoid duplicate app errors in dev
// Using type casting to bypass TS errors where it claims exported members don't exist
const app = (firebaseApp as any).getApps().length === 0 ? (firebaseApp as any).initializeApp(firebaseConfig) : (firebaseApp as any).getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
