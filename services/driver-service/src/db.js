const { getDatabase } = require('../../../shared/db-helper');
const { hashPassword } = require('../../../shared/jwt');

function initDriverDb(isMemory = false) {
  const db = getDatabase('drivers', isMemory);

  db.exec(`
    CREATE TABLE IF NOT EXISTS vehicle_types (
      vehicleTypeId INTEGER PRIMARY KEY AUTOINCREMENT,
      typeName TEXT NOT NULL,
      description TEXT,
      baseFare REAL DEFAULT 20000,
      perKmRate REAL DEFAULT 12000
    );

    CREATE TABLE IF NOT EXISTS drivers (
      driverId INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      rating REAL DEFAULT 5.0,
      totalRatings INTEGER DEFAULT 0,
      availabilityStatus TEXT DEFAULT 'READY', -- READY, BUSY, OFFLINE
      status TEXT DEFAULT 'ACTIVE',
      batteryLevel INTEGER DEFAULT 90, -- Battery percentage for Xanh SM EV fleet
      currentLocationName TEXT DEFAULT 'Quận 1',
      latitude REAL DEFAULT 10.7716,
      longitude REAL DEFAULT 106.7044,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      vehicleId INTEGER PRIMARY KEY AUTOINCREMENT,
      driverId INTEGER NOT NULL,
      vehicleTypeId INTEGER NOT NULL,
      licensePlate TEXT NOT NULL,
      brand TEXT DEFAULT 'VinFast',
      model TEXT,
      status TEXT DEFAULT 'ACTIVE',
      FOREIGN KEY (driverId) REFERENCES drivers(driverId),
      FOREIGN KEY (vehicleTypeId) REFERENCES vehicle_types(vehicleTypeId)
    );

    CREATE TABLE IF NOT EXISTS driver_locations (
      locationId INTEGER PRIMARY KEY AUTOINCREMENT,
      driverId INTEGER NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      recordedTime DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (driverId) REFERENCES drivers(driverId)
    );
  `);

  // Seed vehicle types for Xanh SM
  const vtCount = db.get('SELECT COUNT(*) as cnt FROM vehicle_types').cnt;
  if (vtCount === 0) {
    db.run(
      'INSERT INTO vehicle_types (vehicleTypeId, typeName, description, baseFare, perKmRate) VALUES (?, ?, ?, ?, ?)',
      [1, 'Xanh SM Bike (Xe máy điện VinFast)', 'VinFast Feliz S / Evo 200 - Tiết kiệm, êm ái, bảo vệ môi trường', 12000, 5000]
    );
    db.run(
      'INSERT INTO vehicle_types (vehicleTypeId, typeName, description, baseFare, perKmRate) VALUES (?, ?, ?, ?, ?)',
      [2, 'Xanh SM Taxi (VinFast 4 chỗ)', 'VinFast VF 5 Plus / VF e34 - Rộng rãi, máy lạnh mát rượi, không mùi xăng xe', 20000, 12500]
    );
    db.run(
      'INSERT INTO vehicle_types (vehicleTypeId, typeName, description, baseFare, perKmRate) VALUES (?, ?, ?, ?, ?)',
      [3, 'Xanh SM Luxury (VinFast VF 8 / VF 9)', 'VinFast VF 8 / VF 9 SUV - Sang trọng đẳng cấp, ghế massage, đẳng cấp VIP', 30000, 18000]
    );
  }

  // Seed rich Xanh SM Fleet (20+ drivers)
  const dCount = db.get('SELECT COUNT(*) as cnt FROM drivers').cnt;
  if (dCount === 0) {
    const fleet = [
      { id: 88, name: 'Lê Văn Tài', phone: '0988888888', vtype: 2, model: 'VinFast VF 5 Plus', plate: '59A-12345', loc: 'Q.1 - Bitexco', lat: 10.7716, lng: 106.7044, battery: 92, rating: 4.9, total: 25 },
      { id: 89, name: 'Phạm Quốc Hùng', phone: '0977777777', vtype: 1, model: 'VinFast Evo 200', plate: '59S-99999', loc: 'Q.1 - Chợ Bến Thành', lat: 10.7721, lng: 106.6983, battery: 88, rating: 4.8, total: 40 },
      { id: 90, name: 'Trần Minh Trí', phone: '0901112233', vtype: 1, model: 'VinFast Feliz S', plate: '50S-888.12', loc: 'Bình Thạnh - Landmark 81', lat: 10.7951, lng: 106.7218, battery: 95, rating: 4.95, total: 68 },
      { id: 91, name: 'Nguyễn Hoàng Nam', phone: '0902223344', vtype: 2, model: 'VinFast VF e34', plate: '50E-456.78', loc: 'Q.3 - Hồ Con Rùa', lat: 10.7828, lng: 106.6961, battery: 85, rating: 4.85, total: 52 },
      { id: 92, name: 'Vũ Đình Trọng', phone: '0903334455', vtype: 3, model: 'VinFast VF 8', plate: '50E-789.99', loc: 'Q.1 - Nguyễn Huệ', lat: 10.7743, lng: 106.7037, battery: 98, rating: 5.0, total: 84 },
      { id: 93, name: 'Đặng Hữu Thắng', phone: '0904445566', vtype: 3, model: 'VinFast VF 9', plate: '50E-999.01', loc: 'Q.7 - Crescent Mall', lat: 10.7294, lng: 106.7190, battery: 90, rating: 4.98, total: 39 },
      { id: 94, name: 'Bùi Thanh Sơn', phone: '0905556677', vtype: 2, model: 'VinFast VF 5 Plus', plate: '50E-333.22', loc: 'Tân Bình - Sân bay TSN', lat: 10.8184, lng: 106.6588, battery: 78, rating: 4.82, total: 91 },
      { id: 95, name: 'Mai Xuân Trường', phone: '0906667788', vtype: 1, model: 'VinFast Klara S', plate: '50S-777.34', loc: 'Q.10 - Vạn Hạnh Mall', lat: 10.7713, lng: 106.6698, battery: 83, rating: 4.9, total: 47 },
      { id: 96, name: 'Hoàng Quốc Bảo', phone: '0907778899', vtype: 2, model: 'VinFast VF 5 Plus', plate: '50E-555.66', loc: 'Thủ Đức - ĐHQG', lat: 10.8804, lng: 106.7820, battery: 89, rating: 4.88, total: 61 },
      { id: 97, name: 'Đỗ Thành Đạt', phone: '0908889900', vtype: 1, model: 'VinFast Evo 200', plate: '50S-666.88', loc: 'Q.5 - BV Chợ Rẫy', lat: 10.7558, lng: 106.6596, battery: 75, rating: 4.79, total: 35 },
      { id: 98, name: 'Lê Hồng Phong', phone: '0911223344', vtype: 2, model: 'VinFast VF e34', plate: '50E-112.23', loc: 'Q.1 - Nhà thờ Đức Bà', lat: 10.7798, lng: 106.6990, battery: 91, rating: 4.92, total: 73 },
      { id: 99, name: 'Phan Tuấn Anh', phone: '0912334455', vtype: 3, model: 'VinFast VF 8', plate: '50E-667.89', loc: 'Q.2 - Thảo Điền', lat: 10.8038, lng: 106.7327, battery: 96, rating: 4.97, total: 58 },
      { id: 100, name: 'Cao Viết Dũng', phone: '0913445566', vtype: 1, model: 'VinFast Feliz S', plate: '50S-443.21', loc: 'Phú Nhuận - Phan Xích Long', lat: 10.7988, lng: 106.6881, battery: 86, rating: 4.86, total: 42 },
      { id: 101, name: 'Tạ Quang Khải', phone: '0914556677', vtype: 2, model: 'VinFast VF 5 Plus', plate: '50E-889.00', loc: 'Gò Vấp - Quang Trung', lat: 10.8285, lng: 106.6802, battery: 80, rating: 4.81, total: 33 },
      { id: 102, name: 'Lương Gia Huy', phone: '0915667788', vtype: 1, model: 'VinFast Evo 200', plate: '50S-122.33', loc: 'Q.4 - Bến Vân Đồn', lat: 10.7621, lng: 106.7001, battery: 94, rating: 4.89, total: 29 },
      { id: 103, name: 'Trương Công Định', phone: '0916778899', vtype: 2, model: 'VinFast VF e34', plate: '50E-776.54', loc: 'Q.6 - Hậu Giang', lat: 10.7485, lng: 106.6432, battery: 72, rating: 4.75, total: 19 },
      { id: 104, name: 'Võ Tấn Phát', phone: '0917889900', vtype: 3, model: 'VinFast VF 8', plate: '50E-223.45', loc: 'Q.1 - Vincom Đồng Khởi', lat: 10.7780, lng: 106.7020, battery: 93, rating: 4.96, total: 88 },
      { id: 105, name: 'Huỳnh Ngọc Sang', phone: '0918990011', vtype: 1, model: 'VinFast Feliz S', plate: '50S-991.12', loc: 'Q.3 - Ga Sài Gòn', lat: 10.7816, lng: 106.6784, battery: 87, rating: 4.84, total: 45 },
      { id: 106, name: 'Đoàn Minh Quân', phone: '0919001122', vtype: 2, model: 'VinFast VF 5 Plus', plate: '50E-445.67', loc: 'Tân Phú - Aeon Mall', lat: 10.8005, lng: 106.6183, battery: 88, rating: 4.87, total: 54 },
      { id: 107, name: 'Dương Quốc Việt', phone: '0920112233', vtype: 3, model: 'VinFast VF 9', plate: '50E-888.88', loc: 'Q.1 - Bến Bạch Đằng', lat: 10.7719, lng: 106.7068, battery: 99, rating: 5.0, total: 110 }
    ];

    const passHash = hashPassword('123456');

    for (const d of fleet) {
      db.run(
        `INSERT INTO drivers (driverId, fullName, phone, email, password, rating, totalRatings, availabilityStatus, status, batteryLevel, currentLocationName, latitude, longitude)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'READY', 'ACTIVE', ?, ?, ?, ?)`,
        [d.id, d.name, d.phone, `${d.phone}@xanhsm.vn`, passHash, d.rating, d.total, d.battery, d.loc, d.lat, d.lng]
      );

      db.run(
        `INSERT INTO vehicles (driverId, vehicleTypeId, licensePlate, brand, model, status)
         VALUES (?, ?, ?, 'VinFast', ?, 'ACTIVE')`,
        [d.id, d.vtype, d.plate, d.model]
      );

      db.run(
        `INSERT INTO driver_locations (driverId, latitude, longitude)
         VALUES (?, ?, ?)`,
        [d.id, d.lat, d.lng]
      );
    }
  }

  return db;
}

module.exports = { initDriverDb };
