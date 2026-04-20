require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');
const rateLimit = require('express-rate-limit');

app.use(cors());
app.use(express.json());

// Rate limit protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Serve frontend files
app.use(express.static(path.join(__dirname, 'Public')));

let ordersCollection;

// Create email transporter once
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

async function startServer() {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    const db = client.db("electronicsonly");
    ordersCollection = db.collection("orders");

    console.log("✅ Connected to MongoDB Atlas");

    const PORT = process.env.PORT || 4242;

    app.listen(PORT, () =>
      console.log(`✅ Server running on port ${PORT}`)
    );

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
}

startServer();

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Public/index.html'));
});


// ==============================
// Stripe Payment Intent
// ==============================

app.post('/create-payment-intent', async (req, res) => {

  const { amount, currency } = req.body;

  try {

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency || 'usd',
      automatic_payment_methods: { enabled: true },
    });

    res.send({
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {

    res.status(500).send({
      error: error.message
    });

  }

});


// ==============================
// Save Order + Email Confirmation
// ==============================

app.post('/save-order', async (req, res) => {

  try {

    // Basic validation
    if (!req.body.customer || !req.body.total) {
      return res.status(400).json({
        message: "Invalid order data"
      });
    }

    // Generate order number
    const orderNumber = "EO-" + Date.now();

    const orderData = {
      ...req.body,
      orderNumber,
      status: "pending",
      timestamp: new Date().toISOString()
    };

    await ordersCollection.insertOne(orderData);

    // Email confirmation
    const mailOptions = {
      from: `"ElectronicsOnly" <${process.env.GMAIL_USER}>`,
      to: orderData.customer.email,
      subject: '✅ Order Confirmation – ElectronicsOnly',

      html: `
        <h2>Thank You for Your Order!</h2>

        <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>

        <p><strong>Name:</strong> ${orderData.customer.name}</p>

        <p><strong>Email:</strong> ${orderData.customer.email}</p>

        <p><strong>Shipping Address:</strong> ${orderData.customer.address}</p>

        <p><strong>Total Paid:</strong> $${orderData.total}</p>

        <p><strong>Order Time:</strong>
        ${new Date(orderData.timestamp).toLocaleString()}</p>

        <p>We’ve received your order and it is being processed.</p>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {

      if (error) {

        console.error("❌ Failed to send email:", error);

        return res.status(500).json({
          success: false,
          message: "Order saved but email failed."
        });

      } else {

        console.log("📧 Email sent:", info.response);

        return res.send({
          success: true,
          message: "Order saved and email sent.",
          orderNumber
        });

      }

    });

  } catch (err) {

    console.error("❌ Error saving order:", err);

    res.status(500).send({
      message: "Server error"
    });

  }

});


// ==============================
// Get Orders (Admin Panel)
// ==============================

app.get('/get-orders', async (req, res) => {

  const adminKey = req.headers['admin-key'];

  if (adminKey !== process.env.ADMIN_SECRET) {

    return res.status(403).send({
      message: "Unauthorized"
    });

  }

  try {

    const orders = await ordersCollection
      .find()
      .sort({ timestamp: -1 })
      .toArray();

    res.json(orders);

  } catch (err) {

    console.error("❌ Failed to fetch orders:", err);

    res.status(500).send({
      message: "Failed to fetch orders"
    });

  }

});


// ==============================
// Update Order Status
// ==============================

app.post('/update-status', async (req, res) => {

  const { paymentId, newStatus } = req.body;

  try {

    const result = await ordersCollection.findOneAndUpdate(
      { paymentId },
      { $set: { status: newStatus } },
      { returnDocument: "after" }
    );

    const order = result.value;

    if (!order) {
      return res.status(404).send({
        message: "Order not found"
      });
    }

    let subject = "";
    let html = "";

    if (newStatus === "shipped") {

      subject = "📦 Your Order is On the Way!";

      html = `
        <h2>Your Order Has Been Shipped!</h2>

        <p>Hi ${order.customer.name},</p>

        <p>Your order from ElectronicsOnly has been shipped.</p>

        <p><strong>Order Number:</strong> ${order.orderNumber}</p>

        <p><strong>Total:</strong> $${order.total}</p>
      `;

    } else if (newStatus === "delivered") {

      subject = "📬 Your Order Has Been Delivered!";

      html = `
        <h2>Delivery Confirmation</h2>

        <p>Hi ${order.customer.name},</p>

        <p>Your order has been delivered.</p>

        <p><strong>Order Number:</strong> ${order.orderNumber}</p>

        <p><strong>Total:</strong> $${order.total}</p>
      `;

    } else {

      return res.status(400).send({
        message: "Invalid status"
      });

    }

    const mailOptions = {

      from: `"ElectronicsOnly" <${process.env.GMAIL_USER}>`,
      to: order.customer.email,
      subject,
      html

    };

    transporter.sendMail(mailOptions, (err, info) => {

      if (err) {

        console.error("❌ Email send failed:", err);

        return res.status(500).send({
          message: "Status updated but email failed"
        });

      }

      console.log(`📧 ${newStatus} email sent:`, info.response);

      res.send({
        message: `Order marked as '${newStatus}' and email sent.`
      });

    });

  } catch (err) {

    console.error("❌ MongoDB update error:", err);

    res.status(500).send({
      message: "Failed to update order status"
    });

  }

});