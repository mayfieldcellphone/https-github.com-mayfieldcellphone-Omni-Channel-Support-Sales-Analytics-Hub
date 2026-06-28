import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBGs5Fd1aYrVQDs_MhOgy5d8LFn5oLvXYI",
  authDomain: "repairhub-saas.firebaseapp.com",
  projectId: "repairhub-saas",
  storageBucket: "repairhub-saas.firebasestorage.app",
  messagingSenderId: "135356822613",
  appId: "1:135356822613:web:6220b004dc9193aaff50dc",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
