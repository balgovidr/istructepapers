// import admin, { getApps, initializeApp, cert, credential } from "firebase-admin/app";
import * as admin from 'firebase-admin';
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require('firebase-admin/storage');

const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;

let serviceAccount;

if (environment === 'production') {
  serviceAccount = require('./istructepapers-firebase-adminsdk-gusds-0a67e7b61d.json');
} else {
  serviceAccount = require('./istructepapers-test-firebase-adminsdk-s4b6h-c172725ac2.json');
}

const options = {
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
};

// const options = {
//   credential: cert(serviceAccount),
//   storageBucket: environment === 'production' ? 'gs://istructepapers.appspot.com' : 'gs://istructepapers-test.appspot.com'
// };

export function initializeFirebase() {
  const app = admin.apps.length ? admin.apps[0] : admin.initializeApp(options);
  return app;
}

export function initializeFirestore() {
  const app = initializeFirebase();

  const firestore = getFirestore(app);
  return firestore;
}

export function initializeStorage() {
  const app = initializeFirebase();

  const storage = getStorage(app);
  return storage;
}