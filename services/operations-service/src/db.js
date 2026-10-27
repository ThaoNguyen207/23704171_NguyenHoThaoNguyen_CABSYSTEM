const { getDatabase } = require('../../../shared/db-helper');
const { hashPassword } = require('../../../shared/jwt');

function initOperationsDb(isMemory = false) {
  const db = getDatabase('operations', isMemory);

  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      roleId INTEGER PRIMARY KEY AUTOINCREMENT,
      roleName TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS employees (
      employeeId INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      roleId INTEGER NOT NULL,
      status TEXT DEFAULT 'ACTIVE',
      FOREIGN KEY (roleId) REFERENCES roles(roleId)
    );
  `);

  // Seed roles
  const rCount = db.get('SELECT COUNT(*) as cnt FROM roles').cnt;
  if (rCount === 0) {
    db.run('INSERT INTO roles (roleId, roleName, description) VALUES (?, ?, ?)', [1, 'Administrator', 'Toàn quyền quản trị hệ thống']);
    db.run('INSERT INTO roles (roleId, roleName, description) VALUES (?, ?, ?)', [2, 'Operations Staff', 'Nhân viên giám sát và điều hành']);
    db.run('INSERT INTO roles (roleId, roleName, description) VALUES (?, ?, ?)', [3, 'Manager', 'Quản lý kinh doanh']);
  }

  // Seed admin employee
  const eCount = db.get('SELECT COUNT(*) as cnt FROM employees').cnt;
  if (eCount === 0) {
    db.run(
      `INSERT INTO employees (employeeId, fullName, phone, email, password, roleId, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [1, 'Nguyễn Quản Trị', '0909999999', 'admin@cab.com', hashPassword('admin123'), 1, 'ACTIVE']
    );
  }

  return db;
}

module.exports = { initOperationsDb };
