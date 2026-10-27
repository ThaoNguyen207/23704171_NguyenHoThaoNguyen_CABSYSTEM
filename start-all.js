const { startServer: startCustomer } = require('./services/customer-service/src/index');
const { startServer: startDriver } = require('./services/driver-service/src/index');
const { startServer: startTrip } = require('./services/trip-service/src/index');
const { startServer: startPayment } = require('./services/payment-service/src/index');
const { startServer: startNotification } = require('./services/notification-service/src/index');
const { startServer: startOperations } = require('./services/operations-service/src/index');
const { startGateway } = require('./services/api-gateway/src/server');

console.log('\x1b[1m\x1b[36m=====================================================\x1b[0m');
console.log('\x1b[1m\x1b[36m   CAB SYSTEM - MICROSERVICES ORCHESTRATION          \x1b[0m');
console.log('\x1b[1m\x1b[36m=====================================================\x1b[0m\n');

async function bootstrap() {
  const customer = startCustomer(false, 3001);
  const driver = startDriver(false, 3002);
  const trip = startTrip(false, 3003);
  const payment = startPayment(false, 3004);
  const notification = startNotification(false, 3005);
  const operations = startOperations(false, 3006);
  const gateway = startGateway(3000);

  console.log('\n\x1b[32m✔ All 6 Microservices and API Gateway are now active!\x1b[0m');
  console.log('-----------------------------------------------------');
  console.log('• API Gateway:          http://localhost:3000');
  console.log('• Web Dashboard:        http://localhost:3000/');
  console.log('• OpenAPI Docs:         http://localhost:3000/docs');
  console.log('• Health Check:         http://localhost:3000/health');
  console.log('• Customer Service:     http://localhost:3001');
  console.log('• Driver Service:       http://localhost:3002');
  console.log('• Trip Service:         http://localhost:3003');
  console.log('• Payment Service:      http://localhost:3004');
  console.log('• Notification Service: http://localhost:3005');
  console.log('• Operations Service:   http://localhost:3006');
  console.log('-----------------------------------------------------\n');

  function cleanup() {
    console.log('\nShutting down all microservices...');
    customer.server.close();
    driver.server.close();
    trip.server.close();
    payment.server.close();
    notification.server.close();
    operations.server.close();
    gateway.server.close();
    process.exit(0);
  }

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

if (require.main === module) {
  bootstrap();
}

module.exports = { bootstrap };
