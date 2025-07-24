// server.js
require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

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
app.post('/save-order', async (req, res) => {
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

  // ✅ Send email to customer using Nodemailer
  if (orderData.customer && orderData.customer.email) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"KingsArena" <${process.env.GMAIL_USER}>`,
      to: orderData.customer.email,
      subject: 'Your Order Confirmation - KingsArena',
      html: `
        <h2>Thank you for your order, ${orderData.customer.name}!</h2>
        <p>Your order is being processed.</p>
        <p><strong>Order Details:</strong></p>
        <ul>
          <li><strong>Name:</strong> ${orderData.customer.name}</li>
          <li><strong>Email:</strong> ${orderData.customer.email}</li>
          <li><strong>Shipping Address:</strong> ${orderData.customer.address}</li>
          <li><strong>Total Paid:</strong> $${orderData.total}</li>
          <li><strong>Order Time:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <p>If you have any questions, feel free to reply to this email.</p>
        <br/>
        <p>Thanks for shopping at KingsArena!</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${orderData.customer.email}`);
    } catch (error) {
      console.error(`❌ Failed to send email: ${error.message}`);
    }
  }

  res.send({ success: true, message: 'Order saved and email sent successfully.' });
});

// Route to return saved orders for the admin page
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
