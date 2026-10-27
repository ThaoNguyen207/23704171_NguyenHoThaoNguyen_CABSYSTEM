const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');

process.env.CUSTOMER_SERVICE_URL = 'http://localhost:3201';
process.env.DRIVER_SERVICE_URL = 'http://localhost:3202';
process.env.TRIP_SERVICE_URL = 'http://localhost:3203';
process.env.PAYMENT_SERVICE_URL = 'http://localhost:3204';
process.env.NOTIFICATION_SERVICE_URL = 'http://localhost:3205';
process.env.OPERATIONS_SERVICE_URL = 'http://localhost:3206';

const { startServer: startCustomer } = require('../services/customer-service/src/index');
const { startServer: startDriver } = require('../services/driver-service/src/index');
const { startServer: startTrip } = require('../services/trip-service/src/index');
const { startServer: startPayment } = require('../services/payment-service/src/index');
const { startServer: startNotification } = require('../services/notification-service/src/index');
const { startServer: startOperations } = require('../services/operations-service/src/index');
const { startGateway } = require('../services/api-gateway/src/server');

describe('Full End-to-End Microservices Integration Workflow (Xanh SM)', () => {
  let instances = [];
  const gatewayUrl = 'http://localhost:3200';

  before(async () => {
    instances.push(startCustomer(true, 3201));
    instances.push(startDriver(true, 3202));
    instances.push(startTrip(true, 3203));
    instances.push(startPayment(true, 3204));
    instances.push(startNotification(true, 3205));
    instances.push(startOperations(true, 3206));
    instances.push(startGateway(3200));

    await new Promise(r => setTimeout(r, 250));
  });

  after(async () => {
    await Promise.all(
      instances.map(inst => new Promise(res => {
        if (inst && inst.server && inst.server.listening) {
          inst.server.close(() => res());
        } else {
          res();
        }
      }))
    );
  });

  let customerToken;
  let customerId;
  let tripId;

  it('Step 1: Health check across all microservices via API Gateway', async () => {
    const res = await fetch(`${gatewayUrl}/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.gateway, 'UP');
    assert.strictEqual(data.services.customer, 'UP');
    assert.strictEqual(data.services.driver, 'UP');
    assert.strictEqual(data.services.trip, 'UP');
    assert.strictEqual(data.services.payment, 'UP');
    assert.strictEqual(data.services.notification, 'UP');
    assert.strictEqual(data.services.operations, 'UP');
  });

  it('Step 2: Customer registers and logs in via API Gateway', async () => {
    const regRes = await fetch(`${gatewayUrl}/api/customers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Nguyễn Hồ Thảo Nguyên',
        phone: '0987654321',
        email: 'thaonguyen@xanhsm.vn',
        password: 'Password@2026'
      })
    });
    assert.strictEqual(regRes.status, 201);
    const regData = await regRes.json();
    customerId = regData.customerId;

    const loginRes = await fetch(`${gatewayUrl}/api/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '0987654321',
        password: 'Password@2026'
      })
    });
    assert.strictEqual(loginRes.status, 200);
    const loginData = await loginRes.json();
    assert.ok(loginData.accessToken);
    customerToken = loginData.accessToken;
  });

  it('Step 3: Driver sets availability status to READY via API Gateway', async () => {
    const res = await fetch(`${gatewayUrl}/api/drivers/88/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ availabilityStatus: 'READY' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.availabilityStatus, 'READY');
  });

  it('Step 4: Customer books trip via API Gateway (Searching status & AI Dispatch)', async () => {
    const res = await fetch(`${gatewayUrl}/api/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        customerId,
        pickupLocation: 'Tòa nhà Bitexco, Q.1',
        destination: 'Sân bay Tân Sơn Nhất',
        vehicleTypeId: 2,
        distanceKm: 8.2,
        pickupLat: 10.7716,
        pickupLng: 106.7044
      })
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.tripId);
    assert.strictEqual(data.status, 'Searching');
    assert.ok(data.estimatedFare > 0);
    assert.ok(data.candidateDriver, 'Should match nearest available VinFast driver');
    tripId = data.tripId;
  });

  it('Step 5: Driver accepts trip (DriverAccepted status)', async () => {
    const res = await fetch(`${gatewayUrl}/api/trips/${tripId}/driver-response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driverId: 88,
        action: 'ACCEPT'
      })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'DriverAccepted');
  });

  it('Step 6: Driver advances trip through states to Completed', async () => {
    // 3: DriverArrived
    await fetch(`${gatewayUrl}/api/trips/${tripId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripStatusId: 3 })
    });

    // 4: PassengerPickedUp
    await fetch(`${gatewayUrl}/api/trips/${tripId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripStatusId: 4 })
    });

    // 5: InProgress
    await fetch(`${gatewayUrl}/api/trips/${tripId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripStatusId: 5 })
    });

    // 6: Completed
    const completeRes = await fetch(`${gatewayUrl}/api/trips/${tripId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripStatusId: 6 })
    });

    assert.strictEqual(completeRes.status, 200);
    const data = await completeRes.json();
    assert.strictEqual(data.status, 'Completed');
  });

  it('Step 7: Customer processes electronic payment for the trip', async () => {
    const res = await fetch(`${gatewayUrl}/api/trips/${tripId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentMethodId: 2,
        amount: 97500
      })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.paymentStatus, 'Success');
    assert.ok(data.transactionCode);
  });

  it('Step 8: Customer submits 5-star rating for driver', async () => {
    const res = await fetch(`${gatewayUrl}/api/trips/${tripId}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        driverId: 88,
        score: 5,
        comment: 'Xe VinFast VF 5 Plus chạy rất êm, tài xế lịch sự chu đáo!'
      })
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.score, 5);
  });

  it('Step 9: Operations CMS observes the live trip and transaction', async () => {
    const tripsRes = await fetch(`${gatewayUrl}/api/admin/trips`);
    assert.strictEqual(tripsRes.status, 200);
    const tripsData = await tripsRes.json();
    assert.ok(tripsData.data.some(t => t.tripId === tripId));

    const txRes = await fetch(`${gatewayUrl}/api/admin/transactions`);
    assert.strictEqual(txRes.status, 200);
    const txData = await txRes.json();
    assert.ok(txData.some(t => t.tripId === tripId));
  });

  it('Step 10: Notification Service generated real-time notifications', async () => {
    const notifRes = await fetch(`${gatewayUrl}/api/notifications?recipientId=${customerId}`);
    assert.strictEqual(notifRes.status, 200);
    const notifs = await notifRes.json();
    assert.ok(notifs.length > 0);
  });
});
