const { NotificationController } = require('./notification.controller');

function setupNotificationRoutes(app, db) {
  const controller = new NotificationController(db);

  app.get('/health', (req, res) => {
    res.json({ service: 'notification-service', status: 'UP', port: 3005 });
  });

  app.get('/api/notifications', controller.getNotifications);
  app.post('/api/notifications', controller.createNotification);
  app.patch('/api/notifications/:id/read', controller.markAsRead);

  return app;
}

module.exports = { setupNotificationRoutes };
