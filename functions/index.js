/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");
// const { onRequest, onSchedule } = require("firebase-functions/v2");


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const Stripe = require('stripe');

admin.initializeApp();

const stripe = new Stripe(process.env.STRIPE_KEY, {
  apiVersion: '2022-11-15',
});

exports.createStripeCheckout = onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { cart, scheduledTime, successUrl, cancelUrl } = req.body;

      if (!cart || !successUrl || !cancelUrl) {
        res.status(400).send('Missing required fields');
        return;
      }

      const lineItems = cart.map((item) => {
        let basePrice = 400;
        if (item.options.size === 'large') basePrice += 50;
        const flavorExtra = item.options.flavors.length > 0 ? (item.options.flavors.length - 1) * 50 : 0;
        const toppingExtra = item.options.toppings.length > 0 ? (item.options.toppings.length - 1) * 50 : 0;
        const unitCost = basePrice + flavorExtra + toppingExtra;

        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${item.drink} (sugar: ${item.options.sugar}%, ice: ${item.options.ice})`,
            },
            unit_amount: unitCost,
          },
          quantity: Number(item.options.quantity),
        };
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          scheduledTime,
          cart: JSON.stringify(cart),
        }
      });

      res.status(200).send({ sessionId: session.id });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).send('Internal Server Error');
    }
  });
});

exports.handleStripeCheckout = onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Stripe webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const orderData = {
      email: session.customer_details?.email,
      name: session.customer_details?.name,
      drinks: JSON.parse(session.metadata?.cart || '[]'),
      scheduledTime: admin.firestore.Timestamp.fromDate(new Date(session.metadata?.scheduledTime)),
      status: 'pending',
      amount_total: session.amount_total,
      currency: session.currency,
      created: admin.firestore.FieldValue.serverTimestamp(),
    };

    try {
      await admin.firestore().collection('orders').add(orderData);
      console.log('Order stored successfully in Firestore.');
    } catch (error) {
      console.error('Error storing order in Firestore:', error);
    }
  }

  res.json({ received: true });
});

exports.markCompletedOrders = onSchedule('every 15 minutes', async () => {
  const db = admin.firestore();
  const now = new Date();

  const snapshot = await db.collection('orders')
    .where('status', '==', 'pending')
    .get();

  const batch = db.batch();
  let updatedCount = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    const scheduledTime = data.scheduledTime?.toDate();

    if (scheduledTime && scheduledTime <= now) {
      batch.update(doc.ref, { status: 'completed' });
      updatedCount++;
    }
  });

  if (updatedCount > 0) {
    await batch.commit();
    console.log(`Updated ${updatedCount} orders to 'completed'`);
  }
});
