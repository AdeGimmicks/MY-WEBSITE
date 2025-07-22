// server.js

const express = require('express');
const app = express();
const stripe = require('stripe')('sk_test_51O5HvsG4lCkKqAxddRmipdQZj4KF5HGqS50Ei4MOzler4N0AbHiN3yRgAm3cX9AcTJAG0gWdbSVt4tonMNxhCQJB00PTwpaww0');
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // e.g. 500 = $5.00
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

app.listen(4242, () => console.log('✅ Server running on http://localhost:4242'));
