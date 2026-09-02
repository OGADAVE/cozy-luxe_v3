/* ===================================================
   COZY-LUXE — Firebase init
   This is an ES module (loaded via <script type="module">), so it can
   import the Firebase SDK straight from Google's CDN with no build step.
   It exposes what it initializes on window.fb so the rest of the site
   (plain, non-module scripts) can use it, and fires a "firebase-ready"
   event once that's done — see js/products-service.js for the consumer
   side of that handshake.
   =================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { FIREBASE_CONFIG, ADMIN_EMAILS } from "./firebase-config.js";

let app = null, auth = null, db = null;
try{
  app = initializeApp(FIREBASE_CONFIG);
  auth = getAuth(app);
  db = getFirestore(app);
}catch(e){
  console.warn("COZY-LUXE: Firebase failed to initialize — falling back to the built-in catalog.", e);
}

window.fb = {
  app, auth, db,
  ADMIN_EMAILS,
  collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, query, orderBy,
  onAuthStateChanged, signInWithEmailAndPassword, signOut
};
window.dispatchEvent(new Event("firebase-ready"));