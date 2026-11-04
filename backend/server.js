require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db, initDB } = require('./db');

// Route modules
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const orderRoutes = require('./routes/orders');
const promotionRoutes = require('./routes/promotions');
const ticketRoutes = require('./routes/tickets');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize SQLite database schema
initDB();

// Middleware setup
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger (Development)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the BookVerse REST API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      books: '/api/books',
      orders: '/api/orders',
      promotions: '/api/promotions',
      tickets: '/api/tickets',
      users: '/api/users'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    const check = db.prepare('SELECT 1 AS status').get();
    res.status(200).json({
      status: 'ok',
      service: 'BookVerse API',
      timestamp: new Date().toISOString(),
      database: check.status === 1 ? 'connected' : 'unhealthy'
    });
  } catch (error) {
    console.error('Health check database error:', error);
    res.status(503).json({
      status: 'error',
      service: 'BookVerse API',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Mount API Route Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);

// 404 Not Found handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Start Express server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 BookVerse Backend Server running on port ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📚 Books API:    http://localhost:${PORT}/api/books`);
    console.log(`===============================================`);
  });
}

module.exports = app;
