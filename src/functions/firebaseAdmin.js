import * as admin from 'firebase-admin';

/* eslint-disable import/prefer-default-export */
import { credential } from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';

// const serviceAccount = require('ServiceAccountFile.json');
var serviceAccount = require("@/istructepapers-firebase-adminsdk-gusds-5bb4f96be2.json");

if (!admin.apps.length) {
 initializeApp({
   credential: credential.cert(serviceAccount),
 });
}

export const adminSDK = admin;