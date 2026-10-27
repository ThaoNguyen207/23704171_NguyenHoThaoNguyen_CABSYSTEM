const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { startServer } = require('../services/operations-service/src/index');

describe('Operations Service Tests (UC28, UC30)', () => {
  let appInstance;
  const PORT = 3106;
  const baseUrl = `http://localhost:${PORT}`;

  before(() => {
    appInstance = startServer(true, PORT);
  });

  after(() => {
    appInstance.server.close();
  });

  it('Should login admin successfully', async () => {
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@cab.com',
        password: 'admin123'
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.accessToken);
    assert.strictEqual(body.employee.fullName, 'Nguyễn Quản Trị');
  });

  it('UC28: Should return trips for operations CMS (AC08.5)', async () => {
    const res = await fetch(`${baseUrl}/api/admin/trips`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(typeof body.total === 'number');
    assert.ok(Array.isArray(body.data));
  });

  it('UC30: Should return transactions reconciliation data', async () => {
    const res = await fetch(`${baseUrl}/api/admin/transactions`);
    assert.strictEqual(res.status, 200);
    const list = await res.json();
    assert.ok(Array.isArray(list));
  });
});
