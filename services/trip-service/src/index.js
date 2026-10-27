const { createApp } = require('../../../shared/mini-express');
const { createLogger } = require('../../../shared/logger');
const { initTripDb } = require('./db');
const { setupTripRoutes } = require('./routes');

const logger = createLogger('TripService', 'blue');
const PORT = process.env.PORT || 3003;

function startServer(isMemory = false, customPort = PORT) {
  const db = initTripDb(isMemory);
  const app = createApp();

  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  setupTripRoutes(app, db);

  const server = app.listen(customPort, () => {
    logger.info(`Trip Service running on http://localhost:${customPort}`);
  });

  return { server, db, app };
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
