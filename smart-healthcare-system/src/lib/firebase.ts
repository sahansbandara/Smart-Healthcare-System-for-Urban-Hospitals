import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDZeuWNWMGFKTRCFxn32Sg14DZ-Owheowo",
  authDomain: "smart-healthcare-system-78580.firebaseapp.com",
  projectId: "smart-healthcare-system-78580",
  storageBucket: "smart-healthcare-system-78580.firebasestorage.app",
  messagingSenderId: "770624571519",
  appId: "1:770624571519:web:4fc309e569d5b22946574a",
  measurementId: "G-YTLLNKXWCL"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
