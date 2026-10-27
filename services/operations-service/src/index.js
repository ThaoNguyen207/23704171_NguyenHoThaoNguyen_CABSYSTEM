const { createApp } = require('../../../shared/mini-express');
const { createLogger } = require('../../../shared/logger');
const { initOperationsDb } = require('./db');
const { setupOperationsRoutes } = require('./routes');

const logger = createLogger('OperationsService', 'cyan');
const PORT = process.env.PORT || 3006;

function startServer(isMemory = false, customPort = PORT) {
  const db = initOperationsDb(isMemory);
  const app = createApp();

  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  setupOperationsRoutes(app, db);

  const server = app.listen(customPort, () => {
    logger.info(`Operations Service running on http://localhost:${customPort}`);
  });

  return { server, db, app };
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
