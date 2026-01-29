import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyBhS1B5Mx_onOBf3Imup4MyOMuxk-qJj1o",
  authDomain: "studio-1004537855-178e0.firebaseapp.com",
  projectId: "studio-1004537855-178e0",
  storageBucket: "studio-1004537855-178e0.appspot.com",
  messagingSenderId: "38469851703",
  appId: "1:38469851703:web:8a64c5092781668743bdb2"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
