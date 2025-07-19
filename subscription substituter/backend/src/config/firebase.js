const firebaseAdmin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

// Export Firebase Admin instance
module.exports = firebaseAdmin;

// Export Firestore
const db = firebaseAdmin.firestore();
module.exports.db = db;

// Export Auth
const auth = firebaseAdmin.auth();
module.exports.auth = auth;
