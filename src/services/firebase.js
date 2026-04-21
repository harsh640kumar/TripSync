import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if config is present, otherwise create a mock warning
let app;
let auth;
let db;

try {
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    console.warn("Firebase config is missing. Please add .env.local with VITE_FIREBASE_* variables. Using mock mode.");
  }
} catch (error) {
  console.error("Firebase initialization error", error);
}

// We will export a mock implementation if Firebase isn't configured,
// so the app still renders and doesn't crash during development without keys.
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: (cb) => { cb(null); return () => {}; },
  signInWithEmailAndPassword: async () => { throw new Error("Firebase not configured"); },
  createUserWithEmailAndPassword: async () => { throw new Error("Firebase not configured"); },
  signOut: async () => {}
};

const mockDb = {};

export { app };
export const activeAuth = auth || mockAuth;
export const activeDb = db || mockDb;
