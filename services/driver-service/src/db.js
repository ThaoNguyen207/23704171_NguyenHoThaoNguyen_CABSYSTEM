const { getDatabase } = require('../../../shared/db-helper');
const { hashPassword } = require('../../../shared/jwt');

function initDriverDb(isMemory = false) {
  const db = getDatabase('drivers', isMemory);

  db.exec(`
    CREATE TABLE IF NOT EXISTS vehicle_types (
      vehicleTypeId INTEGER PRIMARY KEY AUTOINCREMENT,
      typeName TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS drivers (
      driverId INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      rating REAL DEFAULT 5.0,
      totalRatings INTEGER DEFAULT 0,
      availabilityStatus TEXT DEFAULT 'OFFLINE', -- READY, BUSY, OFFLINE
      status TEXT DEFAULT 'ACTIVE',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      vehicleId INTEGER PRIMARY KEY AUTOINCREMENT,
      driverId INTEGER NOT NULL,
      vehicleTypeId INTEGER NOT NULL,
      licensePlate TEXT NOT NULL,
      brand TEXT,
      model TEXT,
      status TEXT DEFAULT 'ACTIVE',
      FOREIGN KEY (driverId) REFERENCES drivers(driverId),
      FOREIGN KEY (vehicleTypeId) REFERENCES vehicle_types(vehicleTypeId)
    );
  `);

  // Seed vehicle types
  const vtCount = db.get('SELECT COUNT(*) as cnt FROM vehicle_types').cnt;
  if (vtCount === 0) {
    db.run('INSERT INTO vehicle_types (vehicleTypeId, typeName, description) VALUES (?, ?, ?)', [1, 'Xe 2 bánh (Motorbike)', 'Xe máy tiêu chuẩn 1 khách']);
    db.run('INSERT INTO vehicle_types (vehicleTypeId, typeName, description) VALUES (?, ?, ?)', [2, 'Xe 4 bánh (Car 4-seat)', 'Ô tô 4 chỗ tiêu chuẩn']);
    db.run('INSERT INTO vehicle_types (vehicleTypeId, typeName, description) VALUES (?, ?, ?)', [3, 'Xe 7 bánh (Car 7-seat)', 'Ô tô 7 chỗ rộng rãi']);
  }

  // Seed drivers
  const dCount = db.get('SELECT COUNT(*) as cnt FROM drivers').cnt;
  if (dCount === 0) {
    db.run(
      `INSERT INTO drivers (driverId, fullName, phone, email, password, rating, totalRatings, availabilityStatus, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [88, 'Lê Văn Tài', '0988888888', 'levantai@driver.cab.com', hashPassword('123456'), 4.9, 25, 'READY', 'ACTIVE']
    );
    db.run(
      `INSERT INTO vehicles (vehicleId, driverId, vehicleTypeId, licensePlate, brand, model, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [101, 88, 2, '59A-12345', 'Toyota', 'Vios 2024', 'ACTIVE']
    );

    db.run(
      `INSERT INTO drivers (driverId, fullName, phone, email, password, rating, totalRatings, availabilityStatus, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [89, 'Phạm Quốc Hùng', '0977777777', 'phamhung@driver.cab.com', hashPassword('123456'), 4.8, 40, 'READY', 'ACTIVE']
    );
    db.run(
      `INSERT INTO vehicles (vehicleId, driverId, vehicleTypeId, licensePlate, brand, model, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [102, 89, 1, '59S-99999', 'Honda', 'Air Blade 160', 'ACTIVE']
    );
  }

  return db;
}

module.exports = { initDriverDb };
