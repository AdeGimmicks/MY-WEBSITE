// server.js

const express = require('express');
const app = express();
const path = require('path');
const stripe = require('stripe')('sk_test_51O5HvsG4lCkKqAxddRmipdQZj4KF5HGqS50Ei4MOzler4N0AbHiN3yRgAm3cX9AcTJAG0wdbSVt4tonMNxhCQJB00PTwpaww0');
const cors = require('cors');

app.use(cors());
app.use(express.json());

// ✅ Serve static frontend files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../')));

// ✅ Route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// ✅ Stripe Payment Route
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

// ✅ Use Render's provided port (for production deployment)
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
