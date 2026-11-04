const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/promotions
// Returns the currently active promotion or the latest recorded campaign
router.get('/', (req, res) => {
  try {
    const promotion = db.prepare(`
      SELECT * FROM promotions
      ORDER BY is_active DESC, id DESC
      LIMIT 1
    `).get();

    if (!promotion) {
      return res.json({
        promotion: {
          id: 1,
          sale_name: 'Festival Book Utsav',
          discount_percent: 15,
          is_active: 1
        }
      });
    }

    res.json({ promotion });
  } catch (error) {
    console.error('Fetch promotion error:', error);
    res.status(500).json({ error: 'Failed to retrieve promotions', message: error.message });
  }
});

// PUT /api/promotions
router.put('/', (req, res) => {
  try {
    const { sale_name, discount_percent, is_active } = req.body;

    if (!sale_name || discount_percent === undefined) {
      return res.status(400).json({ error: 'sale_name and discount_percent are required.' });
    }

    const activeInt = is_active ? 1 : 0;
    const discountVal = parseFloat(discount_percent) || 0;

    // Check if an existing promotion exists to update
    const existing = db.prepare('SELECT id FROM promotions ORDER BY id DESC LIMIT 1').get();

    if (existing) {
      db.prepare(`
        UPDATE promotions
        SET sale_name = ?, discount_percent = ?, is_active = ?
        WHERE id = ?
      `).run(sale_name.trim(), discountVal, activeInt, existing.id);

      const updated = db.prepare('SELECT * FROM promotions WHERE id = ?').get(existing.id);
      return res.json({ message: 'Campaign updated successfully', promotion: updated });
    } else {
      const result = db.prepare(`
        INSERT INTO promotions (sale_name, discount_percent, is_active)
        VALUES (?, ?, ?)
      `).run(sale_name.trim(), discountVal, activeInt);

      const created = db.prepare('SELECT * FROM promotions WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json({ message: 'Campaign created successfully', promotion: created });
    }
  } catch (error) {
    console.error('Update promotion error:', error);
    res.status(500).json({ error: 'Failed to update campaign', message: error.message });
  }
});

module.exports = router;
