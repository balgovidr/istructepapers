import admin, { getApps, initializeApp, cert } from "firebase-admin/app";
const { getFirestore } = require("firebase-admin/firestore");

const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;

let serviceAccount;

if (environment === 'production') {
  serviceAccount = require('./istructepapers-firebase-adminsdk-gusds-0a67e7b61d.json');
} else {
  serviceAccount = require('./istructepapers-test-firebase-adminsdk-s4b6h-c172725ac2.json');
}

const options = {
  credential: cert(serviceAccount),
};

export function initializeFirebase() {
  const firebaseAdminApps = getApps();
  if (firebaseAdminApps.length > 0) {
    console.log('App already initialized')
    return firebaseAdminApps[0];
  }
  
  console.log('App initializing')
  return initializeApp(options);
}

export function initializeFirestore() {
  const app = initializeFirebase();

  const firestore = getFirestore(app);
  console.log('Firestore initialized');
  return firestore;
}