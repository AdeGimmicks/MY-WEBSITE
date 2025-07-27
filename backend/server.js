// server.js
require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const nodemailer = require('nodemailer'); // ✅ added

app.use(cors());
app.use(express.json());

// Serve static frontend files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../Public')));

// Serve home page
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

  // Add timestamp to new order
  const newOrder = {
    ...orderData,
    timestamp: new Date().toISOString()
  };

    // Add to list and save
existingOrders.push(newOrder);
fs.writeFileSync(filePath, JSON.stringify(existingOrders, null, 2));

// ✅ Log the email before sending
console.log('📧 Sending email to:', newOrder.customer.email);

// ✅ Send confirmation email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

const mailOptions = {
  from: `"ElectronicsOnly" <${process.env.GMAIL_USER}>`,
  to: newOrder.customer.email,
  subject: '✅ Order Confirmation – ElectronicsOnly',
  html: `
    <h2>Thank You for Your Order!</h2>
    <p><strong>Name:</strong> ${newOrder.customer.name}</p>
    <p><strong>Email:</strong> ${newOrder.customer.email}</p>
    <p><strong>Shipping Address:</strong> ${newOrder.customer.address}</p>
    <p><strong>Total Paid:</strong> $${newOrder.total}</p>
    <p><strong>Order Time:</strong> ${new Date(newOrder.timestamp).toLocaleString()}</p>
    <p>We’ve received your order and it is being processed.</p>
  `
};


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Failed to send email:', error);
      return res.status(500).json({ success: false, message: 'Order saved, but email failed.' });
    } else {
      console.log('📧 Email sent:', info.response);
      return res.send({ success: true, message: 'Order saved and email sent.' });
    }
  });
});

// ✅ Route to return saved orders for the admin page
app.get('/get-orders', (req, res) => {
  const filePath = path.join(__dirname, 'orders.json');
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    const orders = JSON.parse(data);
    res.json(orders);
  } else {
    res.json([]);
  }
});

// Start the server
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
