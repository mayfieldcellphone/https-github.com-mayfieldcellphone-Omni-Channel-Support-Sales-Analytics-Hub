import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCzgeb33hdvdB3SIvnZQyDegHjYK-CZZEs",
  authDomain: "gen-lang-client-0138442584.firebaseapp.com",
  projectId: "gen-lang-client-0138442584",
  storageBucket: "gen-lang-client-0138442584.firebasestorage.app",
  messagingSenderId: "302106920849",
  appId: "1:302106920849:web:3ba7cf2ab9758599c6fc30"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use custom database ID from config
const databaseId = "ai-studio-omnichannelsuppo-d80f8079-fc69-44f0-a0c9-d4cfef8f5840";
export const db = getFirestore(app, databaseId);
