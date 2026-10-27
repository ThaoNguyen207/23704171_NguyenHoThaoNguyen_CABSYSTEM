const { DriverController } = require('./driver.controller');

function setupDriverRoutes(app, db) {
  const controller = new DriverController(db);

  app.get('/health', (req, res) => {
    res.json({ service: 'driver-service', status: 'UP', port: 3002 });
  });

  // Specs & required endpoints
  app.patch('/api/drivers/:driverId/status', controller.updateStatus);
  app.get('/api/drivers/:driverId/vehicles', controller.getVehicles);
  app.post('/api/drivers/:driverId/vehicles', controller.addVehicle);
  app.post('/api/drivers/register', controller.register);
  app.post('/api/drivers/login', controller.login);
  app.get('/api/drivers/available', controller.getAvailableDrivers);
  app.get('/api/drivers/vehicle-types', controller.getVehicleTypes);
  app.get('/api/drivers/:driverId', controller.getDriver);
  app.get('/api/drivers', controller.listDrivers);
  app.patch('/api/drivers/:driverId/rating', controller.updateRating);

  return app;
}

module.exports = { setupDriverRoutes };
