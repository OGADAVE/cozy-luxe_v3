/* ===================================================
   COZY-LUXE — Firebase Initialization
   ---------------------------------------------------
   ES module loaded directly from Google's CDN.

   Responsibilities:
   • Initialize Firebase
   • Initialize Firebase Authentication
   • Initialize Firestore
   • Expose Firebase functions through window.fb
   • Notify normal scripts when Firebase is ready
   =================================================== */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

import {
  FIREBASE_CONFIG,
  ADMIN_EMAILS
} from "./firebase-config.js";


/* ===================================================
   FIREBASE INSTANCES
   =================================================== */

let app = null;
let auth = null;
let db = null;


/* ===================================================
   INITIALIZE FIREBASE
   =================================================== */

try {

  app = initializeApp(FIREBASE_CONFIG);

  auth = getAuth(app);

  db = getFirestore(app);

  console.info(
    "COZY-LUXE: Firebase initialized successfully."
  );

} catch (error) {

  console.error(
    "COZY-LUXE: Firebase failed to initialize.",
    error
  );

}


window.fb = {

  /* Firebase instances */
  app,
  auth,
  db,

  /* Admin configuration */
  ADMIN_EMAILS: Array.isArray(ADMIN_EMAILS)
    ? ADMIN_EMAILS
        .map(email => String(email).trim().toLowerCase())
        .filter(Boolean)
    : [],

  /* Firestore */
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,

  /* Authentication */
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut

};


/* ===================================================
   FIREBASE READY EVENT
   ---------------------------------------------------
   products-service.js waits for this event when
   Firebase has not finished loading yet.
   =================================================== */

window.dispatchEvent(
  new Event("firebase-ready")
);


/* ===================================================
   OPTIONAL GLOBAL STATUS FLAG
   =================================================== */

window.COZY_LUXE_FIREBASE_READY = Boolean(db);


/* ===================================================
   LOG STATUS
   =================================================== */

if (!db) {

  console.warn(
    "COZY-LUXE: Firebase is unavailable. " +
    "The storefront can continue using the static catalog, " +
    "but Firestore-powered features will not work."
  );

}