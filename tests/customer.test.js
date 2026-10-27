const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { startServer } = require('../services/customer-service/src/index');

describe('Customer Service Tests (UC01, UC02)', () => {
  let appInstance;
  const PORT = 3101;
  const baseUrl = `http://localhost:${PORT}`;

  before(() => {
    appInstance = startServer(true, PORT); // In-memory database for testing
  });

  after(() => {
    appInstance.server.close();
  });

  it('UC01: Should register a new customer successfully', async () => {
    const res = await fetch(`${baseUrl}/api/customers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Trần Văn Test',
        phone: '0933111222',
        email: 'tranvantest@gmail.com',
        password: 'Password@123'
      })
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.ok(body.customerId);
    assert.strictEqual(body.message, 'Đăng ký thành công');
  });

  it('UC01: Should reject duplicate phone or email (BRL01)', async () => {
    const res = await fetch(`${baseUrl}/api/customers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Trần Văn Trùng',
        phone: '0933111222',
        email: 'tranvantest@gmail.com',
        password: 'Password@123'
      })
    });

    assert.strictEqual(res.status, 409);
    const body = await res.json();
    assert.strictEqual(body.error, 'DUPLICATE_ENTRY');
  });

  it('UC01: Should validate missing mandatory fields', async () => {
    const res = await fetch(`${baseUrl}/api/customers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Thiếu Số Điện Thoại'
      })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error, 'VALIDATION_ERROR');
  });

  it('UC02: Should login customer successfully and return JWT token', async () => {
    const res = await fetch(`${baseUrl}/api/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '0933111222',
        password: 'Password@123'
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.accessToken, 'Token should be returned');
    assert.strictEqual(body.expiresIn, 3600);
    assert.strictEqual(body.customer.fullName, 'Trần Văn Test');
  });

  it('UC02: Should reject invalid password', async () => {
    const res = await fetch(`${baseUrl}/api/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '0933111222',
        password: 'WrongPassword'
      })
    });

    assert.strictEqual(res.status, 401);
  });
});
