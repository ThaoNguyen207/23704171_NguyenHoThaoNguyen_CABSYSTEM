const { createApp } = require('../../../shared/mini-express');
const { createLogger } = require('../../../shared/logger');
const { initDriverDb } = require('./db');
const { setupDriverRoutes } = require('./routes');
const { sharedBus } = require('../../../shared/event-bus');

const logger = createLogger('DriverService', 'yellow');
const PORT = process.env.PORT || 3002;

function startServer(isMemory = false, customPort = PORT) {
  const db = initDriverDb(isMemory);
  const app = createApp();

  // Listen for events to update driver availability status
  sharedBus.subscribe('DRIVER_ASSIGNED', (data) => {
    if (data.driverId) {
      db.run("UPDATE drivers SET availabilityStatus = 'BUSY' WHERE driverId = ?", [data.driverId]);
      logger.info(`Driver ${data.driverId} set to BUSY due to trip assignment.`);
    }
  });

  sharedBus.subscribe('TRIP_CANCELLED', (data) => {
    if (data.driverId) {
      db.run("UPDATE drivers SET availabilityStatus = 'READY' WHERE driverId = ?", [data.driverId]);
      logger.info(`Driver ${data.driverId} set back to READY due to trip cancellation.`);
    }
  });

  sharedBus.subscribe('PAYMENT_COMPLETED', (data) => {
    if (data.driverId) {
      db.run("UPDATE drivers SET availabilityStatus = 'READY' WHERE driverId = ?", [data.driverId]);
      logger.info(`Driver ${data.driverId} set back to READY after trip completion & payment.`);
    }
  });

  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  setupDriverRoutes(app, db);

  const server = app.listen(customPort, () => {
    logger.info(`Driver Service running on http://localhost:${customPort}`);
  });

  return { server, db, app };
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
