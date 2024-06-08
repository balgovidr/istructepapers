import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
// const { getFirestore } = require('firebase-admin/firestore');

if (process.env.NEXT_PUBLIC_ENVIRONMENT === "production") {
  var serviceAccount = require("./istructepapers-firebase-adminsdk-gusds-5bb4f96be2.json");
} else {
  var serviceAccount = require("./istructepapers-test-firebase-adminsdk-s4b6h-c172725ac2.json");
}

console.log(process.env.NEXT_PUBLIC_ENVIRONMENT)

export function InitializeFirebase() {
  if (getApps().length <= 0) {
    try {
      initializeApp({
        credential: cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      });
    } catch (error) {
      console.log(error.message)
    }
  }
}

export function InitializeFirestore() {
  try {
    InitializeFirebase()
    return getFirestore();
  } catch (error) {
  }
}

