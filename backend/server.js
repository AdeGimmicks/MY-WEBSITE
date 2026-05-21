require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');

app.use(cors());
app.use(express.json({ limit: '12mb' }));

app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /

Sitemap: https://www.electronicsonly.com/sitemap.xml`);
});

// Rate limit protection

// Serve frontend files
app.use(express.static(path.join(__dirname, 'Public')));

let ordersCollection;
let productsCollection;
let settingsCollection;

const seedProductsPath = path.join(__dirname, 'Public', 'data', 'products.json');

function hashAdminKey(adminKey, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(adminKey, salt, 100000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyAdminKey(adminKey, stored) {
  if (!adminKey || !stored?.salt || !stored?.hash) return false;
  const check = hashAdminKey(adminKey, stored.salt);
  return crypto.timingSafeEqual(Buffer.from(check.hash, 'hex'), Buffer.from(stored.hash, 'hex'));
}

async function hasStoredAdminKey() {
  if (process.env.ADMIN_SECRET) return true;
  if (!settingsCollection) return false;
  const setting = await settingsCollection.findOne({ key: 'adminAuth' });
  return Boolean(setting?.auth?.hash);
}

async function requireAdmin(req, res, next) {
  const adminKey = req.headers['admin-key'];

  if (process.env.ADMIN_SECRET && adminKey === process.env.ADMIN_SECRET) {
    return next();
  }

  const setting = await settingsCollection.findOne({ key: 'adminAuth' });
  if (verifyAdminKey(adminKey, setting?.auth)) {
    return next();
  }

  return res.status(403).send({
    message: "Unauthorized"
  });
}

function requireProductImage(image) {
  if (image.startsWith('data:image/')) {
    const sizeInBytes = Buffer.byteLength(image, 'utf8');
    if (sizeInBytes > 8 * 1024 * 1024) {
      return false;
    }
  }

  return true;
}

function validateProduct(product) {
  if (!product.id || !product.name || !product.image || !product.page || product.price < 0) {
    return "Product name, image, page, id, and valid price are required";
  }

  if (!requireProductImage(product.image)) {
    return "Uploaded image is too large. Please use an image under about 6 MB.";
  }

  if (Array.isArray(product.gallery) && product.gallery.some(image => !requireProductImage(image))) {
    return "One uploaded gallery image is too large. Please use images under about 6 MB.";
  }

  return "";
}

async function setupAdminKey(req, res) {
  try {
    if (process.env.ADMIN_SECRET) {
      return res.status(409).send({
        message: "This store already uses the Render ADMIN_SECRET environment variable."
      });
    }

    const alreadySetup = await hasStoredAdminKey();
    if (alreadySetup) {
      return res.status(409).send({
        message: "Admin key already exists."
      });
    }

    const adminKey = String(req.body.adminKey || '').trim();
    if (adminKey.length < 8) {
      return res.status(400).send({
        message: "Create a key with at least 8 characters."
      });
    }

    await settingsCollection.updateOne(
      { key: 'adminAuth' },
      {
        $set: {
          key: 'adminAuth',
          auth: hashAdminKey(adminKey),
          createdAt: new Date().toISOString()
        }
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: "Admin key created."
    });
  } catch (err) {
    console.error("❌ Failed to setup admin key:", err);
    return res.status(403).send({
      message: "Could not create admin key."
    });
  }
}

function readSeedProducts() {
  return JSON.parse(fs.readFileSync(seedProductsPath, 'utf8'));
}

function normalizeProduct(product) {
  const gallery = Array.isArray(product.gallery)
    ? product.gallery.filter(Boolean).slice(0, 6).map(image => String(image).trim())
    : [];

  return {
    id: String(product.id || product.name || '').trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
    name: String(product.name || '').trim(),
    description: String(product.description || '').trim(),
    price: Number(product.price || 0),
    image: String(product.image || '').trim(),
    page: String(product.page || '').trim(),
    category: String(product.category || 'Remote Controls').trim(),
    stock: Number(product.stock || 0),
    active: product.active !== false,
    featured: product.featured !== false,
    gallery,
    updatedAt: new Date().toISOString()
  };
}

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
    productsCollection = db.collection("products");
    settingsCollection = db.collection("settings");

    const productCount = await productsCollection.countDocuments();
    if (productCount === 0) {
      const seedProducts = readSeedProducts().map(product => ({
        ...normalizeProduct(product),
        createdAt: new Date().toISOString()
      }));
      await productsCollection.insertMany(seedProducts);
      console.log(`✅ Seeded ${seedProducts.length} products`);
    }

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
  res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});


