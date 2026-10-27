const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { startServer } = require('../services/driver-service/src/index');

describe('Driver Service Tests (UC11, UC17, Xanh SM Fleet)', () => {
  let appInstance;
  const PORT = 3102;
  const baseUrl = `http://localhost:${PORT}`;

  before(() => {
    appInstance = startServer(true, PORT);
  });

  after(() => {
    appInstance.server.close();
  });

  it('UC11: Should update driver availability status to READY', async () => {
    const res = await fetch(`${baseUrl}/api/drivers/88/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ availabilityStatus: 'READY' })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.availabilityStatus, 'READY');
    assert.strictEqual(body.driverId, 88);
  });

  it('UC11: Should reject invalid status enum', async () => {
    const res = await fetch(`${baseUrl}/api/drivers/88/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ availabilityStatus: 'SLEEPING' })
    });

    assert.strictEqual(res.status, 400);
  });

  it('UC17: Should list driver vehicles with VinFast brand', async () => {
    const res = await fetch(`${baseUrl}/api/drivers/88/vehicles`);
    assert.strictEqual(res.status, 200);
    const vehicles = await res.json();
    assert.ok(Array.isArray(vehicles));
    assert.ok(vehicles.length > 0);
    assert.strictEqual(vehicles[0].licensePlate, '59A-12345');
    assert.strictEqual(vehicles[0].brand, 'VinFast');
  });

  it('Should query available drivers by vehicle type', async () => {
    const res = await fetch(`${baseUrl}/api/drivers/available?vehicleTypeId=2`);
    assert.strictEqual(res.status, 200);
    const drivers = await res.json();
    assert.ok(Array.isArray(drivers));
    assert.ok(drivers.some(d => d.driverId === 88));
  });

  it('Should query nearby drivers using GPS coordinates (Xanh SM AI Dispatch)', async () => {
    const res = await fetch(`${baseUrl}/api/drivers/nearby?lat=10.7716&lng=106.7044&vehicleTypeId=2`);
    assert.strictEqual(res.status, 200);
    const nearby = await res.json();
    assert.ok(Array.isArray(nearby));
    assert.ok(nearby.length > 0);
    // Nearest driver should have low distanceKm
    assert.ok(nearby[0].distanceKm <= 5.0);
    assert.ok(nearby[0].etaMinutes > 0);
  });

  it('Should return full VinFast fleet for live radar (20+ vehicles)', async () => {
    const res = await fetch(`${baseUrl}/api/drivers/fleet`);
    assert.strictEqual(res.status, 200);
    const fleet = await res.json();
    assert.ok(Array.isArray(fleet));
    assert.ok(fleet.length >= 20);
  });
});
