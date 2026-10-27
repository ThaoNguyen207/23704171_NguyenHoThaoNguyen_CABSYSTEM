const { getDatabase } = require('../../../shared/db-helper');

function initPaymentDb(isMemory = false) {
  const db = getDatabase('payments', isMemory);

  db.exec(`
    CREATE TABLE IF NOT EXISTS payment_methods (
      paymentMethodId INTEGER PRIMARY KEY AUTOINCREMENT,
      methodName TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      paymentId INTEGER PRIMARY KEY AUTOINCREMENT,
      tripId INTEGER NOT NULL,
      paymentMethodId INTEGER NOT NULL,
      amount REAL NOT NULL,
      paymentTime DATETIME DEFAULT CURRENT_TIMESTAMP,
      paymentStatus TEXT DEFAULT 'Success', -- Success, Failed, Pending
      transactionCode TEXT UNIQUE,
      FOREIGN KEY (paymentMethodId) REFERENCES payment_methods(paymentMethodId)
    );

    CREATE TABLE IF NOT EXISTS ratings (
      ratingId INTEGER PRIMARY KEY AUTOINCREMENT,
      tripId INTEGER NOT NULL,
      customerId INTEGER NOT NULL,
      driverId INTEGER NOT NULL,
      score INTEGER NOT NULL,
      comment TEXT,
      ratingTime DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed Payment Methods
  const pmCount = db.get('SELECT COUNT(*) as cnt FROM payment_methods').cnt;
  if (pmCount === 0) {
    db.run('INSERT INTO payment_methods (paymentMethodId, methodName) VALUES (?, ?)', [1, 'Cash (Tiền mặt)']);
    db.run('INSERT INTO payment_methods (paymentMethodId, methodName) VALUES (?, ?)', [2, 'Electronic Payment (Thanh toán điện tử)']);
  }

  // Seed sample transaction for 5001
  const pCount = db.get('SELECT COUNT(*) as cnt FROM payments').cnt;
  if (pCount === 0) {
    db.run(
      `INSERT INTO payments (paymentId, tripId, paymentMethodId, amount, paymentStatus, transactionCode)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [901, 5001, 2, 45000.0, 'Success', 'TXN-901-20261027']
    );
    db.run(
      `INSERT INTO ratings (tripId, customerId, driverId, score, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [5001, 1, 88, 5, 'Tài xế lái xe cẩn thận, phục vụ chu đáo!']
    );
  }

  return db;
}

module.exports = { initPaymentDb };
