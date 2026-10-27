const { TripController } = require('./trip.controller');

function setupTripRoutes(app, db) {
  const controller = new TripController(db);

  app.get('/health', (req, res) => {
    res.json({ service: 'trip-service', status: 'UP', port: 3003 });
  });

  // Dynamic route estimation (distance & fare preview)
  app.post('/api/trips/estimate', controller.estimateRoute);

  // OpenAPI specs & requirements
  app.post('/api/trips', controller.createTrip);
  app.post('/api/trips/:tripId/driver-response', controller.driverResponse);
  app.patch('/api/trips/:tripId/status', controller.updateStatus);
  app.post('/api/trips/:tripId/cancel', controller.cancelTrip);
  app.get('/api/trips/:tripId', controller.getTrip);
  app.get('/api/trips', controller.listTrips);

  return app;
}

module.exports = { setupTripRoutes };
