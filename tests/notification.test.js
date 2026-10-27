const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { startServer } = require('../services/notification-service/src/index');

describe('Notification Service Tests (UC24, FR37-FR42)', () => {
  let appInstance;
  const PORT = 3105;
  const baseUrl = `http://localhost:${PORT}`;

  before(() => {
    appInstance = startServer(true, PORT);
  });

  after(() => {
    appInstance.server.close();
  });

  it('UC24: Should get notifications list', async () => {
    const res = await fetch(`${baseUrl}/api/notifications`);
    assert.strictEqual(res.status, 200);
    const notifications = await res.json();
    assert.ok(Array.isArray(notifications));
    assert.ok(notifications.length > 0);
  });

  it('Should create and filter notifications by recipientId', async () => {
    const postRes = await fetch(`${baseUrl}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tripId: 5001,
        recipientType: 'CUSTOMER',
        recipientId: 99,
        notificationType: 'TRIP_UPDATE',
        message: 'Tài xế đã nhận chuyến của bạn.'
      })
    });

    assert.strictEqual(postRes.status, 201);
    const created = await postRes.json();
    assert.strictEqual(created.recipientId, 99);

    const getRes = await fetch(`${baseUrl}/api/notifications?recipientId=99`);
    const list = await getRes.json();
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].message, 'Tài xế đã nhận chuyến của bạn.');
  });
});
