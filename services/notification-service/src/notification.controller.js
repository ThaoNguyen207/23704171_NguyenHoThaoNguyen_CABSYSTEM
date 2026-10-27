class NotificationController {
  constructor(db) {
    this.db = db;
  }

  getNotifications = (req, res) => {
    const { recipientId, recipientType } = req.query;

    let sql = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];

    if (recipientId) {
      sql += ' AND recipientId = ?';
      params.push(Number(recipientId));
    }
    if (recipientType) {
      sql += ' AND recipientType = ?';
      params.push(recipientType.toUpperCase());
    }

    sql += ' ORDER BY notificationId DESC';

    const notifications = this.db.query(sql, params);
    return res.status(200).json(notifications);
  };

  createNotification = (req, res) => {
    const { tripId, recipientType, recipientId, notificationType, message } = req.body;

    if (!message || !recipientType) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Vui lòng cung cấp message và recipientType'
      });
    }

    const result = this.db.run(
      `INSERT INTO notifications (tripId, recipientType, recipientId, notificationType, message)
       VALUES (?, ?, ?, ?, ?)`,
      [tripId ? Number(tripId) : null, recipientType.toUpperCase(), recipientId ? Number(recipientId) : null, notificationType || 'SYSTEM', message]
    );

    const notificationId = Number(result.lastInsertRowid);
    const created = this.db.get('SELECT * FROM notifications WHERE notificationId = ?', [notificationId]);

    return res.status(201).json(created);
  };

  markAsRead = (req, res) => {
    const notificationId = Number(req.params.id);
    this.db.run('UPDATE notifications SET status = ? WHERE notificationId = ?', ['READ', notificationId]);
    return res.status(200).json({ message: 'Đã đánh dấu đã đọc', notificationId });
  };
}

module.exports = { NotificationController };
