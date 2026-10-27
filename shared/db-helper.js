const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

function getDatabase(dbName, isMemory = false) {
  if (isMemory) {
    return createDbWrapper(new DatabaseSync(':memory:'));
  }

  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, `${dbName}.db`);
  const db = new DatabaseSync(dbPath);
  return createDbWrapper(db);
}

function createDbWrapper(db) {
  return {
    raw: db,
    exec(sql) {
      return db.exec(sql);
    },
    query(sql, params = []) {
      const stmt = db.prepare(sql);
      return stmt.all(...params);
    },
    get(sql, params = []) {
      const stmt = db.prepare(sql);
      return stmt.get(...params);
    },
    run(sql, params = []) {
      const stmt = db.prepare(sql);
      return stmt.run(...params);
    },
    close() {
      try {
        db.close();
      } catch {}
    }
  };
}

module.exports = { getDatabase };
