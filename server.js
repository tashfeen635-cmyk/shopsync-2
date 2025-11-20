// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const Product = require('./models/Product');

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware: verify Firebase token
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    return next();
  } catch (err) {
    console.error('Token verify error', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Helpers: check admin custom claim
async function requireAdmin(req, res, next) {
  // `verifyToken` must be called before
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

  // The admin claim is recommended to be set server-side using firebase-admin for specific uid(s)
  if (req.user.admin === true) return next();

  // You can also check custom claims from Firebase
  try {
    const userRecord = await admin.auth().getUser(req.user.uid);
    if (userRecord.customClaims && userRecord.customClaims.admin === true) {
      return next();
    }
    return res.status(403).json({ error: 'Admin only' });
  } catch (err) {
    return res.status(403).json({ error: 'Admin check failed' });
  }
}

// Public: list products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Public: get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Admin: create product
app.post('/api/products', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, price, image, description, category } = req.body;
    const p = new Product({ title, price, image, description, category });
    await p.save();
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Admin: update product
app.put('/api/products/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Admin: delete product
app.delete('/api/products/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Utility endpoint to set admin claim (protect this in production!)
app.post('/api/set-admin', verifyToken, async (req, res) => {
  try {
    const { uid } = req.body;
    // In production, add additional checks here
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    res.json({ success: true, message: `Admin claim set for user ${uid}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to set admin claim' });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
