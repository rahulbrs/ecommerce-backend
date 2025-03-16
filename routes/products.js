const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// Get all active products with optional filtering and sorting
router.get('/', async (req, res) => {
  const { category, sortBy, minPrice, maxPrice } = req.query;
  let query = 'SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.is_active = TRUE';
  const params = [];

  if (category) {
    query += ' AND p.category_id = $1';
    params.push(category);
  }
  if (minPrice) {
    query += ` AND p.mrp - (p.mrp * p.discount / 100) >= $${params.length + 1}`;
    params.push(minPrice);
  }
  if (maxPrice) {
    query += ` AND p.mrp - (p.mrp * p.discount / 100) <= $${params.length + 1}`;
    params.push(maxPrice);
  }
  if (sortBy) {
    const sortField = sortBy === 'price' ? 'p.mrp - (p.mrp * p.discount / 100)' : `p.${sortBy}`;
    query += ` ORDER BY ${sortField}`;
  }

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all active categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories WHERE is_active = TRUE');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;