const { createApp } = require('../../../shared/mini-express');
const { createLogger } = require('../../../shared/logger');
const { initCustomerDb } = require('./db');
const { setupCustomerRoutes } = require('./routes');

const logger = createLogger('CustomerService', 'cyan');
const PORT = process.env.PORT || 3001;

function startServer(isMemory = false, customPort = PORT) {
  const db = initCustomerDb(isMemory);
  const app = createApp();

  // Request logger
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  setupCustomerRoutes(app, db);

  const server = app.listen(customPort, () => {
    logger.info(`Customer Service running on http://localhost:${customPort}`);
  });

  return { server, db, app };
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
