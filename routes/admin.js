const express = require('express');
const pool = require('../config/db');
const { auth, adminAuth } = require('../middleware/auth');
const multer = require('multer');
const router = express.Router();

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Add a new product
router.post('/products', auth, adminAuth, upload.single('image'), async (req, res) => {
  const { sku, name, category_id, mrp, discount, quantity } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      'INSERT INTO products (sku, name, category_id, mrp, discount, quantity, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [sku, name, category_id, mrp, discount, quantity, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a product
router.put('/products/:id', auth, adminAuth, upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { sku, name, category_id, mrp, discount, quantity, is_active } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;

  try {
    const result = await pool.query(
      'UPDATE products SET sku = $1, name = $2, category_id = $3, mrp = $4, discount = $5, quantity = $6, image_url = $7, is_active = $8 WHERE id = $9 RETURNING *',
      [sku, name, category_id, mrp, discount, quantity, image_url, is_active, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a product (soft delete by setting is_active to false)
router.delete('/products/:id', auth, adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('UPDATE products SET is_active = FALSE WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new category
router.post('/categories', auth, adminAuth, async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a category
router.put('/categories/:id', auth, adminAuth, async (req, res) => {
  const { id } = req.params;
  const { name, is_active } = req.body;
  try {
    const result = await pool.query(
      'UPDATE categories SET name = $1, is_active = $2 WHERE id = $3 RETURNING *',
      [name, is_active, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Category not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a category (soft delete)
router.delete('/categories/:id', auth, adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('UPDATE categories SET is_active = FALSE WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;