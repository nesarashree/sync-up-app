// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyBZfNhhlI0h-_LLHtHR1uHHWIuWdtx8WIA", 
  authDomain: "studybuddy-ed5b8.firebaseapp.com",
  projectId: "studybuddy-ed5b8",
  storageBucket: "studybuddy-ed5b8.appspot.com",
  messagingSenderId: "496915824091",
  appId: "1:496915824091:web:2ff55633eaa69c88743bfe",
  measurementId: "G-4aPKCGY7032"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Set up Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);
const provider = new GoogleAuthProvider();

export { auth, db, storage, functions, provider };
