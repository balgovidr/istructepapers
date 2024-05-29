import { initializeApp, getApps, cert } from 'firebase-admin/app';
const { getFirestore } = require('firebase-admin/firestore');

var serviceAccount = require("./istructepapers-firebase-adminsdk-gusds-5bb4f96be2.json");

export function InitializeFirebase() {
  if (getApps().length <= 0) {
    try {
      initializeApp({
        credential: cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      });
    } catch (error) {
      console.log(error)
    }
  }
}

export function InitializeFirestore() {
  try {
    InitializeFirebase()
    return getFirestore();
  } catch (error) {
    console.log(error)
  }
}

