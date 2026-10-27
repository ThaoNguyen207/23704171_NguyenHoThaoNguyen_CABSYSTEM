const { PaymentController } = require('./payment.controller');

function setupPaymentRoutes(app, db) {
  const controller = new PaymentController(db);

  app.get('/health', (req, res) => {
    res.json({ service: 'payment-service', status: 'UP', port: 3004 });
  });

  // OpenAPI specs & requirements
  app.post('/api/trips/:tripId/payments', controller.processPayment);
  app.get('/api/trips/:tripId/payments', controller.getTripPayment);
  app.post('/api/trips/:tripId/ratings', controller.createRating);
  app.get('/api/drivers/:driverId/ratings', controller.getDriverRatings);
  app.get('/api/payments/methods', controller.getPaymentMethods);
  app.get('/api/payments', controller.listTransactions);
  app.get('/api/admin/transactions', controller.listTransactions);

  return app;
}

module.exports = { setupPaymentRoutes };
