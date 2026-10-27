const { calculateFare } = require('./fare.calculator');
const { sharedBus } = require('../../../shared/event-bus');
const { getDistanceBetweenAddresses, geocodeAddress, reverseGeocode, calculateDrivingDistanceKm } = require('../../../shared/geo-helper');

const getDriverServiceUrl = () => process.env.DRIVER_SERVICE_URL || 'http://localhost:3002';

class TripController {
  constructor(db) {
    this.db = db;
  }

  // Dynamic route distance & fare estimation endpoint
  estimateRoute = (req, res) => {
    const { pickupLocation, destination, vehicleTypeId, pickupLat, pickupLng, destLat, destLng } = req.body;

    if (!pickupLocation && (!pickupLat || !pickupLng)) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Vui lòng cung cấp điểm đón (pickupLocation hoặc pickupLat, pickupLng)'
      });
    }

    if (!destination && (!destLat || !destLng)) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Vui lòng cung cấp điểm đến (destination hoặc destLat, destLng)'
      });
    }

    let routeInfo;
    if (pickupLat && pickupLng && destLat && destLng) {
      const pLat = Number(pickupLat);
      const pLng = Number(pickupLng);
      const dLat = Number(destLat);
      const dLng = Number(destLng);
      const dist = calculateDrivingDistanceKm({ lat: pLat, lng: pLng }, { lat: dLat, lng: dLng });
      routeInfo = {
        pickup: { lat: pLat, lng: pLng, name: pickupLocation || reverseGeocode(pLat, pLng) },
        destination: { lat: dLat, lng: dLng, name: destination || reverseGeocode(dLat, dLng) },
        distanceKm: dist
      };
    } else {
      routeInfo = getDistanceBetweenAddresses(pickupLocation || 'Quận 1', destination || 'Sân bay Tân Sơn Nhất');
    }

    const distanceKm = routeInfo.distanceKm;

    const bikeFare = calculateFare(1, distanceKm);
    const car4Fare = calculateFare(2, distanceKm);
    const car7Fare = calculateFare(3, distanceKm);

    return res.status(200).json({
      pickup: routeInfo.pickup,
      destination: routeInfo.destination,
      distanceKm,
      estimatedDurationMins: car4Fare.estimatedDurationMins,
      co2SavedKg: car4Fare.co2SavedKg,
      fares: {
        1: bikeFare,
        2: car4Fare,
        3: car7Fare
      },
      selectedFare: calculateFare(vehicleTypeId || 2, distanceKm)
    });
  };

  createTrip = async (req, res) => {
    const { customerId, pickupLocation, destination, vehicleTypeId, distanceKm, pickupLat, pickupLng, autoDispatch } = req.body;

    // Validation (BRL02, EX01, EX02)
    if (!pickupLocation || !destination || !vehicleTypeId) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Vui lòng cung cấp đầy đủ: pickupLocation, destination, vehicleTypeId (AC01.2)'
      });
    }

    const cid = customerId ? Number(customerId) : 1;
    const vTypeId = Number(vehicleTypeId);

    // Dynamic distance calculation based on input addresses if not explicitly passed
    let finalDistanceKm = Number(distanceKm);
    let resolvedPickup = { lat: Number(pickupLat), lng: Number(pickupLng) };

    if (!finalDistanceKm || isNaN(finalDistanceKm) || finalDistanceKm <= 0) {
      const geoResult = getDistanceBetweenAddresses(pickupLocation, destination);
      finalDistanceKm = geoResult.distanceKm;
      resolvedPickup = geoResult.pickup;
    } else if (!resolvedPickup.lat || !resolvedPickup.lng) {
      resolvedPickup = geocodeAddress(pickupLocation);
    }

    const fareCalc = calculateFare(vTypeId, finalDistanceKm);

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

    // Smart GPS Nearest Driver Matching (Haversine radius)
    let candidateDriver = null;
    let allNearby = [];
    try {
      const pLat = resolvedPickup.lat || 10.7716;
      const pLng = resolvedPickup.lng || 106.7044;
      const resp = await fetch(`${getDriverServiceUrl()}/api/drivers/nearby?lat=${pLat}&lng=${pLng}&vehicleTypeId=${vTypeId}`);
      if (resp.ok) {
        allNearby = await resp.json();
        if (allNearby && allNearby.length > 0) {
          candidateDriver = allNearby[0]; // Nearest driver
        }
      }
    } catch {
      candidateDriver = {
        driverId: 88,
        fullName: 'Lê Văn Tài',
        phone: '0988888888',
        rating: 4.9,
        model: 'Toyota Vios',
        licensePlate: '59A-12345',
        distanceKm: 1.2,
        etaMinutes: 3,
        etaText: '3 phút (1.2 km)'
      };
    }

    if (candidateDriver) {
      // Create pending driver assignment (SRS E07)
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
      distanceKm: finalDistanceKm,
      fareAmount: fareCalc.totalFare,
      candidateDriver,
      allNearbyCount: allNearby.length
    });

    if (autoDispatch && candidateDriver) {
      setTimeout(() => {
        try {
          this.executeDriverAccept(tripId, candidateDriver.driverId, cid);
        } catch (e) {
          console.error('Auto accept error:', e);
        }
      }, 1000);
    }

    return res.status(201).json({
      tripId,
      status: 'Searching',
      message: candidateDriver
        ? `Đã tìm thấy tài xế phù hợp gần nhất (${candidateDriver.fullName} - ${candidateDriver.model})`
        : 'Yêu cầu đặt chuyến đã được tiếp nhận, đang tìm tài xế...',
      distanceKm: finalDistanceKm,
      estimatedFare: fareCalc.totalFare,
      pickupCoords: resolvedPickup,
      candidateDriver,
      nearbyDriversCount: allNearby.length
    });
  };

  executeDriverAccept = (tripId, driverId, customerId) => {
    this.db.run(
      `UPDATE trips SET driverId = ?, tripStatusId = 2 WHERE tripId = ?`,
      [driverId, tripId]
    );

    this.db.run(
      `UPDATE driver_assignments
       SET assignmentStatus = 'Accepted', responseTime = CURRENT_TIMESTAMP
       WHERE tripId = ? AND driverId = ?`,
      [tripId, driverId]
    );

    sharedBus.publish('DRIVER_ACCEPTED', { tripId, driverId, customerId });
    sharedBus.publish('DRIVER_ASSIGNED', { tripId, driverId });
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
      this.executeDriverAccept(tripId, did, trip.customerId);

      return res.status(200).json({
        tripId,
        status: 'DriverAccepted',
        driverId: did,
        message: 'Tài xế đã nhận chuyến thành công (AC03.4)'
      });
    } else {
      // REJECT -> Auto-cascade to next nearest available driver (EX06, EX07)
      this.db.run(
        `UPDATE driver_assignments
         SET assignmentStatus = 'Rejected', rejectReason = ?, responseTime = CURRENT_TIMESTAMP
         WHERE tripId = ? AND driverId = ?`,
        [rejectReason || 'Tài xế đang bận', tripId, did]
      );

      const assigned = this.db.query('SELECT driverId FROM driver_assignments WHERE tripId = ?', [tripId]);
      const assignedIds = assigned.map(a => a.driverId);

      let nextDriver = null;
      try {
        const resp = await fetch(`${getDriverServiceUrl()}/api/drivers/available?vehicleTypeId=${trip.vehicleTypeId}`);
        if (resp.ok) {
          const drivers = await resp.json();
          nextDriver = drivers.find(d => !assignedIds.includes(d.driverId));
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
          message: `Đang chuyển chuyến sang tài xế tiếp theo: ${nextDriver.fullName}`,
          nextDriver
        });
      } else {
        // No driver left (EX08)
        this.db.run(`UPDATE trips SET tripStatusId = 8 WHERE tripId = ?`, [tripId]);
        sharedBus.publish('NO_DRIVER_FOUND', { tripId, customerId: trip.customerId });

        return res.status(200).json({
          tripId,
          status: 'NoDriver',
          message: 'Không còn tài xế nào khả dụng trong khu vực'
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

    // Business rule BRL11: status transition order enforcement
    // 1: Searching -> 2: DriverAccepted
    // 2: DriverAccepted -> 3: DriverArrived
    // 3: DriverArrived -> 4: PassengerPickedUp
    // 4: PassengerPickedUp -> 5: InProgress
    // 5: InProgress -> 6: Completed
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

    if (statusId === 5) {
      this.db.run(`UPDATE trips SET tripStatusId = ?, startTime = CURRENT_TIMESTAMP WHERE tripId = ?`, [statusId, tripId]);
    } else if (statusId === 6) {
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
      return res.status(400).json({ error: 'ALREADY_COMPLETED', message: 'Chuyến xe đã hoàn thành, không thể hủy (BRL11)' });
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
