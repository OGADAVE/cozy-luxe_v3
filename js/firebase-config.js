/* ===================================================
   COZY-LUXE — Firebase config
   =================================================== */

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBjCdgmO-5fLFz11PGxSggKJgBMtlxKRm0",
  authDomain: "cozy-luxe.firebaseapp.com",
  projectId: "cozy-luxe",
  storageBucket: "cozy-luxe.firebasestorage.app",
  messagingSenderId: "462983409993",
  appId: "1:462983409993:web:c31c82d2f19312547d2a98"
};

/*
  Client-side allow-list as a first layer of defense for the admin UI.
  This is NOT real security by itself — Firestore Security Rules must
  also restrict writes to the products collection.
*/

export const ADMIN_EMAILS = [
  "ogadaveconcepts@gmail.com"
];