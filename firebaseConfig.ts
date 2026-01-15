import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";

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

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let googleProvider: GoogleAuthProvider | undefined;

// Validate Config to prevent crash
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined") {
  try {
    // Initialize Firebase
    // Check if app is already initialized to avoid duplicate app errors in dev
    app = getApps().length === 0 
      ? initializeApp(firebaseConfig) 
      : getApp();
    
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Firebase Initialization Failed:", error);
  }
} else {
  console.warn("Firebase API Key is missing. Auth features will be disabled. Check your .env file.");
}

export { auth, googleProvider };