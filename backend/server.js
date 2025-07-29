// server.js
require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
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

// ✅ Save order after successful payment
app.post('/save-order', (req, res) => {
  const orderData = req.body;
  const filePath = path.join(__dirname, 'orders.json');

  let existingOrders = [];
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    existingOrders = JSON.parse(data);
  }

  const newOrder = {
    ...orderData,
    status: 'pending',
    timestamp: new Date().toISOString()
  };

  existingOrders.push(newOrder);
  fs.writeFileSync(filePath, JSON.stringify(existingOrders, null, 2));

  console.log('📧 Sending email to:', newOrder.customer.email);

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

// ✅ Admin fetch route
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

// ✅ Update order status and send follow-up email
app.post('/update-status', (req, res) => {
  const { paymentId, newStatus } = req.body;
  const filePath = path.join(__dirname, 'orders.json');

  if (!fs.existsSync(filePath)) {
    return res.status(404).send({ message: 'No orders found.' });
  }

  let orders = JSON.parse(fs.readFileSync(filePath));
  const index = orders.findIndex(order => order.paymentId === paymentId);

  if (index === -1) {
    return res.status(404).send({ message: 'Order not found.' });
  }

  orders[index].status = newStatus;
  fs.writeFileSync(filePath, JSON.stringify(orders, null, 2));

  const order = orders[index];

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  let subject = '';
  let html = '';

  if (newStatus === 'shipped') {
    subject = '📦 Your Order is On the Way!';
    html = `
      <h2>Your Order Has Been Shipped!</h2>
      <p>Hi ${order.customer.name},</p>
      <p>Your order from ElectronicsOnly has been shipped and is on its way.</p>
      <p><strong>Shipping Address:</strong> ${order.customer.address}</p>
      <p><strong>Total:</strong> $${order.total}</p>
      <p>Thank you again for shopping with us!</p>
    `;
  } else if (newStatus === 'delivered') {
    subject = '📬 Your Order Has Been Delivered!';
    html = `
      <h2>Delivery Confirmation</h2>
      <p>Hi ${order.customer.name},</p>
      <p>We’re happy to let you know your order has been delivered.</p>
      <p>We hope you’re satisfied. Feel free to contact us if you have any questions.</p>
      <p><strong>Total:</strong> $${order.total}</p>
      <p>Thank you for choosing ElectronicsOnly!</p>
    `;
  } else {
    return res.status(400).send({ message: 'Invalid status.' });
  }

  const mailOptions = {
    from: `"ElectronicsOnly" <${process.env.GMAIL_USER}>`,
    to: order.customer.email,
    subject,
    html
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('❌ Failed to send status update email:', err);
      return res.status(500).send({ message: 'Status updated, but email failed.' });
    } else {
      console.log(`📧 ${newStatus} email sent:`, info.response);
      res.send({ message: `Order marked as '${newStatus}' and email sent.` });
    }
  });
});

// ✅ Start server
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
