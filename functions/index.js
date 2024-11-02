/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { initializeApp } = require("firebase/app");
const { getFirestore, Timestamp } = require("firebase/firestore");
const { FieldValue } = require("firebase-admin/firestore");

admin.initializeApp();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.createCheckoutSession = onCall(async (data, context) => {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
    try {
      const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        line_items: [
          {
            price: 'price_1QC8HzKXrNJ2z07VQZOvSCBw',
            quantity: 1,
          },
        ],
        mode: 'payment',
        return_url: `${process.env.NEXT_PUBLIC_HOST}/checkout-return?session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
            customer_uid: data.rawRequest.body.data.customer_uid
        }
      });
  
      return { clientSecret: session.client_secret };
    } catch (err) {
      console.error(err);
      throw new HttpsError('internal', err.message);
    }
});

exports.getCheckoutSession = onCall(async (data, context) => {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
    try {
        const session = await stripe.checkout.sessions.retrieve(data.rawRequest.body.data.sessionId);
        
        const db = admin.firestore();
        
        // Using runTransactions checks carries out all of the firestore functions below in a batch including the if statement and the rest of the writes
        await db.runTransaction(async (transaction) => {
            const transactionRef = db.collection("transactions").doc(data.rawRequest.body.data.sessionId);
            const transactionDocSnapshot = await transaction.get(transactionRef);
            
            // If a document of the sessionId already exists in the transactions collection then don't carry out any of the rest of the write functions
            if (!transactionDocSnapshot.exists) {
                // Set the sessionId in the transactions collection
                transaction.set(transactionRef, {
                    customer_uid: session.metadata.customer_uid,
                    customer_email: session.customer_details.email,
                    amount: 10,
                    currency: 'GBP',
                });
                
                // Update the user's points
                transaction.update(db.collection('users').doc(session.metadata.customer_uid), {
                    points: FieldValue.increment(10)
                });
            }
        });
  
        return { customerEmail: session.customer_details.email, sessionStatus: session.status };
    } catch (err) {
        console.error(err);
        throw new HttpsError('internal', err.message);
    }
});