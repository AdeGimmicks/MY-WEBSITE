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
const geoip = require('geoip-lite');

app.use(cors());
app.use(express.json({ limit: '12mb' }));
app.set('trust proxy', true);

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
let visitorsCollection;

const seedProductsPath = path.join(__dirname, 'Public', 'data', 'products.json');

function formatStoreTime(timestamp) {
  return new Date(timestamp).toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

function hashAdminKey(adminKey, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(adminKey, salt, 100000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyAdminKey(adminKey, stored) {
  if (!adminKey || !stored?.salt || !stored?.hash) return false;
  const check = hashAdminKey(adminKey, stored.salt);
  return crypto.timingSafeEqual(Buffer.from(check.hash, 'hex'), Buffer.from(stored.hash, 'hex'));
}

async function hasSavedAdminKey() {
  if (!settingsCollection) return false;
  const setting = await settingsCollection.findOne({ key: 'adminAuth' });
  return Boolean(setting?.auth?.hash);
}

async function requireAdmin(req, res, next) {
  return next();
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
    const alreadySetup = await hasSavedAdminKey();
    if (alreadySetup) {
      return res.status(409).send({
        message: "Owner key already exists."
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

function seedProductFor(id) {
  return readSeedProducts().find(product => product.id === id);
}

function uniqueGallery(images) {
  return Array.from(new Set((images || []).filter(Boolean).map(image => String(image).trim()))).slice(0, 6);
}

function starterPlaceholderGallery() {
  return Array.from({ length: 6 }, (_, index) => `Product images/product-placeholder.svg?slot=${index + 1}`);
}

function hydrateProductGallery(product) {
  const seedProduct = seedProductFor(product.id);
  if (!seedProduct) return product;

  const productGallery = Array.isArray(product.gallery) ? product.gallery.filter(Boolean) : [];
  const seedGallery = Array.isArray(seedProduct.gallery) ? seedProduct.gallery.filter(Boolean) : [];
  const hasManagedGallery = product.galleryManaged === true;
  const hasGallery = productGallery.length > 1;
  const hasBadImagePath = String(product.image || '').includes('NewDesign');
  const gallery = hasGallery || hasManagedGallery
    ? productGallery
    : uniqueGallery([product.image, ...seedGallery]);

  return {
    ...product,
    image: hasBadImagePath ? seedProduct.image : product.image,
    gallery
  };
}

async function backfillProductGalleries() {
  const seedProducts = readSeedProducts();

  for (const seedProduct of seedProducts) {
    if (!Array.isArray(seedProduct.gallery) || seedProduct.gallery.length === 0) continue;

    const currentProduct = await productsCollection.findOne({ id: seedProduct.id });
    if (!currentProduct) continue;

    const currentGallery = Array.isArray(currentProduct.gallery) ? currentProduct.gallery.filter(Boolean) : [];
    const hasManagedGallery = currentProduct.galleryManaged === true;
    const hasGallery = currentGallery.length > 1;
    const hasBadImagePath = String(currentProduct.image || '').includes('NewDesign');
    if ((hasGallery || hasManagedGallery) && !hasBadImagePath) continue;
    const image = hasBadImagePath
      ? seedProduct.image
      : currentProduct.image || seedProduct.image;
    const gallery = uniqueGallery([image, ...(seedProduct.gallery || [])]);

    await productsCollection.updateOne(
      { id: seedProduct.id },
      {
        $set: {
          gallery,
          image,
          galleryManaged: false,
          updatedAt: new Date().toISOString()
        }
      }
    );
  }
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
    galleryManaged: Array.isArray(product.gallery) ? true : Boolean(product.galleryManaged),
    galleryUpdatedAt: Array.isArray(product.gallery)
      ? product.galleryUpdatedAt || new Date().toISOString()
      : product.galleryUpdatedAt,
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

async function sendOrderEmail(orderData, mailOptions) {
  const sendPromise = transporter.sendMail(mailOptions)
    .then(async info => {
      await ordersCollection.updateOne(
        { orderNumber: orderData.orderNumber },
        {
          $set: {
            emailStatus: "sent",
            emailSentAt: new Date().toISOString(),
            emailResponse: info.response || ""
          }
        }
      );
      console.log("📧 Email sent:", info.response);
      return { emailSent: true, emailStatus: "sent" };
    })
    .catch(async error => {
      await ordersCollection.updateOne(
        { orderNumber: orderData.orderNumber },
        {
          $set: {
            emailStatus: "failed",
            emailError: error.message || "Email failed",
            emailFailedAt: new Date().toISOString()
          }
        }
      );
      console.error("❌ Failed to send email:", error);
      return { emailSent: false, emailStatus: "failed" };
    });

  const timeoutPromise = new Promise(resolve => {
    setTimeout(() => resolve({ emailSent: "pending", emailStatus: "pending" }), 500);
  });

  return Promise.race([sendPromise, timeoutPromise]);
}

function orderMailOptions(orderData) {
  return {
    from: `"ElectronicsOnly" <${process.env.GMAIL_USER}>`,
    to: orderData.customer.email,
    subject: '✅ Order Confirmation – ElectronicsOnly',
    html: `
      <h2>Thank You for Your Order!</h2>

      <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>

      <p><strong>Name:</strong> ${orderData.customer.name}</p>

      <p><strong>Email:</strong> ${orderData.customer.email}</p>

      <p><strong>Shipping Address:</strong> ${orderData.customer.address}</p>

      <p><strong>Subtotal:</strong> $${orderData.subtotal || "0.00"}</p>

      <p><strong>Shipping:</strong> $${orderData.shipping || "0.00"}</p>

      <p><strong>Tax:</strong> $${orderData.tax || "0.00"}</p>

      <p><strong>Processing Fee:</strong> $${orderData.processingFee || "0.00"}</p>

      <p><strong>Total Paid:</strong> $${orderData.total}</p>

      <p><strong>Order Time:</strong>
      ${formatStoreTime(orderData.timestamp)}</p>

      <p>We’ve received your order and it is being processed.</p>
    `
  };
}

async function startServer() {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    const db = client.db("electronicsonly");
    ordersCollection = db.collection("orders");
    productsCollection = db.collection("products");
    settingsCollection = db.collection("settings");
    visitorsCollection = db.collection("visitors");

    const productCount = await productsCollection.countDocuments();
    if (productCount === 0) {
      const seedProducts = readSeedProducts().map(product => ({
        ...normalizeProduct(product),
        createdAt: new Date().toISOString()
      }));
      await productsCollection.insertMany(seedProducts);
      console.log(`✅ Seeded ${seedProducts.length} products`);
    } else {
      await backfillProductGalleries();
      const seedProducts = readSeedProducts().map(product => ({
        ...normalizeProduct(product),
        createdAt: new Date().toISOString()
      }));
      for (const product of seedProducts) {
        await productsCollection.updateOne(
          { id: product.id },
          { $setOnInsert: product },
          { upsert: true }
        );
      }
      const managedTvRemoteStarterIds = [
        "tv-remote-starter-1",
        "tv-remote-starter-2",
        "tv-remote-starter-3",
        "tv-remote-starter-4",
        "tv-remote-starter-5"
      ];
      for (const starterId of managedTvRemoteStarterIds) {
        const starterProduct = seedProducts.find(product => product.id === starterId);
        if (!starterProduct) continue;
        const { galleryUpdatedAt, ...starterUpdate } = starterProduct;
        await productsCollection.updateOne(
          {
            id: starterId,
            $or: [
              { name: /^TV Remote Starter Item/ },
              { image: /product-placeholder/ }
            ]
          },
          {
            $set: {
              ...starterUpdate,
              updatedAt: new Date().toISOString()
            }
          }
        );
      }
      const starterGallery = starterPlaceholderGallery();
      await productsCollection.updateMany(
        {
          id: { $regex: "starter" },
          $or: [
            { name: /Starter Item/ },
            { image: /product-placeholder/ }
          ],
          $and: [
            {
              $or: [
                { gallery: { $exists: false } },
                { gallery: { $size: 0 } },
                { gallery: { $size: 1 } }
              ]
            }
          ]
        },
        {
          $set: {
            image: starterGallery[0],
            gallery: starterGallery,
            galleryManaged: false,
            updatedAt: new Date().toISOString()
          }
        }
      );
      await productsCollection.updateMany(
        {
          category: { $ne: "TV Remotes" }
        },
        {
          $set: {
            active: false,
            featured: false,
            updatedAt: new Date().toISOString()
          }
        }
      );
      console.log("✅ Product galleries checked");
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
      hasAdminKey: true,
      openManager: true,
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

    res.json(products.map(hydrateProductGallery));
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

    res.json(hydrateProductGallery(product));
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
      .find({
        category: "TV Remotes",
        active: { $ne: false }
      })
      .sort({ category: 1, name: 1 })
      .toArray();

    const categoryOrder = ["TV Remotes"];
    const orderedProducts = products
      .map(hydrateProductGallery)
      .sort((first, second) => {
        const firstRank = categoryOrder.indexOf(first.category);
        const secondRank = categoryOrder.indexOf(second.category);
        const categoryDifference = (firstRank === -1 ? categoryOrder.length : firstRank)
          - (secondRank === -1 ? categoryOrder.length : secondRank);
        if (categoryDifference !== 0) return categoryDifference;
        return String(first.name || "").localeCompare(String(second.name || ""));
      });

    res.json(orderedProducts);
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
      productsCollection.countDocuments({
        category: "TV Remotes",
        active: { $ne: false }
      }),
      productsCollection.countDocuments({
        category: "TV Remotes",
        active: { $ne: false }
      })
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
// Website Visitor Activity
// ==============================

function visitorDevice(userAgent = "") {
  if (/ipad|tablet/i.test(userAgent)) return "Tablet";
  if (/mobile|iphone|android/i.test(userAgent)) return "Mobile";
  return "Desktop";
}

function visitorBrowser(userAgent = "") {
  if (/Edg\//.test(userAgent)) return "Edge";
  if (/Chrome\//.test(userAgent) && !/Edg\//.test(userAgent)) return "Chrome";
  if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) return "Safari";
  if (/Firefox\//.test(userAgent)) return "Firefox";
  return "Browser";
}

function visitorLocation(req) {
  const ip = visitorIp(req);
  const geo = ip ? geoip.lookup(ip) : null;
  const city = cleanVisitorText(req.get('cf-ipcity') || req.get('x-vercel-ip-city') || geo?.city || "");
  const region = cleanVisitorText(req.get('cf-region') || req.get('x-vercel-ip-country-region') || geo?.region || "");
  const country = cleanVisitorText(req.get('cf-ipcountry') || req.get('x-vercel-ip-country') || geo?.country || "");

  return { city, region, country, ip: maskVisitorIp(ip) };
}

function cleanVisitorText(value, fallback = "") {
  return String(value || fallback).trim().slice(0, 220);
}

function visitorIp(req) {
  const forwarded = String(req.get('x-forwarded-for') || "").split(",")[0].trim();
  return req.get('cf-connecting-ip') || req.get('x-real-ip') || forwarded || req.ip || "";
}

function maskVisitorIp(ip) {
  const cleanIp = String(ip || "").replace(/^::ffff:/, "");
  if (!cleanIp) return "";
  if (cleanIp.includes(":")) {
    const parts = cleanIp.split(":").filter(Boolean);
    return parts.length > 2 ? `${parts.slice(0, 2).join(":")}:...` : cleanIp;
  }

  const parts = cleanIp.split(".");
  return parts.length === 4 ? `${parts[0]}.${parts[1]}.${parts[2]}.xxx` : cleanIp;
}

app.post('/api/visitor-event', async (req, res) => {
  try {
    if (!visitorsCollection) return res.json({ success: true });

    const now = new Date().toISOString();
    const userAgent = req.get('user-agent') || "";
    const visitorId = cleanVisitorText(req.body.visitorId || crypto.randomUUID()).slice(0, 80);
    const sessionId = cleanVisitorText(req.body.sessionId || "").slice(0, 80);
    const eventName = cleanVisitorText(req.body.event || "page_view", "page_view").slice(0, 60);
    const page = cleanVisitorText(req.body.page || req.get('referer') || "Website");
    const title = cleanVisitorText(req.body.title || page);
    const productName = cleanVisitorText(req.body.productName || req.body.content_name || "");
    const productId = cleanVisitorText(req.body.productId || "");
    const referrer = cleanVisitorText(req.body.referrer || req.get('referer') || "Direct");
    const location = visitorLocation(req);

    const event = {
      event: eventName,
      page,
      title,
      productId,
      productName,
      value: Number(req.body.value || 0),
      timestamp: now
    };

    await visitorsCollection.updateOne(
      { visitorId },
      {
        $setOnInsert: {
          visitorId,
          firstSeen: now
        },
        $set: {
          sessionId,
          lastSeen: now,
          lastEvent: eventName,
          lastPage: page,
          lastTitle: title,
          lastProduct: productName,
          referrer,
          location,
          device: visitorDevice(userAgent),
          browser: visitorBrowser(userAgent),
          userAgent: userAgent.slice(0, 300)
        },
        $inc: { visitCount: eventName === "page_view" ? 1 : 0 },
        $push: {
          events: {
            $each: [event],
            $slice: -40
          }
        }
      },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to save visitor event:", err);
    res.json({ success: false });
  }
});

app.get('/api/admin/visitors', requireAdmin, async (req, res) => {
  try {
    const visitors = await visitorsCollection
      .find({}, { projection: { userAgent: 0 } })
      .sort({ lastSeen: -1 })
      .limit(50)
      .toArray();

    res.json(visitors);
  } catch (err) {
    console.error("❌ Failed to fetch visitors:", err);
    res.status(500).send({
      message: "Failed to fetch visitors"
    });
  }
});


// ==============================
// Stripe Payment Intent
// ==============================

app.post('/create-payment-intent', async (req, res) => {

  const { amount, currency } = req.body;
  const chargeAmount = Math.round(Number(amount || 0));

  if (!Number.isFinite(chargeAmount) || chargeAmount < 50) {
    return res.status(400).send({
      error: "Invalid payment amount"
    });
  }

  try {

    const paymentIntent = await stripe.paymentIntents.create({
      amount: chargeAmount,
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
      emailStatus: "pending",
      timestamp: new Date().toISOString()
    };

    await ordersCollection.insertOne(orderData);

    if (orderData.visitorId && visitorsCollection) {
      await visitorsCollection.updateOne(
        { visitorId: String(orderData.visitorId) },
        {
          $set: {
            customerName: orderData.customer.name,
            customerEmail: orderData.customer.email,
            lastOrderNumber: orderNumber,
            lastOrderTotal: orderData.total,
            lastSeen: orderData.timestamp,
            lastEvent: "purchase"
          }
        }
      );
    }

    const emailResult = await sendOrderEmail(orderData, orderMailOptions(orderData));

    res.send({
      success: true,
      emailSent: emailResult.emailSent,
      emailStatus: emailResult.emailStatus,
      message: emailResult.emailStatus === "sent"
        ? "Order saved and email sent."
        : "Order saved. Email confirmation is being sent.",
      orderNumber,
      timestamp: orderData.timestamp
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


app.get('/api/orders/:orderNumber/status', async (req, res) => {
  try {
    const order = await ordersCollection.findOne(
      { orderNumber: req.params.orderNumber },
      {
        projection: {
          _id: 0,
          orderNumber: 1,
          status: 1,
          emailStatus: 1,
          emailSentAt: 1,
          emailFailedAt: 1,
          emailError: 1,
          timestamp: 1
        }
      }
    );

    if (!order) {
      return res.status(404).send({
        message: "Order not found"
      });
    }

    res.json(order);
  } catch (err) {
    console.error("❌ Failed to load order status:", err);
    res.status(500).send({
      message: "Failed to load order status"
    });
  }
});


app.post('/api/admin/orders/:orderNumber/resend-email', requireAdmin, async (req, res) => {
  try {
    const order = await ordersCollection.findOne({ orderNumber: req.params.orderNumber });
    if (!order) {
      return res.status(404).send({
        message: "Order not found"
      });
    }

    await ordersCollection.updateOne(
      { orderNumber: order.orderNumber },
      {
        $set: {
          emailStatus: "pending",
          emailRetryAt: new Date().toISOString()
        },
        $unset: {
          emailError: "",
          emailFailedAt: ""
        }
      }
    );

    const emailResult = await sendOrderEmail(order, orderMailOptions(order));

    res.send({
      success: true,
      message: emailResult.emailStatus === "sent"
        ? "Confirmation email sent."
        : "Confirmation email is still sending.",
      emailStatus: emailResult.emailStatus
    });
  } catch (err) {
    console.error("❌ Failed to resend order email:", err);
    res.status(500).send({
      message: "Failed to resend confirmation email"
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
