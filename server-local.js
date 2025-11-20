// server-local.js
// Local development server - NO Firebase or MongoDB required!
// Uses in-memory storage and skips authentication
// Run: node server-local.js

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory product storage
let products = [
  {
    _id: '1',
    title: 'Wireless Headphones',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    description: 'High-quality wireless headphones with noise cancellation',
    category: 'Electronics',
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    title: 'Running Shoes',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
    description: 'Comfortable running shoes for all terrains',
    category: 'Sports',
    createdAt: new Date().toISOString()
  },
  {
    _id: '3',
    title: 'Coffee Maker',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=300',
    description: 'Automatic drip coffee maker, 12-cup capacity',
    category: 'Home',
    createdAt: new Date().toISOString()
  },
  {
    _id: '4',
    title: 'Backpack',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300',
    description: 'Water-resistant laptop backpack with USB charging port',
    category: 'Accessories',
    createdAt: new Date().toISOString()
  }
];

let nextId = 5;

// Skip auth for local development
function skipAuth(req, res, next) {
  req.user = { uid: 'local-dev', admin: true };
  next();
}

// Public: list products
app.get('/api/products', (req, res) => {
  res.json(products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// Public: get single product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p._id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Admin: create product
app.post('/api/products', skipAuth, (req, res) => {
  const { title, price, image, description, category } = req.body;
  const product = {
    _id: String(nextId++),
    title,
    price: parseFloat(price),
    image,
    description,
    category,
    createdAt: new Date().toISOString()
  };
  products.push(product);
  res.json(product);
});

// Admin: update product
app.put('/api/products/:id', skipAuth, (req, res) => {
  const idx = products.findIndex(p => p._id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });

  products[idx] = { ...products[idx], ...req.body };
  res.json(products[idx]);
});

// Admin: delete product
app.delete('/api/products/:id', skipAuth, (req, res) => {
  const idx = products.findIndex(p => p._id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });

  products.splice(idx, 1);
  res.json({ success: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('');
  console.log('===========================================');
  console.log('  ShopSync LOCAL Development Server');
  console.log('===========================================');
  console.log('');
  console.log(`  Shop:  http://localhost:${PORT}`);
  console.log(`  Admin: http://localhost:${PORT}/admin-local.html`);
  console.log('');
  console.log('  Note: Using in-memory storage (data resets on restart)');
  console.log('  Note: Authentication is disabled for testing');
  console.log('');
});
