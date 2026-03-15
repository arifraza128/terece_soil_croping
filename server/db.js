const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'farm.db');

const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new sqlite3.Database(DB_PATH, err => {
  if (err) {
    console.error('DB connection error:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
  initSchema();
});

db.run('PRAGMA foreign_keys = ON');
db.run('PRAGMA journal_mode = WAL');

function initSchema() {
  const schemaPath = path.join(__dirname, 'db', 'schema.sql');
  if (!fs.existsSync(schemaPath)) return;

  const schema = fs.readFileSync(schemaPath, 'utf8');
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(Boolean);

  statements.forEach(stmt => {
    db.run(stmt + ';', err => {
      if (err && !err.message.includes('already exists')) {
        console.error('Schema init error:', err.message);
      }
    });
  });
}

module.exports = db;
