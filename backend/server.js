// server.js
require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Serve static frontend files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../Public')));

// Serve home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Public/index.html'));
});

// Stripe payment route
app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency || 'usd',
      automatic_payment_methods: { enabled: true },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// ✅ NEW: Save Order Route (temporary in-memory storage)
const orders = [];

app.post('/save-order', (req, res) => {
  const order = req.body;

  if (!order || !order.items || !order.customer) {
    return res.status(400).json({ message: 'Invalid order data' });
  }

  order.timestamp = new Date().toISOString();
  orders.push(order);

  console.log('✅ New Order Saved:', order);

  res.status(200).json({ message: 'Order saved successfully' });
});

// Use Render's port or default to 4242 locally
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
