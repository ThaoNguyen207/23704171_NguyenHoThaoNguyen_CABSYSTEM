const { OperationsController } = require('./operations.controller');

function setupOperationsRoutes(app, db) {
  const controller = new OperationsController(db);

  app.get('/health', (req, res) => {
    res.json({ service: 'operations-service', status: 'UP', port: 3006 });
  });

  // OpenAPI specs & requirements
  app.post('/api/admin/login', controller.login);
  app.get('/api/admin/trips', controller.getTrips);
  app.get('/api/admin/transactions', controller.getTransactions);
  app.get('/api/admin/overview', controller.getOverview);

  return app;
}

module.exports = { setupOperationsRoutes };
