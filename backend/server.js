// server.js
require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../Public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Public/index.html'));
});

// Stripe Payment Intent
app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency || 'usd',
      automatic_payment_methods: { enabled: true },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Save order after successful payment
app.post('/save-order', (req, res) => {
  const orderData = req.body;

  const filePath = path.join(__dirname, 'orders.json');

  // Read existing orders if file exists
  let existingOrders = [];
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    existingOrders = JSON.parse(data);
  }

  // Add new order to existing orders
  existingOrders.push({
    ...orderData,
    timestamp: new Date().toISOString(),
  });

  // Save all orders back to file
  fs.writeFileSync(filePath, JSON.stringify(existingOrders, null, 2));

  res.send({ success: true, message: 'Order saved successfully.' });
});

// Start the server
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