// ==============================
// Admin Setup
// ==============================

app.get('/api/admin/setup-status', async (req, res) => {
  try {
    res.json({
      hasAdminKey: await hasStoredAdminKey(),
      usesRenderSecret: Boolean(process.env.ADMIN_SECRET)
    });
  } catch (err) {
    console.error("❌ Failed to check admin setup:", err);
    res.status(500).send({
      message: "Failed to check admin setup"
    });
  }
});

app.post('/api/admin/setup', setupAdminKey);


// ==============================
// Public Products
// ==============================

app.get('/api/products', async (req, res) => {
  try {
    if (!productsCollection) {
      return res.json(readSeedProducts().filter(product => product.active !== false));
    }

    const products = await productsCollection
      .find({ active: { $ne: false } })
      .sort({ featured: -1, name: 1 })
      .toArray();

    res.json(products);
  } catch (err) {
    console.error("❌ Failed to fetch products:", err);
    res.status(500).send({
      message: "Failed to fetch products"
    });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await productsCollection.findOne({
      id: req.params.id,
      active: { $ne: false }
    });

    if (!product) {
      return res.status(404).send({
        message: "Product not found"
      });
    }

    res.json(product);
  } catch (err) {
    console.error("❌ Failed to fetch product:", err);
    res.status(500).send({
      message: "Failed to fetch product"
    });
  }
});


// ==============================
// Admin Products + Store Stats
// ==============================

app.get('/api/admin/products', requireAdmin, async (req, res) => {
  try {
    const products = await productsCollection
      .find()
      .sort({ name: 1 })
      .toArray();

    res.json(products);
  } catch (err) {
    console.error("❌ Failed to fetch admin products:", err);
    res.status(500).send({
      message: "Failed to fetch products"
    });
  }
});

app.post('/api/admin/products', requireAdmin, async (req, res) => {
  try {
    const product = {
      ...normalizeProduct(req.body),
      createdAt: new Date().toISOString()
    };

    const validationError = validateProduct(product);
    if (validationError) {
      return res.status(400).send({
        message: validationError
      });
    }

    const existing = await productsCollection.findOne({ id: product.id });
    if (existing) {
      return res.status(409).send({
        message: "A product with this id already exists"
      });
    }

    await productsCollection.insertOne(product);
    res.status(201).json(product);
  } catch (err) {
    console.error("❌ Failed to create product:", err);
    res.status(500).send({
      message: "Failed to create product"
    });
  }
});

app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    const product = normalizeProduct({
      ...req.body,
      id: req.params.id
    });

    const validationError = validateProduct(product);
    if (validationError) {
      return res.status(400).send({
        message: validationError
      });
    }

    const updatedProduct = await productsCollection.findOneAndUpdate(
      { id: req.params.id },
      { $set: product },
      { returnDocument: "after" }
    );

    if (!updatedProduct) {
      return res.status(404).send({
        message: "Product not found"
      });
    }

    res.json(updatedProduct);
  } catch (err) {
    console.error("❌ Failed to update product:", err);
    res.status(500).send({
      message: "Failed to update product"
    });
  }
});

app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    const updatedProduct = await productsCollection.findOneAndUpdate(
      { id: req.params.id },
      {
        $set: {
          active: false,
          updatedAt: new Date().toISOString()
        }
      },
      { returnDocument: "after" }
    );

    if (!updatedProduct) {
      return res.status(404).send({
        message: "Product not found"
      });
    }

    res.json(updatedProduct);
  } catch (err) {
    console.error("❌ Failed to remove product:", err);
    res.status(500).send({
      message: "Failed to remove product"
    });
  }
});

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const [orders, productCount, activeProductCount] = await Promise.all([
      ordersCollection.find().toArray(),
      productsCollection.countDocuments(),
      productsCollection.countDocuments({ active: { $ne: false } })
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const shippedOrders = orders.filter(order => order.status === 'shipped').length;
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;

    res.json({
      totalOrders: orders.length,
      totalRevenue: totalRevenue.toFixed(2),
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      productCount,
      activeProductCount
    });
  } catch (err) {
    console.error("❌ Failed to load store stats:", err);
    res.status(500).send({
      message: "Failed to load store stats"
    });
  }
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

app.get('/get-orders', requireAdmin, async (req, res) => {
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

app.post('/update-status', requireAdmin, async (req, res) => {

  const { paymentId, newStatus } = req.body;

  try {

    const order = await ordersCollection.findOneAndUpdate(
      { paymentId },
      { $set: { status: newStatus } },
      { returnDocument: "after" }
    );

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
