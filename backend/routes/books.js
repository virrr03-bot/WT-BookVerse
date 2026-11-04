const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/books
// Supports filtering by query search (?q=...), condition (?condition=NEW|USED|Like New...), and seller (?seller_id=...)
router.get('/', (req, res) => {
  try {
    const { q, condition, seller_id } = req.query;

    let query = `
      SELECT b.*, u.name AS seller_name, u.role AS seller_role
      FROM books b
      LEFT JOIN users u ON b.seller_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Search term filtering across title and author
    if (q && q.trim()) {
      query += ` AND (LOWER(b.title) LIKE ? OR LOWER(b.author) LIKE ?)`;
      const searchTerm = `%${q.trim().toLowerCase()}%`;
      params.push(searchTerm, searchTerm);
    }

    // Condition filter
    if (condition && condition !== 'ALL') {
      if (condition.toUpperCase() === 'NEW') {
        query += ` AND b.condition = 'New'`;
      } else if (condition.toUpperCase() === 'USED') {
        query += ` AND b.condition != 'New'`;
      } else {
        query += ` AND b.condition = ?`;
        params.push(condition);
      }
    }

    // Seller ID filter
    if (seller_id) {
      query += ` AND b.seller_id = ?`;
      params.push(seller_id);
    }

    query += ` ORDER BY b.id DESC`;

    const books = db.prepare(query).all(...params);
    res.json({ books, count: books.length });
  } catch (error) {
    console.error('Fetch books error:', error);
    res.status(500).json({ error: 'Failed to retrieve books', message: error.message });
  }
});

// GET /api/books/:id
router.get('/:id', (req, res) => {
  try {
    const book = db.prepare(`
      SELECT b.*, u.name AS seller_name, u.role AS seller_role
      FROM books b
      LEFT JOIN users u ON b.seller_id = u.id
      WHERE b.id = ?
    `).get(req.params.id);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ book });
  } catch (error) {
    console.error('Fetch book error:', error);
    res.status(500).json({ error: 'Failed to retrieve book', message: error.message });
  }
});

// POST /api/books
router.post('/', (req, res) => {
  try {
    const {
      seller_id,
      title,
      author,
      condition = 'New',
      original_price,
      discount_price,
      quantity = 1
    } = req.body;

    if (!seller_id || !title || !author || original_price === undefined) {
      return res.status(400).json({ error: 'seller_id, title, author, and original_price are required.' });
    }

    const validConditions = ['New', 'Like New', 'Good', 'Acceptable'];
    if (!validConditions.includes(condition)) {
      return res.status(400).json({ error: `Invalid condition. Allowed: ${validConditions.join(', ')}` });
    }

    const insert = db.prepare(`
      INSERT INTO books (seller_id, title, author, condition, original_price, discount_price, quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      seller_id,
      title.trim(),
      author.trim(),
      condition,
      parseFloat(original_price),
      discount_price ? parseFloat(discount_price) : null,
      parseInt(quantity, 10) || 1
    );

    const createdBook = db.prepare(`
      SELECT b.*, u.name AS seller_name, u.role AS seller_role
      FROM books b
      LEFT JOIN users u ON b.seller_id = u.id
      WHERE b.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ message: 'Book listed successfully', book: createdBook });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({ error: 'Failed to create book listing', message: error.message });
  }
});

// PATCH /api/books/:id/stock
router.patch('/:id/stock', (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ error: 'Valid non-negative quantity required.' });
    }

    const update = db.prepare('UPDATE books SET quantity = ? WHERE id = ?');
    const result = update.run(parseInt(quantity, 10), req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const updatedBook = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
    res.json({ message: 'Stock updated', book: updatedBook });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Failed to update stock', message: error.message });
  }
});

// DELETE /api/books/:id
router.delete('/:id', (req, res) => {
  try {
    const del = db.prepare('DELETE FROM books WHERE id = ?');
    const result = del.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ message: 'Book listing deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ error: 'Failed to delete book', message: error.message });
  }
});

module.exports = router;
