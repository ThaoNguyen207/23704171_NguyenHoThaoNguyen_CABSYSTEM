const crypto = require('node:crypto');
const { sharedBus } = require('../../../shared/event-bus');

const getTripServiceUrl = () => process.env.TRIP_SERVICE_URL || 'http://localhost:3003';
const getDriverServiceUrl = () => process.env.DRIVER_SERVICE_URL || 'http://localhost:3002';

class PaymentController {
  constructor(db) {
    this.db = db;
  }

  processPayment = async (req, res) => {
    const tripId = Number(req.params.tripId);
    const { paymentMethodId, amount, transactionCode } = req.body;

    if (!paymentMethodId || !amount) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Vui lòng cung cấp paymentMethodId và amount'
      });
    }

    // Check if trip is completed and fetch trip info
    let trip = null;
    try {
      const resp = await fetch(`${getTripServiceUrl()}/api/trips/${tripId}`);
      if (resp.ok) {
        trip = await resp.json();
      }
    } catch {}

    // BRL12: Chỉ tính cước & cho phép thanh toán khi chuyến đã hoàn thành
    if (trip && trip.tripStatusId && trip.tripStatusId !== 6) {
      return res.status(400).json({
        error: 'TRIP_NOT_COMPLETED',
        message: 'Chỉ có thể thanh toán khi chuyến xe đã ở trạng thái Hoàn thành (Completed) (BRL12)'
      });
    }

    // Check if already paid
    const existing = this.db.get(
      'SELECT paymentId, paymentStatus FROM payments WHERE tripId = ? AND paymentStatus = ?',
      [tripId, 'Success']
    );

    if (existing) {
      return res.status(400).json({
        error: 'ALREADY_PAID',
        message: 'Chuyến xe này đã được thanh toán',
        paymentId: existing.paymentId
      });
    }

    const txnCode = transactionCode || `TXN-${tripId}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const result = this.db.run(
      `INSERT INTO payments (tripId, paymentMethodId, amount, paymentStatus, transactionCode)
       VALUES (?, ?, ?, 'Success', ?)`,
      [tripId, Number(paymentMethodId), Number(amount), txnCode]
    );

    const paymentId = Number(result.lastInsertRowid);

    // Publish event
    sharedBus.publish('PAYMENT_COMPLETED', {
      paymentId,
      tripId,
      amount: Number(amount),
      paymentMethodId: Number(paymentMethodId),
      transactionCode: txnCode,
      driverId: trip ? trip.driverId : null,
      customerId: trip ? trip.customerId : null
    });

    return res.status(200).json({
      paymentId,
      tripId,
      amount: Number(amount),
      paymentStatus: 'Success',
      transactionCode: txnCode,
      message: 'Thanh toán thành công (AC06.3)'
    });
  };

  getTripPayment = (req, res) => {
    const tripId = Number(req.params.tripId);
    const payments = this.db.query(
      `SELECT p.*, pm.methodName
       FROM payments p
       LEFT JOIN payment_methods pm ON p.paymentMethodId = pm.paymentMethodId
       WHERE p.tripId = ?`,
      [tripId]
    );

    if (!payments || payments.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Chưa có thông tin thanh toán cho chuyến này' });
    }

    return res.status(200).json(payments[0]);
  };

  createRating = async (req, res) => {
    const tripId = Number(req.params.tripId);
    const { customerId, driverId, score, comment } = req.body;

    const numScore = Number(score);
    if (!numScore || numScore < 1 || numScore > 5) {
      return res.status(400).json({
        error: 'INVALID_SCORE',
        message: 'Điểm đánh giá phải từ 1 đến 5 sao (AC07.5)'
      });
    }

    let did = driverId ? Number(driverId) : null;
    let cid = customerId ? Number(customerId) : 1;

    let trip = null;
    try {
      const resp = await fetch(`${getTripServiceUrl()}/api/trips/${tripId}`);
      if (resp.ok) {
        trip = await resp.json();
      }
    } catch {}

    // BRL14: Chỉ đánh giá sau khi chuyến hoàn thành
    if (trip && trip.tripStatusId && trip.tripStatusId !== 6) {
      return res.status(400).json({
        error: 'TRIP_NOT_COMPLETED',
        message: 'Chỉ có thể đánh giá tài xế sau khi chuyến xe đã hoàn thành (BRL14)'
      });
    }

    if (!did && trip) {
      did = trip.driverId;
      cid = trip.customerId || cid;
    }

    if (!did) {
      did = 88; // fallback mock
    }

    const result = this.db.run(
      `INSERT INTO ratings (tripId, customerId, driverId, score, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [tripId, cid, did, numScore, comment || '']
    );

    const ratingId = Number(result.lastInsertRowid);

    // Inform Driver Service to update driver's rating
    try {
      await fetch(`${getDriverServiceUrl()}/api/drivers/${did}/rating`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: numScore })
      });
    } catch {}

    sharedBus.publish('RATING_SUBMITTED', {
      ratingId,
      tripId,
      driverId: did,
      customerId: cid,
      score: numScore,
      comment
    });

    return res.status(201).json({
      ratingId,
      tripId,
      score: numScore,
      comment,
      message: 'Cảm ơn bạn đã đánh giá chuyến đi!'
    });
  };

  getDriverRatings = (req, res) => {
    const driverId = Number(req.params.driverId);
    const ratings = this.db.query(
      `SELECT * FROM ratings WHERE driverId = ? ORDER BY ratingId DESC`,
      [driverId]
    );
    return res.status(200).json(ratings);
  };

  getPaymentMethods = (req, res) => {
    const methods = this.db.query('SELECT * FROM payment_methods');
    return res.status(200).json(methods);
  };

  listTransactions = (req, res) => {
    const transactions = this.db.query(`
      SELECT p.paymentId as transactionId, p.tripId, p.amount, p.paymentStatus as status,
             p.paymentTime, p.transactionCode, pm.methodName
      FROM payments p
      LEFT JOIN payment_methods pm ON p.paymentMethodId = pm.paymentMethodId
      ORDER BY p.paymentId DESC
    `);
    return res.status(200).json(transactions);
  };
}

module.exports = { PaymentController };
