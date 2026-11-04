const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/users/lookup?query=...
router.get('/lookup', (req, res) => {
  try {
    const { query } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = `%${query.trim().toLowerCase()}%`;

    const sql = `
      SELECT u.id,
             u.name,
             u.email,
             u.role,
             u.created_at,
             (SELECT COUNT(*) FROM orders WHERE buyer_id = u.id) AS orders_count,
             (SELECT COUNT(*) FROM support_tickets WHERE user_id = u.id) AS tickets_count
      FROM users u
      WHERE LOWER(u.email) LIKE ? OR LOWER(u.name) LIKE ?
      LIMIT 10
    `;

    const users = db.prepare(sql).all(searchTerm, searchTerm);
    res.json({ users, count: users.length });
  } catch (error) {
    console.error('User lookup error:', error);
    res.status(500).json({ error: 'User lookup failed', message: error.message });
  }
});

module.exports = router;
