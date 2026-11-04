const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/tickets
router.get('/', (req, res) => {
  try {
    const { user_id, status } = req.query;

    let query = `
      SELECT t.*,
             u.name AS user_name,
             u.email AS user_email,
             u.role AS user_role
      FROM support_tickets t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (user_id) {
      query += ` AND t.user_id = ?`;
      params.push(user_id);
    }

    if (status && status !== 'ALL') {
      query += ` AND t.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY t.id DESC`;

    const tickets = db.prepare(query).all(...params);
    res.json({ tickets, count: tickets.length });
  } catch (error) {
    console.error('Fetch tickets error:', error);
    res.status(500).json({ error: 'Failed to retrieve tickets', message: error.message });
  }
});

// POST /api/tickets
router.post('/', (req, res) => {
  try {
    const { user_id, subject, message } = req.body;

    if (!user_id || !subject || !message) {
      return res.status(400).json({ error: 'user_id, subject, and message are required.' });
    }

    const insert = db.prepare(`
      INSERT INTO support_tickets (user_id, subject, message, status)
      VALUES (?, ?, ?, 'Open')
    `);

    const result = insert.run(user_id, subject.trim(), message.trim());

    const createdTicket = db.prepare(`
      SELECT t.*,
             u.name AS user_name,
             u.email AS user_email,
             u.role AS user_role
      FROM support_tickets t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ message: 'Support ticket submitted successfully', ticket: createdTicket });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to submit ticket', message: error.message });
  }
});

// PATCH /api/tickets/:id/status
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Open', 'In Progress', 'Resolved'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed: ${validStatuses.join(', ')}` });
    }

    const update = db.prepare('UPDATE support_tickets SET status = ? WHERE id = ?');
    const result = update.run(status, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Support ticket not found' });
    }

    const updatedTicket = db.prepare(`
      SELECT t.*,
             u.name AS user_name,
             u.email AS user_email,
             u.role AS user_role
      FROM support_tickets t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `).get(req.params.id);

    res.json({ message: `Ticket status updated to ${status}`, ticket: updatedTicket });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ error: 'Failed to update ticket status', message: error.message });
  }
});

module.exports = router;
