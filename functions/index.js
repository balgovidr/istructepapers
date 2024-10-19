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


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

exports.createCheckoutSession = onCall(async (data, context) => {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
    try {
      const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        line_items: [
          {
            price: 'price_1QB0d1KXrNJ2z07Vt3IKSSuM',
            quantity: 1,
          },
        ],
        mode: 'payment',
        return_url: `${process.env.NEXT_PUBLIC_HOST}/return?session_id={CHECKOUT_SESSION_ID}`,
      });
      logger.log(session.client_secret)
  
      return { clientSecret: session.client_secret };
    } catch (err) {
      console.error(err);
      throw new HttpsError('internal', err.message);
    }
});

// exports.getCheckoutSession = functions.https.onCall(async (data, context) => {
//     const stripe = require('stripe')(functions.config().stripe.secretkey);
  
//     try {
//       const session = await stripe.checkout.sessions.retrieve(data.sessionId);
  
//       return { customerEmail: session.customer_details.email, sessionStatus: session.status };
//     } catch (err) {
//       console.error(err);
//       throw new functions.https.HttpsError('internal', err.message);
//     }
// });