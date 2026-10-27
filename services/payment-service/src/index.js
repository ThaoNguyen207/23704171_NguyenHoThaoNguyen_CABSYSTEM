const { createApp } = require('../../../shared/mini-express');
const { createLogger } = require('../../../shared/logger');
const { initPaymentDb } = require('./db');
const { setupPaymentRoutes } = require('./routes');

const logger = createLogger('PaymentService', 'green');
const PORT = process.env.PORT || 3004;

function startServer(isMemory = false, customPort = PORT) {
  const db = initPaymentDb(isMemory);
  const app = createApp();

  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  setupPaymentRoutes(app, db);

  const server = app.listen(customPort, () => {
    logger.info(`Payment Service running on http://localhost:${customPort}`);
  });

  return { server, db, app };
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
