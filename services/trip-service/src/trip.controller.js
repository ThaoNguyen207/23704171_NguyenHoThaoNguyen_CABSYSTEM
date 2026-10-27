const { calculateFare } = require('./fare.calculator');
const { sharedBus } = require('../../../shared/event-bus');

class TripController {
  constructor(db) {
    this.db = db;
  }

  createTrip = async (req, res) => {
    const { customerId, pickupLocation, destination, vehicleTypeId, distanceKm } = req.body;

    // Validation (BRL02, EX01, EX02)
    if (!pickupLocation || !destination || !vehicleTypeId) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Vui lòng cung cấp đầy đủ: pickupLocation, destination, vehicleTypeId (AC01.2)'
      });
    }

    const cid = customerId ? Number(customerId) : 1;
    const vTypeId = Number(vehicleTypeId);
    const estDistance = distanceKm ? Number(distanceKm) : 5.0;

    const fareCalc = calculateFare(vTypeId, estDistance);

    // Insert Trip with status Searching (1)
    const tripResult = this.db.run(
      `INSERT INTO trips (customerId, vehicleTypeId, pickupLocation, destination, tripStatusId, fareAmount)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cid, vTypeId, pickupLocation, destination, 1, fareCalc.totalFare]
    );

    const tripId = Number(tripResult.lastInsertRowid);

    // Save Fare estimate
    this.db.run(
      `INSERT INTO fares (tripId, vehicleTypeId, baseFare, distance, fareAmount)
       VALUES (?, ?, ?, ?, ?)`,
      [tripId, vTypeId, fareCalc.baseFare, fareCalc.distanceKm, fareCalc.totalFare]
    );

    // Try to find available driver via Driver Service REST API or local bus
    let candidateDriver = null;
    try {
      const response = await fetch(`http://localhost:3002/api/drivers/available?vehicleTypeId=${vTypeId}`);
      if (response.ok) {
        const drivers = await response.json();
        if (drivers && drivers.length > 0) {
          candidateDriver = drivers[0]; // Highest rated available driver
        }
      }
    } catch {
      // Driver service might be local or in test mode; fallback to mock driver 88
      candidateDriver = { driverId: 88, fullName: 'Lê Văn Tài', rating: 4.9 };
    }

    if (candidateDriver) {
      // Create pending driver assignment
      this.db.run(
        `INSERT INTO driver_assignments (tripId, driverId, assignmentStatus)
         VALUES (?, ?, 'Pending')`,
        [tripId, candidateDriver.driverId]
      );
    }

    // Publish event
    sharedBus.publish('TRIP_CREATED', {
      tripId,
      customerId: cid,
      vehicleTypeId: vTypeId,
      pickupLocation,
      destination,
      fareAmount: fareCalc.totalFare,
      candidateDriver
    });

    return res.status(201).json({
      tripId,
      status: 'Searching',
      message: 'Yêu cầu đặt chuyến đã được tiếp nhận',
      estimatedFare: fareCalc.totalFare,
      candidateDriver
    });
  };

  driverResponse = async (req, res) => {
    const tripId = Number(req.params.tripId);
    const { action, rejectReason, driverId } = req.body;

    if (!action || !['ACCEPT', 'REJECT'].includes(action)) {
      return res.status(400).json({
        error: 'INVALID_ACTION',
        message: 'Action phải là ACCEPT hoặc REJECT (UC13, UC14)'
      });
    }

    const trip = this.db.get('SELECT * FROM trips WHERE tripId = ?', [tripId]);
    if (!trip) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy chuyến xe' });
    }

    const did = driverId ? Number(driverId) : (trip.driverId || 88);

    if (action === 'ACCEPT') {
      // Update trip
      this.db.run(
        `UPDATE trips SET driverId = ?, tripStatusId = 2 WHERE tripId = ?`,
        [did, tripId]
      );

      // Update assignment
      this.db.run(
        `UPDATE driver_assignments
         SET assignmentStatus = 'Accepted', responseTime = CURRENT_TIMESTAMP
         WHERE tripId = ? AND driverId = ?`,
        [tripId, did]
      );

      // Publish events
      sharedBus.publish('DRIVER_ACCEPTED', { tripId, driverId: did, customerId: trip.customerId });
      sharedBus.publish('DRIVER_ASSIGNED', { tripId, driverId: did });

      return res.status(200).json({
        tripId,
        status: 'DriverAccepted',
        driverId: did,
        message: 'Tài xế đã nhận chuyến thành công'
      });
    } else {
      // REJECT
      this.db.run(
        `UPDATE driver_assignments
         SET assignmentStatus = 'Rejected', rejectReason = ?, responseTime = CURRENT_TIMESTAMP
         WHERE tripId = ? AND driverId = ?`,
        [rejectReason || 'Bận', tripId, did]
      );

      // Try to find next available driver
      let nextDriver = null;
      try {
        const response = await fetch(`http://localhost:3002/api/drivers/available?vehicleTypeId=${trip.vehicleTypeId}`);
        if (response.ok) {
          const drivers = await response.json();
          nextDriver = drivers.find(d => d.driverId !== did);
        }
      } catch {}

      if (nextDriver) {
        this.db.run(
          `INSERT INTO driver_assignments (tripId, driverId, assignmentStatus) VALUES (?, ?, 'Pending')`,
          [tripId, nextDriver.driverId]
        );
        return res.status(200).json({
          tripId,
          status: 'Searching',
          message: 'Đang chuyển chuyến sang tài xế tiếp theo',
          nextDriverId: nextDriver.driverId
        });
      } else {
        // No driver left (EX08)
        this.db.run(`UPDATE trips SET tripStatusId = 8 WHERE tripId = ?`, [tripId]);
        sharedBus.publish('NO_DRIVER_FOUND', { tripId, customerId: trip.customerId });

        return res.status(200).json({
          tripId,
          status: 'NoDriver',
          message: 'Không tìm thấy tài xế nào khả dụng'
        });
      }
    }
  };

  updateStatus = (req, res) => {
    const tripId = Number(req.params.tripId);
    const { tripStatusId } = req.body;

    const statusId = Number(tripStatusId);
    if (!statusId || statusId < 1 || statusId > 8) {
      return res.status(400).json({
        error: 'INVALID_STATUS',
        message: 'tripStatusId phải nằm trong khoảng 1-8'
      });
    }

    const trip = this.db.get('SELECT * FROM trips WHERE tripId = ?', [tripId]);
    if (!trip) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy chuyến xe' });
    }

    const statusMap = {
      1: 'Searching',
      2: 'DriverAccepted',
      3: 'DriverArrived',
      4: 'PassengerPickedUp',
      5: 'InProgress',
      6: 'Completed',
      7: 'Cancelled',
      8: 'NoDriver'
    };

    const statusName = statusMap[statusId];

    // Status transition handling
    if (statusId === 5) {
      // InProgress: Start trip
      this.db.run(`UPDATE trips SET tripStatusId = ?, startTime = CURRENT_TIMESTAMP WHERE tripId = ?`, [statusId, tripId]);
    } else if (statusId === 6) {
      // Completed: Finish trip
      this.db.run(`UPDATE trips SET tripStatusId = ?, endTime = CURRENT_TIMESTAMP WHERE tripId = ?`, [statusId, tripId]);
      sharedBus.publish('TRIP_COMPLETED', {
        tripId,
        customerId: trip.customerId,
        driverId: trip.driverId,
        fareAmount: trip.fareAmount
      });
    } else {
      this.db.run(`UPDATE trips SET tripStatusId = ? WHERE tripId = ?`, [statusId, tripId]);
    }

    sharedBus.publish('TRIP_STATUS_UPDATED', {
      tripId,
      customerId: trip.customerId,
      driverId: trip.driverId,
      status: statusName,
      tripStatusId: statusId
    });

    return res.status(200).json({
      tripId,
      status: statusName,
      tripStatusId: statusId,
      message: 'Cập nhật trạng thái thành công'
    });
  };

  cancelTrip = (req, res) => {
    const tripId = Number(req.params.tripId);
    const { cancelledBy, reason } = req.body;

    const trip = this.db.get('SELECT * FROM trips WHERE tripId = ?', [tripId]);
    if (!trip) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy chuyến xe' });
    }

    if (trip.tripStatusId === 6) {
      return res.status(400).json({ error: 'ALREADY_COMPLETED', message: 'Chuyến xe đã hoàn thành, không thể hủy' });
    }

    this.db.run(
      `UPDATE trips SET tripStatusId = 7, cancelReason = ? WHERE tripId = ?`,
      [reason || 'Khách hàng yêu cầu hủy', tripId]
    );

    sharedBus.publish('TRIP_CANCELLED', {
      tripId,
      customerId: trip.customerId,
      driverId: trip.driverId,
      cancelledBy: cancelledBy || 'CUSTOMER',
      reason
    });

    return res.status(200).json({
      tripId,
      status: 'Cancelled',
      tripStatusId: 7,
      message: 'Hủy chuyến thành công'
    });
  };

  getTrip = (req, res) => {
    const tripId = Number(req.params.tripId);
    const trip = this.db.get(`
      SELECT t.*, ts.statusName, ts.description as statusDesc
      FROM trips t
      LEFT JOIN trip_statuses ts ON t.tripStatusId = ts.tripStatusId
      WHERE t.tripId = ?
    `, [tripId]);

    if (!trip) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy chuyến xe' });
    }

    const assignments = this.db.query(
      `SELECT * FROM driver_assignments WHERE tripId = ? ORDER BY assignmentId ASC`,
      [tripId]
    );

    const fare = this.db.get(`SELECT * FROM fares WHERE tripId = ?`, [tripId]);

    return res.status(200).json({ ...trip, assignments, fare });
  };

  listTrips = (req, res) => {
    const { customerId, driverId, statusId } = req.query;

    let sql = `
      SELECT t.*, ts.statusName
      FROM trips t
      LEFT JOIN trip_statuses ts ON t.tripStatusId = ts.tripStatusId
      WHERE 1=1
    `;
    const params = [];

    if (customerId) {
      sql += ' AND t.customerId = ?';
      params.push(Number(customerId));
    }
    if (driverId) {
      sql += ' AND t.driverId = ?';
      params.push(Number(driverId));
    }
    if (statusId) {
      sql += ' AND t.tripStatusId = ?';
      params.push(Number(statusId));
    }

    sql += ' ORDER BY t.tripId DESC';

    const trips = this.db.query(sql, params);
    return res.status(200).json(trips);
  };
}

module.exports = { TripController };
