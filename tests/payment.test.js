const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { startServer } = require('../services/payment-service/src/index');

describe('Payment & Rating Service Tests (UC19, UC20, UC22)', () => {
  let appInstance;
  const PORT = 3104;
  const baseUrl = `http://localhost:${PORT}`;

  before(() => {
    appInstance = startServer(true, PORT);
  });

  after(() => {
    appInstance.server.close();
  });

  it('UC19/UC20: Should process trip payment successfully (AC06.3)', async () => {
    const res = await fetch(`${baseUrl}/api/trips/5002/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentMethodId: 2,
        amount: 69000,
        transactionCode: 'TXN-TEST-1234'
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.paymentId);
    assert.strictEqual(body.paymentStatus, 'Success');
    assert.strictEqual(body.amount, 69000);
    assert.strictEqual(body.transactionCode, 'TXN-TEST-1234');
  });

  it('BRL16: Should reject duplicate payment for the same trip', async () => {
    const res = await fetch(`${baseUrl}/api/trips/5002/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentMethodId: 1,
        amount: 69000
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error, 'ALREADY_PAID');
  });

  it('UC22: Should submit driver rating with score 1-5 (AC07.5)', async () => {
    const res = await fetch(`${baseUrl}/api/trips/5002/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 1,
        driverId: 88,
        score: 5,
        comment: 'Tài xế lái xe rất êm và chuyên nghiệp'
      })
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.ok(body.ratingId);
    assert.strictEqual(body.score, 5);
  });

  it('UC22: Should reject invalid score outside 1-5', async () => {
    const res = await fetch(`${baseUrl}/api/trips/5002/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        score: 10
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error, 'INVALID_SCORE');
  });
});
