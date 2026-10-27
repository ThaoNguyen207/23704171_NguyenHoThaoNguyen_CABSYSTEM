const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { startServer } = require('../services/trip-service/src/index');

describe('Trip Service Tests (UC04, UC13, UC14, UC15)', () => {
  let appInstance;
  const PORT = 3103;
  const baseUrl = `http://localhost:${PORT}`;
  let createdTripId;

  before(() => {
    appInstance = startServer(true, PORT);
  });

  after(() => {
    appInstance.server.close();
  });

  it('UC04: Should create a new trip with Searching status (AC01.6)', async () => {
    const res = await fetch(`${baseUrl}/api/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 1,
        pickupLocation: 'Bến Thành, Quận 1',
        destination: 'Landmark 81, Bình Thạnh',
        vehicleTypeId: 2,
        distanceKm: 6.0
      })
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.ok(body.tripId);
    assert.strictEqual(body.status, 'Searching');
    assert.ok(body.estimatedFare > 0);
    createdTripId = body.tripId;
  });

  it('UC04: Should validate missing pickup or destination (EX01)', async () => {
    const res = await fetch(`${baseUrl}/api/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 1,
        vehicleTypeId: 2
      })
    });

    assert.strictEqual(res.status, 400);
  });

  it('UC13: Should allow driver to accept trip (AC03.4)', async () => {
    const res = await fetch(`${baseUrl}/api/trips/${createdTripId}/driver-response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driverId: 88,
        action: 'ACCEPT'
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'DriverAccepted');
    assert.strictEqual(body.driverId, 88);
  });

  it('UC15: Should progress trip status to InProgress and Completed (BRL11)', async () => {
    // 3: DriverArrived
    let res = await fetch(`${baseUrl}/api/trips/${createdTripId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripStatusId: 3 })
    });
    assert.strictEqual(res.status, 200);

    // 4: PassengerPickedUp
    res = await fetch(`${baseUrl}/api/trips/${createdTripId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripStatusId: 4 })
    });
    assert.strictEqual(res.status, 200);

    // 5: InProgress
    res = await fetch(`${baseUrl}/api/trips/${createdTripId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripStatusId: 5 })
    });
    assert.strictEqual(res.status, 200);

    // 6: Completed
    res = await fetch(`${baseUrl}/api/trips/${createdTripId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripStatusId: 6 })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'Completed');
  });
});
