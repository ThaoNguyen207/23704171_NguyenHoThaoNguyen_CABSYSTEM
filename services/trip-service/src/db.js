const { getDatabase } = require('../../../shared/db-helper');

function initTripDb(isMemory = false) {
  const db = getDatabase('trips', isMemory);

  db.exec(`
    CREATE TABLE IF NOT EXISTS trip_statuses (
      tripStatusId INTEGER PRIMARY KEY,
      statusName TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS trips (
      tripId INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId INTEGER NOT NULL,
      driverId INTEGER,
      vehicleTypeId INTEGER NOT NULL,
      pickupLocation TEXT NOT NULL,
      destination TEXT NOT NULL,
      requestTime DATETIME DEFAULT CURRENT_TIMESTAMP,
      startTime DATETIME,
      endTime DATETIME,
      tripStatusId INTEGER DEFAULT 1,
      fareAmount REAL,
      cancelReason TEXT,
      FOREIGN KEY (tripStatusId) REFERENCES trip_statuses(tripStatusId)
    );

    CREATE TABLE IF NOT EXISTS driver_assignments (
      assignmentId INTEGER PRIMARY KEY AUTOINCREMENT,
      tripId INTEGER NOT NULL,
      driverId INTEGER NOT NULL,
      assignedTime DATETIME DEFAULT CURRENT_TIMESTAMP,
      responseTime DATETIME,
      assignmentStatus TEXT DEFAULT 'Pending', -- Pending, Accepted, Rejected, Timeout
      rejectReason TEXT,
      FOREIGN KEY (tripId) REFERENCES trips(tripId)
    );

    CREATE TABLE IF NOT EXISTS fares (
      fareId INTEGER PRIMARY KEY AUTOINCREMENT,
      tripId INTEGER NOT NULL,
      vehicleTypeId INTEGER NOT NULL,
      baseFare REAL NOT NULL,
      distance REAL NOT NULL,
      fareAmount REAL NOT NULL,
      createdTime DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tripId) REFERENCES trips(tripId)
    );
  `);

  // Seed Trip Statuses (per SRS E06)
  const count = db.get('SELECT COUNT(*) as cnt FROM trip_statuses').cnt;
  if (count === 0) {
    const statuses = [
      [1, 'Searching', 'Đang tìm tài xế'],
      [2, 'DriverAccepted', 'Tài xế đã nhận'],
      [3, 'DriverArrived', 'Tài xế đã đến'],
      [4, 'PassengerPickedUp', 'Đã đón khách'],
      [5, 'InProgress', 'Đang di chuyển'],
      [6, 'Completed', 'Hoàn thành'],
      [7, 'Cancelled', 'Đã hủy'],
      [8, 'NoDriver', 'Không tìm được tài xế']
    ];

    for (const [id, name, desc] of statuses) {
      db.run('INSERT INTO trip_statuses (tripStatusId, statusName, description) VALUES (?, ?, ?)', [id, name, desc]);
    }
  }

  // Seed sample completed trip for initial testing
  const tripCount = db.get('SELECT COUNT(*) as cnt FROM trips').cnt;
  if (tripCount === 0) {
    db.run(
      `INSERT INTO trips (tripId, customerId, driverId, vehicleTypeId, pickupLocation, destination, requestTime, startTime, endTime, tripStatusId, fareAmount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [5001, 1, 88, 2, '123 Lê Lợi, Quận 1', '456 Nguyễn Huệ, Quận 1', '2026-10-27 19:00:00', '2026-10-27 19:10:00', '2026-10-27 19:35:00', 6, 45000.0]
    );
    db.run(
      `INSERT INTO fares (tripId, vehicleTypeId, baseFare, distance, fareAmount)
       VALUES (?, ?, ?, ?, ?)`,
      [5001, 2, 25000.0, 3.8, 45000.0]
    );
    db.run(
      `INSERT INTO driver_assignments (tripId, driverId, assignedTime, responseTime, assignmentStatus)
       VALUES (?, ?, ?, ?, ?)`,
      [5001, 88, '2026-10-27 19:01:00', '2026-10-27 19:02:00', 'Accepted']
    );
  }

  return db;
}

module.exports = { initTripDb };
