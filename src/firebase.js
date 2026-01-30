// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDpvd0z56FsVJ4nL3Ym1rgynD2ISJsnUmw",
  authDomain: "balen2026.firebaseapp.com",
  projectId: "balen2026",
  storageBucket: "balen2026.firebasestorage.app",
  messagingSenderId: "1041934233148",
  appId: "1:1041934233148:web:44dd3b4725a73f5618dd39",
  measurementId: "G-E4LQ4D7J1P"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore (Database) and export it
export const db = getFirestore(app);