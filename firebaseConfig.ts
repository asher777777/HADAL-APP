
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration
// Uses environment variables if available, otherwise falls back to provided hardcoded keys
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBhQp3UEcDGtLuEPZ7FJkoyumK4h1BexiY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "matamorpoza-d848c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "matamorpoza-d848c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "matamorpoza-d848c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "938336116234",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:938336116234:web:172d2f550b61ce363b49f3"
};

// Initialize Firebase
// Check if app is already initialized to avoid duplicate app errors in dev
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
