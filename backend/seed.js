const bcrypt = require('bcryptjs');
const { db, initDB } = require('./db');

async function seedDatabase() {
  console.log('--- Starting BookVerse Database Seeding ---');

  // Ensure tables exist
  initDB();

  // Clear existing records in reverse dependency order
  db.exec(`
    DELETE FROM support_tickets;
    DELETE FROM orders;
    DELETE FROM books;
    DELETE FROM promotions;
    DELETE FROM users;
  `);

  console.log('Cleared existing records.');

  // Default password for all seed accounts
  const plainPassword = 'Password123!';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // 1. Seed Users (one for each required role)
  const users = [
    {
      name: 'Alice Customer',
      email: 'customer@bookverse.com',
      password: hashedPassword,
      role: 'customer'
    },
    {
      name: 'Nova Press Publishers',
      email: 'freshseller@bookverse.com',
      password: hashedPassword,
      role: 'fresh_seller'
    },
    {
      name: 'Bob Vintage Corner',
      email: 'usedseller@bookverse.com',
      password: hashedPassword,
      role: 'used_seller'
    },
    {
      name: 'Maya Marketing Lead',
      email: 'marketing@bookverse.com',
      password: hashedPassword,
      role: 'marketing'
    },
    {
      name: 'Sam Customer Support',
      email: 'support@bookverse.com',
      password: hashedPassword,
      role: 'support'
    }
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, role)
    VALUES (@name, @email, @password, @role)
  `);

  const userIds = {};
  for (const user of users) {
    const result = insertUser.run(user);
    userIds[user.role] = result.lastInsertRowid;
    console.log(`Created user [${user.role}]: ${user.email} (ID: ${result.lastInsertRowid})`);
  }

  // 2. Seed Books (both New and Used conditions)
  const books = [
    // Fresh Seller (Condition: New)
    {
      seller_id: userIds['fresh_seller'],
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      condition: 'New',
      original_price: 49.99,
      discount_price: 39.99,
      quantity: 25
    },
    {
      seller_id: userIds['fresh_seller'],
      title: 'The Pragmatic Programmer: Your Journey to Mastery',
      author: 'David Thomas, Andrew Hunt',
      condition: 'New',
      original_price: 54.99,
      discount_price: 44.99,
      quantity: 15
    },
    {
      seller_id: userIds['fresh_seller'],
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      condition: 'New',
      original_price: 59.99,
      discount_price: 49.99,
      quantity: 20
    },
    // Used Seller (Conditions: Like New, Good, Acceptable)
    {
      seller_id: userIds['used_seller'],
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      condition: 'Like New',
      original_price: 19.99,
      discount_price: 12.99,
      quantity: 5
    },
    {
      seller_id: userIds['used_seller'],
      title: '1984',
      author: 'George Orwell',
      condition: 'Good',
      original_price: 18.00,
      discount_price: 8.50,
      quantity: 8
    },
    {
      seller_id: userIds['used_seller'],
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      condition: 'Acceptable',
      original_price: 15.00,
      discount_price: 5.00,
      quantity: 3
    }
  ];

  const insertBook = db.prepare(`
    INSERT INTO books (seller_id, title, author, condition, original_price, discount_price, quantity)
    VALUES (@seller_id, @title, @author, @condition, @original_price, @discount_price, @quantity)
  `);

  const bookIds = [];
  for (const book of books) {
    const result = insertBook.run(book);
    bookIds.push(result.lastInsertRowid);
    console.log(`Created book [${book.condition}]: "${book.title}" (ID: ${result.lastInsertRowid})`);
  }

  // 3. Seed Active Festival Promotion Campaign
  const insertPromotion = db.prepare(`
    INSERT INTO promotions (sale_name, discount_percent, is_active)
    VALUES (@sale_name, @discount_percent, @is_active)
  `);

  const activeCampaign = {
    sale_name: 'Grand Autumn & Festival Literary Carnival',
    discount_percent: 20.0,
    is_active: 1
  };

  const promoResult = insertPromotion.run(activeCampaign);
  console.log(`Created active campaign: "${activeCampaign.sale_name}" (ID: ${promoResult.lastInsertRowid}, ${activeCampaign.discount_percent}% off)`);

  // 4. Seed a Sample Order and Support Ticket for completeness
  const insertOrder = db.prepare(`
    INSERT INTO orders (buyer_id, book_id, quantity, total_price, status)
    VALUES (@buyer_id, @book_id, @quantity, @total_price, @status)
  `);

  const orderResult = insertOrder.run({
    buyer_id: userIds['customer'],
    book_id: bookIds[0],
    quantity: 1,
    total_price: 39.99,
    status: 'Pending'
  });
  console.log(`Created sample order (ID: ${orderResult.lastInsertRowid}, status: Pending)`);

  const insertTicket = db.prepare(`
    INSERT INTO support_tickets (user_id, subject, message, status)
    VALUES (@user_id, @subject, @message, @status)
  `);

  const ticketResult = insertTicket.run({
    user_id: userIds['customer'],
    subject: 'Inquiry about book shipping timeframe',
    message: 'Hello, when can I expect my order for Clean Code to be dispatched?',
    status: 'Open'
  });
  console.log(`Created sample support ticket (ID: ${ticketResult.lastInsertRowid}, status: Open)`);

  console.log('\n--- Database Seeding Completed Successfully! ---');
  console.log(`Default password for all seeded users is: "${plainPassword}"\n`);
}

// Execute seed if run directly from command line
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
