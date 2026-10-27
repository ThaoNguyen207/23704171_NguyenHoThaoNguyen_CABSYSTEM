const { createApp } = require('../../../shared/mini-express');
const { CustomerController } = require('./customer.controller');

function setupCustomerRoutes(app, db) {
  const controller = new CustomerController(db);

  app.get('/health', (req, res) => {
    res.json({ service: 'customer-service', status: 'UP', port: 3001 });
  });

  app.post('/api/customers/register', controller.register);
  app.post('/api/customers/login', controller.login);
  app.get('/api/customers/:customerId', controller.getCustomer);
  app.get('/api/customers', controller.listCustomers);

  return app;
}

module.exports = { setupCustomerRoutes };
