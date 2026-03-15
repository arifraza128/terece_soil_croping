PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL UNIQUE,
  password   TEXT    NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farms (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farmer_name        TEXT,
  farm_name          TEXT,
  location           TEXT,
  region_type        TEXT    DEFAULT 'Hilly',
  terrace_count      INTEGER DEFAULT 0,
  farm_size          REAL    DEFAULT 0,
  soil_type          TEXT    DEFAULT 'Loamy',
  water_source       TEXT    DEFAULT 'Rainwater',
  preferred_language TEXT    DEFAULT 'en',
  created_at         DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crops (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id      INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  crop_name    TEXT    NOT NULL,
  crop_type    TEXT    DEFAULT 'Vegetable',
  sowing_date  DATE,
  growth_stage TEXT    DEFAULT 'Seedling',
  status       TEXT    DEFAULT 'active',
  notes        TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS devices (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id     INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  device_name TEXT    NOT NULL,
  device_type TEXT    DEFAULT 'ESP32',
  token       TEXT    NOT NULL UNIQUE,
  status      TEXT    DEFAULT 'active',
  last_seen   DATETIME,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensor_readings (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id         INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  soil_moisture   REAL,
  temperature     REAL,
  humidity        REAL,
  light_intensity REAL,
  water_level     REAL,
  source_type     TEXT    DEFAULT 'manual',
  timestamp       DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id    INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  alert_type TEXT    NOT NULL,
  message    TEXT    NOT NULL,
  severity   TEXT    DEFAULT 'medium',
  is_read    INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id    INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  type       TEXT,
  message    TEXT    NOT NULL,
  priority   TEXT    DEFAULT 'medium',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_data (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  crop_name   TEXT    NOT NULL,
  price       REAL    NOT NULL,
  market_name TEXT    DEFAULT 'Local Market',
  unit        TEXT    DEFAULT 'kg',
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_predictions (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  crop_name         TEXT    NOT NULL,
  current_price     REAL,
  prediction_1day   REAL,
  prediction_1week  REAL,
  prediction_1month REAL,
  trend             TEXT    DEFAULT 'stable',
  generated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crop_scans (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id    INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  crop_name  TEXT,
  image_url  TEXT,
  result     TEXT,
  confidence INTEGER,
  advice     TEXT,
  scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
