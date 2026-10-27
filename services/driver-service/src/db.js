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
      brand TEXT DEFAULT 'Toyota',
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

  // Seed vehicle types
  const vtCount = db.get('SELECT COUNT(*) as cnt FROM vehicle_types').cnt;
  if (vtCount === 0) {
    db.run(
      'INSERT INTO vehicle_types (vehicleTypeId, typeName, description, baseFare, perKmRate) VALUES (?, ?, ?, ?, ?)',
      [1, 'Cab Bike (Xe 2 bánh)', 'Xe máy công nghệ - Di chuyển nhanh, luồn lách phố thị, tiết kiệm chi phí', 12000, 5000]
    );
    db.run(
      'INSERT INTO vehicle_types (vehicleTypeId, typeName, description, baseFare, perKmRate) VALUES (?, ?, ?, ?, ?)',
      [2, 'Cab Car 4-Chỗ', 'Ô tô 4 chỗ tiêu chuẩn - Êm ái, máy lạnh, an toàn, che mưa che nắng', 20000, 12000]
    );
    db.run(
      'INSERT INTO vehicle_types (vehicleTypeId, typeName, description, baseFare, perKmRate) VALUES (?, ?, ?, ?, ?)',
      [3, 'Cab Car 7-Chỗ (Premium)', 'Ô tô 7 chỗ rộng rãi - Không gian thoải mái cho cả gia đình và hành lý lớn', 28000, 16000]
    );
  }

  // Seed fleet of 20 professional drivers
  const dCount = db.get('SELECT COUNT(*) as cnt FROM drivers').cnt;
  if (dCount === 0) {
    const fleet = [
      { id: 88, name: 'Lê Văn Tài', phone: '0988888888', vtype: 2, brand: 'Toyota', model: 'Toyota Vios 2024', plate: '59A-12345', loc: 'Tòa nhà Bitexco, Q.1', lat: 10.7716, lng: 106.7044, rating: 4.9, total: 32 },
      { id: 89, name: 'Phạm Quốc Hùng', phone: '0977777777', vtype: 1, brand: 'Honda', model: 'Honda Air Blade 160', plate: '59S-99999', loc: 'Chợ Bến Thành, Q.1', lat: 10.7721, lng: 106.6983, rating: 4.85, total: 45 },
      { id: 90, name: 'Trần Minh Trí', phone: '0901112233', vtype: 1, brand: 'Honda', model: 'Honda SH 150i', plate: '50S-888.12', loc: 'Landmark 81, Bình Thạnh', lat: 10.7951, lng: 106.7218, rating: 4.95, total: 72 },
      { id: 91, name: 'Nguyễn Hoàng Nam', phone: '0902223344', vtype: 2, brand: 'Hyundai', model: 'Hyundai Accent 2024', plate: '50E-456.78', loc: 'Hồ Con Rùa, Q.3', lat: 10.7828, lng: 106.6961, rating: 4.88, total: 58 },
      { id: 92, name: 'Vũ Đình Trọng', phone: '0903334455', vtype: 3, brand: 'Kia', model: 'Kia Carnival 2024', plate: '50E-789.99', loc: 'Phố đi bộ Nguyễn Huệ, Q.1', lat: 10.7743, lng: 106.7037, rating: 5.0, total: 94 },
      { id: 93, name: 'Đặng Hữu Thắng', phone: '0904445566', vtype: 3, brand: 'Mitsubishi', model: 'Mitsubishi Xpander Cross', plate: '50E-999.01', loc: 'Crescent Mall, Q.7', lat: 10.7294, lng: 106.7190, rating: 4.92, total: 41 },
      { id: 94, name: 'Bùi Thanh Sơn', phone: '0905556677', vtype: 2, brand: 'Honda', model: 'Honda City RS', plate: '50E-333.22', loc: 'Sân bay Tân Sơn Nhất, Tân Bình', lat: 10.8184, lng: 106.6588, rating: 4.82, total: 104 },
      { id: 95, name: 'Mai Xuân Trường', phone: '0906667788', vtype: 1, brand: 'Yamaha', model: 'Yamaha Grande Hybrid', plate: '50S-777.34', loc: 'Vạn Hạnh Mall, Q.10', lat: 10.7713, lng: 106.6698, rating: 4.9, total: 50 },
      { id: 96, name: 'Hoàng Quốc Bảo', phone: '0907778899', vtype: 2, brand: 'Kia', model: 'Kia K3 Premium', plate: '50E-555.66', loc: 'KTX Khu B ĐHQG, Thủ Đức', lat: 10.8804, lng: 106.7820, rating: 4.89, total: 66 },
      { id: 97, name: 'Đỗ Thành Đạt', phone: '0908889900', vtype: 1, brand: 'Honda', model: 'Honda Lead 125', plate: '50S-666.88', loc: 'Bệnh viện Chợ Rẫy, Q.5', lat: 10.7558, lng: 106.6596, rating: 4.78, total: 38 },
      { id: 98, name: 'Lê Hồng Phong', phone: '0911223344', vtype: 2, brand: 'Mazda', model: 'Mazda 3 Luxury', plate: '50E-112.23', loc: 'Nhà thờ Đức Bà, Q.1', lat: 10.7798, lng: 106.6990, rating: 4.93, total: 80 },
      { id: 99, name: 'Phan Tuấn Anh', phone: '0912334455', vtype: 3, brand: 'Toyota', model: 'Toyota Innova Cross', plate: '50E-667.89', loc: 'Khu Thảo Điền, TP. Thủ Đức', lat: 10.8038, lng: 106.7327, rating: 4.96, total: 63 },
      { id: 100, name: 'Cao Viết Dũng', phone: '0913445566', vtype: 1, brand: 'Honda', model: 'Honda Air Blade 125', plate: '50S-443.21', loc: 'Phan Xích Long, Phú Nhuận', lat: 10.7988, lng: 106.6881, rating: 4.86, total: 47 },
      { id: 101, name: 'Tạ Quang Khải', phone: '0914556677', vtype: 2, brand: 'Toyota', model: 'Toyota Vios G', plate: '50E-889.00', loc: 'Ngã Sáu Gò Vấp, Gò Vấp', lat: 10.8285, lng: 106.6802, rating: 4.81, total: 39 },
      { id: 102, name: 'Lương Gia Huy', phone: '0915667788', vtype: 1, brand: 'Honda', model: 'Honda Vario 160', plate: '50S-122.33', loc: 'Bến Vân Đồn, Q.4', lat: 10.7621, lng: 106.7001, rating: 4.89, total: 33 },
      { id: 103, name: 'Trương Công Định', phone: '0916778899', vtype: 2, brand: 'Hyundai', model: 'Hyundai Accent AT', plate: '50E-776.54', loc: 'Chợ Lớn, Q.6', lat: 10.7485, lng: 106.6432, rating: 4.76, total: 22 },
      { id: 104, name: 'Võ Tấn Phát', phone: '0917889900', vtype: 3, brand: 'Hyundai', model: 'Hyundai Santa Fe', plate: '50E-223.45', loc: 'Vincom Đồng Khởi, Q.1', lat: 10.7780, lng: 106.7020, rating: 4.97, total: 91 },
      { id: 105, name: 'Huỳnh Ngọc Sang', phone: '0918990011', vtype: 1, brand: 'Honda', model: 'Honda Winner X', plate: '50S-991.12', loc: 'Ga Sài Gòn, Q.3', lat: 10.7816, lng: 106.6784, rating: 4.85, total: 51 },
      { id: 106, name: 'Đoàn Minh Quân', phone: '0919001122', vtype: 2, brand: 'Kia', model: 'Kia Sonet Premium', plate: '50E-445.67', loc: 'Aeon Mall Tân Phú, Tân Phú', lat: 10.8005, lng: 106.6183, rating: 4.87, total: 60 },
      { id: 107, name: 'Dương Quốc Việt', phone: '0920112233', vtype: 3, brand: 'Ford', model: 'Ford Everest Titanium', plate: '50E-888.88', loc: 'Bến Bạch Đằng, Q.1', lat: 10.7719, lng: 106.7068, rating: 5.0, total: 115 }
    ];

    const passHash = hashPassword('123456');

    for (const d of fleet) {
      db.run(
        `INSERT INTO drivers (driverId, fullName, phone, email, password, rating, totalRatings, availabilityStatus, status, currentLocationName, latitude, longitude)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'READY', 'ACTIVE', ?, ?, ?)`,
        [d.id, d.name, d.phone, `${d.phone}@cab.vn`, passHash, d.rating, d.total, d.loc, d.lat, d.lng]
      );

      db.run(
        `INSERT INTO vehicles (driverId, vehicleTypeId, licensePlate, brand, model, status)
         VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
        [d.id, d.vtype, d.plate, d.brand, d.model]
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
