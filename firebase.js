// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyARJWQ4Eg-R2ZHR5ZWD1NPRcRLu3UesmmU",
  authDomain: "martinet-workplace.firebaseapp.com",
  projectId: "martinet-workplace",
  storageBucket: "martinet-workplace.firebasestorage.app",
  messagingSenderId: "532987474234",
  appId: "1:532987474234:web:bb13d151c1583762212003",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auto anonymous login
export async function ensureAuth() {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
  return auth.currentUser;
}
