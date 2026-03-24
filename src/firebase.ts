import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBzRqvB9SLRSVh8wC5fDGUOxu0xkFzPuho",
  authDomain: "observador-22a42.firebaseapp.com",
  projectId: "observador-22a42",
  storageBucket: "observador-22a42.firebasestorage.app",
  messagingSenderId: "67894382297",
  appId: "1:67894382297:web:1b5a8a5b55941875f678c8",
  measurementId: "G-5X6VD902DV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { db, analytics };
