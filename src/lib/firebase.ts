import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyB-R_iB0_GfLzXN1XzV9RzJ3J9x_pGzV9o",
  authDomain: "fixam-ghana.firebaseapp.com",
  projectId: "fixam-ghana",
  storageBucket: "fixam-ghana.appspot.com",
  messagingSenderId: "394747584937",
  appId: "1:394747584937:web:8c4b2b7b2b7b2b7b2b7b2b"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
