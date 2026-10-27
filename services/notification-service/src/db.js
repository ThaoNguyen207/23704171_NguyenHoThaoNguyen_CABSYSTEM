const { getDatabase } = require('../../../shared/db-helper');

function initNotificationDb(isMemory = false) {
  const db = getDatabase('notifications', isMemory);

  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      notificationId INTEGER PRIMARY KEY AUTOINCREMENT,
      tripId INTEGER,
      recipientType TEXT NOT NULL, -- CUSTOMER, DRIVER, ADMIN
      recipientId INTEGER,
      notificationType TEXT DEFAULT 'TRIP_UPDATE',
      message TEXT NOT NULL,
      sentTime DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'SENT' -- SENT, DELIVERED, READ
    );
  `);

  // Seed sample notification from OpenAPI example
  const count = db.get('SELECT COUNT(*) as cnt FROM notifications').cnt;
  if (count === 0) {
    db.run(
      `INSERT INTO notifications (notificationId, tripId, recipientType, recipientId, notificationType, message, sentTime, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [332, 5001, 'CUSTOMER', 1, 'TRIP_UPDATE', 'Chuyến xe của bạn đã hoàn thành.', '2026-09-03T15:00:00Z', 'READ']
    );
    db.run(
      `INSERT INTO notifications (notificationId, tripId, recipientType, recipientId, notificationType, message, sentTime, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [333, 5001, 'DRIVER', 88, 'PAYMENT', 'Bạn đã nhận được thanh toán 45.000 VNĐ cho chuyến xe #5001.', '2026-09-03T15:01:00Z', 'DELIVERED']
    );
  }

  return db;
}

module.exports = { initNotificationDb };
