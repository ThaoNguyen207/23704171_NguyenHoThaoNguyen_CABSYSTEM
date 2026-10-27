const { hashPassword, verifyPassword, signJwt } = require('../../../shared/jwt');
const { sharedBus } = require('../../../shared/event-bus');

// Haversine formula to compute great-circle distance between two GPS points in km
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 1.5; // fallback default 1.5km
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

class DriverController {
  constructor(db) {
    this.db = db;
  }

  updateStatus = (req, res) => {
    const driverId = Number(req.params.driverId);
    const { availabilityStatus } = req.body;

    const allowed = ['READY', 'BUSY', 'OFFLINE'];
    if (!availabilityStatus || !allowed.includes(availabilityStatus)) {
      return res.status(400).json({
        error: 'INVALID_STATUS',
        message: 'Trạng thái không hợp lệ. Phải là một trong: READY, BUSY, OFFLINE'
      });
    }

    const driver = this.db.get('SELECT driverId FROM drivers WHERE driverId = ?', [driverId]);
    if (!driver) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Không tìm thấy tài xế'
      });
    }

    this.db.run(
      'UPDATE drivers SET availabilityStatus = ? WHERE driverId = ?',
      [availabilityStatus, driverId]
    );

    sharedBus.publish('DRIVER_STATUS_CHANGED', {
      driverId,
      availabilityStatus
    });

    return res.status(200).json({
      message: 'Cập nhật trạng thái thành công',
      driverId,
      availabilityStatus
    });
  };

  getVehicles = (req, res) => {
    const driverId = Number(req.params.driverId);
    const vehicles = this.db.query(
      `SELECT v.vehicleId, v.licensePlate, v.brand, v.model, v.vehicleTypeId, vt.typeName, v.status
       FROM vehicles v
       LEFT JOIN vehicle_types vt ON v.vehicleTypeId = vt.vehicleTypeId
       WHERE v.driverId = ?`,
      [driverId]
    );

    return res.status(200).json(vehicles);
  };

  addVehicle = (req, res) => {
    const driverId = Number(req.params.driverId);
    const { vehicleTypeId, licensePlate, brand, model } = req.body;

    if (!vehicleTypeId || !licensePlate) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Vui lòng cung cấp vehicleTypeId và licensePlate'
      });
    }

    const result = this.db.run(
      'INSERT INTO vehicles (driverId, vehicleTypeId, licensePlate, brand, model) VALUES (?, ?, ?, ?, ?)',
      [driverId, vehicleTypeId, licensePlate, brand || 'Toyota', model || 'Toyota Vios']
    );

    return res.status(201).json({
      vehicleId: Number(result.lastInsertRowid),
      driverId,
      licensePlate,
      vehicleTypeId,
      message: 'Thêm phương tiện thành công'
    });
  };

  register = (req, res) => {
    const { fullName, phone, email, password, licensePlate, brand, model, vehicleTypeId } = req.body;

    if (!fullName || !phone || !email || !password || !licensePlate) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Vui lòng cung cấp thông tin tài xế và biển số xe'
      });
    }

    const existing = this.db.get('SELECT driverId FROM drivers WHERE phone = ? OR email = ?', [phone, email]);
    if (existing) {
      return res.status(409).json({
        error: 'DUPLICATE_ENTRY',
        message: 'Số điện thoại hoặc email tài xế đã tồn tại'
      });
    }

    const hashedPassword = hashPassword(password);
    const driverResult = this.db.run(
      'INSERT INTO drivers (fullName, phone, email, password, availabilityStatus) VALUES (?, ?, ?, ?, ?)',
      [fullName, phone, email, hashedPassword, 'READY']
    );
    const driverId = Number(driverResult.lastInsertRowid);

    this.db.run(
      'INSERT INTO vehicles (driverId, vehicleTypeId, licensePlate, brand, model) VALUES (?, ?, ?, ?, ?)',
      [driverId, vehicleTypeId || 2, licensePlate, brand || 'Toyota', model || 'Toyota Vios']
    );

    return res.status(201).json({
      driverId,
      message: 'Đăng ký tài xế thành công'
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

    const driver = this.db.get('SELECT * FROM drivers WHERE phone = ?', [phone]);
    if (!driver || !verifyPassword(password, driver.password)) {
      return res.status(401).json({
        error: 'AUTH_FAILED',
        message: 'Thông tin đăng nhập không chính xác'
      });
    }

    const token = signJwt({
      userId: driver.driverId,
      role: 'DRIVER',
      fullName: driver.fullName
    });

    return res.status(200).json({
      accessToken: token,
      driver: {
        driverId: driver.driverId,
        fullName: driver.fullName,
        phone: driver.phone,
        email: driver.email,
        rating: driver.rating,
        availabilityStatus: driver.availabilityStatus
      }
    });
  };

  getAvailableDrivers = (req, res) => {
    const vehicleTypeId = req.query.vehicleTypeId ? Number(req.query.vehicleTypeId) : null;

    let sql = `
      SELECT DISTINCT d.driverId, d.fullName, d.phone, d.rating, d.totalRatings, d.availabilityStatus,
             d.currentLocationName, d.latitude, d.longitude,
             v.licensePlate, v.brand, v.model, v.vehicleTypeId
      FROM drivers d
      JOIN vehicles v ON d.driverId = v.driverId
      WHERE d.availabilityStatus = 'READY' AND d.status = 'ACTIVE'
    `;
    const params = [];

    if (vehicleTypeId) {
      sql += ' AND v.vehicleTypeId = ?';
      params.push(vehicleTypeId);
    }

    sql += ' ORDER BY d.rating DESC';

    const drivers = this.db.query(sql, params);
    return res.status(200).json(drivers);
  };

  // Smart GPS Nearby Driver Dispatch (Haversine calculation)
  getNearbyDrivers = (req, res) => {
    const lat = req.query.lat ? parseFloat(req.query.lat) : 10.7716;
    const lng = req.query.lng ? parseFloat(req.query.lng) : 106.7044;
    const vehicleTypeId = req.query.vehicleTypeId ? Number(req.query.vehicleTypeId) : null;
    const maxRadius = req.query.radius ? parseFloat(req.query.radius) : 15.0; // default 15km

    let sql = `
      SELECT DISTINCT d.driverId, d.fullName, d.phone, d.rating, d.totalRatings, d.availabilityStatus,
             d.currentLocationName, d.latitude, d.longitude,
             v.licensePlate, v.brand, v.model, v.vehicleTypeId, vt.typeName as vehicleType
      FROM drivers d
      JOIN vehicles v ON d.driverId = v.driverId
      LEFT JOIN vehicle_types vt ON v.vehicleTypeId = vt.vehicleTypeId
      WHERE d.availabilityStatus = 'READY' AND d.status = 'ACTIVE'
    `;
    const params = [];

    if (vehicleTypeId) {
      sql += ' AND v.vehicleTypeId = ?';
      params.push(vehicleTypeId);
    }

    const drivers = this.db.query(sql, params);

    // Calculate real distance for each driver and sort closest first
    const withDistance = drivers.map(d => {
      const distanceKm = calculateDistanceKm(lat, lng, d.latitude, d.longitude);
      const etaMinutes = Math.max(1, Math.round(distanceKm * 2.5)); // estimate ~ 2.5 mins per km in city
      return {
        ...d,
        distanceKm,
        etaMinutes,
        etaText: `${etaMinutes} phút (${distanceKm} km)`
      };
    })
    .filter(d => d.distanceKm <= maxRadius)
    .sort((a, b) => a.distanceKm - b.distanceKm || b.rating - a.rating);

    return res.status(200).json(withDistance);
  };

  // Full fleet for Radar / CMS Map
  getFleet = (req, res) => {
    const fleet = this.db.query(`
      SELECT d.driverId, d.fullName, d.phone, d.rating, d.totalRatings, d.availabilityStatus,
             d.currentLocationName, d.latitude, d.longitude,
             v.licensePlate, v.brand, v.model, v.vehicleTypeId, vt.typeName as vehicleType
      FROM drivers d
      LEFT JOIN vehicles v ON d.driverId = v.driverId
      LEFT JOIN vehicle_types vt ON v.vehicleTypeId = vt.vehicleTypeId
      WHERE d.status = 'ACTIVE'
      ORDER BY d.driverId ASC
    `);
    return res.status(200).json(fleet);
  };

  getVehicleTypes = (req, res) => {
    const types = this.db.query('SELECT * FROM vehicle_types ORDER BY vehicleTypeId ASC');
    return res.status(200).json(types);
  };

  getDriver = (req, res) => {
    const driverId = Number(req.params.driverId);
    const driver = this.db.get(
      'SELECT driverId, fullName, phone, email, rating, totalRatings, availabilityStatus, currentLocationName, latitude, longitude, status, createdAt FROM drivers WHERE driverId = ?',
      [driverId]
    );

    if (!driver) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy tài xế' });
    }

    const vehicles = this.db.query('SELECT * FROM vehicles WHERE driverId = ?', [driverId]);
    return res.status(200).json({ ...driver, vehicles });
  };

  listDrivers = (req, res) => {
    const drivers = this.db.query(`
      SELECT d.driverId, d.fullName, d.phone, d.email, d.rating, d.totalRatings, d.availabilityStatus, d.status,
             d.currentLocationName, d.latitude, d.longitude,
             v.licensePlate, v.brand, v.model, vt.typeName as vehicleType
      FROM drivers d
      LEFT JOIN vehicles v ON d.driverId = v.driverId
      LEFT JOIN vehicle_types vt ON v.vehicleTypeId = vt.vehicleTypeId
      ORDER BY d.driverId ASC
    `);
    return res.status(200).json(drivers);
  };

  updateRating = (req, res) => {
    const driverId = Number(req.params.driverId);
    const { score } = req.body;

    const driver = this.db.get('SELECT rating, totalRatings FROM drivers WHERE driverId = ?', [driverId]);
    if (!driver) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    const total = (driver.totalRatings || 0) + 1;
    const currentScoreSum = (driver.rating || 5.0) * (driver.totalRatings || 0);
    const newRating = Number(((currentScoreSum + score) / total).toFixed(1));

    this.db.run(
      'UPDATE drivers SET rating = ?, totalRatings = ? WHERE driverId = ?',
      [newRating, total, driverId]
    );

    return res.status(200).json({ driverId, rating: newRating, totalRatings: total });
  };
}

module.exports = { DriverController, calculateDistanceKm };
