const { hashPassword, verifyPassword, signJwt } = require('../../../shared/jwt');
const { sharedBus } = require('../../../shared/event-bus');

class CustomerController {
  constructor(db) {
    this.db = db;
  }

  register = (req, res) => {
    const { fullName, phone, email, password } = req.body;

    if (!fullName || !phone || !email || !password) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Vui lòng cung cấp đầy đủ: fullName, phone, email, password'
      });
    }

    // Check if phone or email already exists
    const existing = this.db.get(
      'SELECT customerId FROM customers WHERE phone = ? OR email = ?',
      [phone, email]
    );

    if (existing) {
      return res.status(409).json({
        error: 'DUPLICATE_ENTRY',
        message: 'Số điện thoại hoặc email đã được đăng ký'
      });
    }

    const hashedPassword = hashPassword(password);
    const result = this.db.run(
      'INSERT INTO customers (fullName, phone, email, password) VALUES (?, ?, ?, ?)',
      [fullName, phone, email, hashedPassword]
    );

    const customerId = Number(result.lastInsertRowid);

    sharedBus.publish('CUSTOMER_REGISTERED', {
      customerId,
      fullName,
      phone,
      email
    });

    return res.status(201).json({
      customerId,
      message: 'Đăng ký thành công'
    });
  };

  login = (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Vui lòng nhập số điện thoại và mật khẩu'
      });
    }

    const customer = this.db.get(
      'SELECT * FROM customers WHERE phone = ?',
      [phone]
    );

    if (!customer) {
      return res.status(401).json({
        error: 'AUTH_FAILED',
        message: 'Số điện thoại hoặc mật khẩu không chính xác'
      });
    }

    if (customer.status !== 'ACTIVE') {
      return res.status(403).json({
        error: 'ACCOUNT_INACTIVE',
        message: 'Tài khoản của bạn đã bị khóa'
      });
    }

    const isMatch = verifyPassword(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'AUTH_FAILED',
        message: 'Số điện thoại hoặc mật khẩu không chính xác'
      });
    }

    const token = signJwt({
      userId: customer.customerId,
      role: 'CUSTOMER',
      fullName: customer.fullName,
      phone: customer.phone
    }, 3600);

    return res.status(200).json({
      accessToken: token,
      expiresIn: 3600,
      customer: {
        customerId: customer.customerId,
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email
      }
    });
  };

  getCustomer = (req, res) => {
    const customerId = Number(req.params.customerId);
    const customer = this.db.get(
      'SELECT customerId, fullName, phone, email, status, createdAt FROM customers WHERE customerId = ?',
      [customerId]
    );

    if (!customer) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Không tìm thấy khách hàng'
      });
    }

    return res.status(200).json(customer);
  };

  listCustomers = (req, res) => {
    const customers = this.db.query(
      'SELECT customerId, fullName, phone, email, status, createdAt FROM customers ORDER BY customerId DESC'
    );
    return res.status(200).json(customers);
  };
}

module.exports = { CustomerController };
