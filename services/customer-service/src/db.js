const { getDatabase } = require('../../../shared/db-helper');
const { hashPassword } = require('../../../shared/jwt');

function initCustomerDb(isMemory = false) {
  const db = getDatabase('customers', isMemory);

  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      customerId INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      status TEXT DEFAULT 'ACTIVE',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed sample customer if empty
  const count = db.get('SELECT COUNT(*) as cnt FROM customers').cnt;
  if (count === 0) {
    db.run(
      `INSERT INTO customers (fullName, phone, email, password, status)
       VALUES (?, ?, ?, ?, ?)`,
      ['Nguyễn Văn A', '0901234567', 'nguyenvana@gmail.com', hashPassword('123456'), 'ACTIVE']
    );
    db.run(
      `INSERT INTO customers (fullName, phone, email, password, status)
       VALUES (?, ?, ?, ?, ?)`,
      ['Trần Thị B', '0912345678', 'tranthib@gmail.com', hashPassword('123456'), 'ACTIVE']
    );
  }

  return db;
}

module.exports = { initCustomerDb };
