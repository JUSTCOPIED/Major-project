import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBSx0YLSDw39oF2EKXySQ1EuJtnG1hOd9g",
  authDomain: "major-project-b6f44.firebaseapp.com",
  projectId: "major-project-b6f44",
  storageBucket: "major-project-b6f44.firebasestorage.app",
  messagingSenderId: "220290365721",
  appId: "1:220290365721:web:46259668c9880033c0ad88",
  measurementId: "G-XXQ67GRMHY"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);  

export { auth, database };