import admin, { getApps, initializeApp, cert } from "firebase-admin/app";
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
  credential: cert(serviceAccount),
  storageBucket: environment === 'production' ? 'gs://istructepapers.appspot.com' : 'gs://istructepapers-test.appspot.com'
};

export function initializeFirebase() {
  const firebaseAdminApps = getApps();
  if (firebaseAdminApps.length > 0) {
    return firebaseAdminApps[0];
  }
  
  return initializeApp(options);
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