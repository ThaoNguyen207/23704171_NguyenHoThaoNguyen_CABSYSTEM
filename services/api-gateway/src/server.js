const path = require('node:path');
const fs = require('node:fs');
const { createApp } = require('../../../shared/mini-express');
const { createLogger } = require('../../../shared/logger');
const { createProxy } = require('./proxy');

const logger = createLogger('APIGateway', 'bright');
const PORT = process.env.PORT || 3000;

const SERVICES = {
  customer: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3001',
  driver: process.env.DRIVER_SERVICE_URL || 'http://localhost:3002',
  trip: process.env.TRIP_SERVICE_URL || 'http://localhost:3003',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
  operations: process.env.OPERATIONS_SERVICE_URL || 'http://localhost:3006'
};

function createGateway() {
  const app = createApp();

  const publicDir = path.join(__dirname, 'public');
  const apiDocDir = path.join(__dirname, '..', '..', '..', 'API document');

  // Request logging
  app.use((req, res, next) => {
    logger.info(`[Incoming] ${req.method} ${req.path}`);
    next();
  });

  // Health check aggregating all microservices
  app.get('/health', async (req, res) => {
    const healthReport = {
      gateway: 'UP',
      timestamp: new Date().toISOString(),
      services: {}
    };

    const checks = Object.entries(SERVICES).map(async ([name, url]) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1200);
        const r = await fetch(`${url}/health`, { signal: controller.signal });
        clearTimeout(timeout);
        healthReport.services[name] = r.ok ? 'UP' : 'DOWN';
      } catch {
        healthReport.services[name] = 'DOWN';
      }
    });

    await Promise.all(checks);
    const allUp = Object.values(healthReport.services).every(status => status === 'UP');
    res.status(allUp ? 200 : 207).json(healthReport);
  });

  // Serve OpenAPI specifications for Swagger
  app.get('/specs/:specFile', (req, res) => {
    const filePath = path.join(apiDocDir, req.params.specFile);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath, 'text/yaml; charset=utf-8');
    } else {
      res.status(404).json({ error: 'Spec file not found' });
    }
  });

  // Static web routes
  app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });

  app.get('/docs', (req, res) => {
    res.sendFile(path.join(publicDir, 'docs.html'));
  });

  app.get('/app.js', (req, res) => {
    res.sendFile(path.join(publicDir, 'app.js'), 'application/javascript; charset=utf-8');
  });

  // Proxy routing to microservices
  const customerProxy = createProxy(SERVICES.customer);
  const driverProxy = createProxy(SERVICES.driver);
  const tripProxy = createProxy(SERVICES.trip);
  const paymentProxy = createProxy(SERVICES.payment);
  const notificationProxy = createProxy(SERVICES.notification);
  const operationsProxy = createProxy(SERVICES.operations);

  // Route proxying to microservices
  app.use('/api/customers', customerProxy);
  app.use('/api/drivers', driverProxy);

  // Trips routing: payments & ratings sub-routes go to Payment Service, others go to Trip Service
  app.use('/api/trips', (req, res) => {
    if (req.path.includes('/payments') || req.path.includes('/ratings')) {
      return paymentProxy(req, res);
    }
    return tripProxy(req, res);
  });

  app.use('/api/payments', paymentProxy);
  app.use('/api/notifications', notificationProxy);
  app.use('/api/admin', operationsProxy);

  return app;
}

function startGateway(port = PORT) {
  const app = createGateway();
  const server = app.listen(port, () => {
    logger.info(`CAB System API Gateway running at http://localhost:${port}`);
    logger.info(`Web Dashboard: http://localhost:${port}/`);
    logger.info(`API Documentation: http://localhost:${port}/docs`);
  });
  return { server, app };
}

if (require.main === module) {
  startGateway();
}

module.exports = { createGateway, startGateway };
