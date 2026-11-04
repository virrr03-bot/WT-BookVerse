const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/orders
router.get('/', (req, res) => {
  try {
    const { buyer_id } = req.query;

    let query = `
      SELECT o.*,
             b.title AS book_title,
             b.author AS book_author,
             b.condition AS book_condition,
             b.original_price AS book_original_price,
             u.name AS buyer_name,
             u.email AS buyer_email
      FROM orders o
      LEFT JOIN books b ON o.book_id = b.id
      LEFT JOIN users u ON o.buyer_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (buyer_id) {
      query += ` AND o.buyer_id = ?`;
      params.push(buyer_id);
    }

    query += ` ORDER BY o.id DESC`;

    const orders = db.prepare(query).all(...params);
    res.json({ orders, count: orders.length });
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ error: 'Failed to retrieve orders', message: error.message });
  }
});

// POST /api/orders
// Accepts either single order { buyer_id, book_id, quantity, total_price } or multiple items { buyer_id, items: [...] }
router.post('/', (req, res) => {
  try {
    const { buyer_id, book_id, quantity = 1, total_price, items } = req.body;

    if (!buyer_id) {
      return res.status(400).json({ error: 'buyer_id is required' });
    }

    // Execute in transaction to safely decrement stock and create orders
    const createOrderTx = db.transaction(() => {
      const createdOrders = [];
      const orderItems = items && Array.isArray(items) ? items : [{ book_id, quantity, total_price }];

      for (const item of orderItems) {
        if (!item.book_id) continue;

        const qty = parseInt(item.quantity, 10) || 1;
        const price = parseFloat(item.total_price || (item.price * qty));

        // Insert order
        const insertOrder = db.prepare(`
          INSERT INTO orders (buyer_id, book_id, quantity, total_price, status)
          VALUES (?, ?, ?, ?, 'Pending')
        `);
        const result = insertOrder.run(buyer_id, item.book_id, qty, price);

        // Decrement book inventory
        const updateBook = db.prepare(`
          UPDATE books
          SET quantity = MAX(0, quantity - ?)
          WHERE id = ?
        `);
        updateBook.run(qty, item.book_id);

        // Fetch inserted order details
        const fullOrder = db.prepare(`
          SELECT o.*,
                 b.title AS book_title,
                 b.author AS book_author,
                 b.condition AS book_condition,
                 u.name AS buyer_name,
                 u.email AS buyer_email
          FROM orders o
          LEFT JOIN books b ON o.book_id = b.id
          LEFT JOIN users u ON o.buyer_id = u.id
          WHERE o.id = ?
        `).get(result.lastInsertRowid);

        createdOrders.push(fullOrder);
      }

      return createdOrders;
    });

    const orders = createOrderTx();
    res.status(201).json({ message: 'Order(s) placed successfully', orders });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to process order', message: error.message });
  }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed: ${validStatuses.join(', ')}` });
    }

    const update = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
    const result = update.run(status, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // If cancelled, restore quantity to book inventory
    if (status === 'Cancelled') {
      const order = db.prepare('SELECT book_id, quantity FROM orders WHERE id = ?').get(req.params.id);
      if (order) {
        db.prepare('UPDATE books SET quantity = quantity + ? WHERE id = ?').run(order.quantity, order.book_id);
      }
    }

    const updatedOrder = db.prepare(`
      SELECT o.*,
             b.title AS book_title,
             b.author AS book_author,
             b.condition AS book_condition,
             u.name AS buyer_name,
             u.email AS buyer_email
      FROM orders o
      LEFT JOIN books b ON o.book_id = b.id
      LEFT JOIN users u ON o.buyer_id = u.id
      WHERE o.id = ?
    `).get(req.params.id);

    res.json({ message: `Order status updated to ${status}`, order: updatedOrder });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status', message: error.message });
  }
});

module.exports = router;
