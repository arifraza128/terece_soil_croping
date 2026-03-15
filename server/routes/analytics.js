const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/:farmId/daily', auth, (req, res) => {
  const { farmId } = req.params;
  db.all(
    `SELECT
       date(timestamp) as day,
       ROUND(AVG(soil_moisture), 1) as avg_moisture,
       ROUND(AVG(temperature), 1) as avg_temp,
       ROUND(AVG(humidity), 1) as avg_humidity,
       ROUND(AVG(water_level), 1) as avg_water,
       COUNT(*) as reading_count
     FROM sensor_readings
     WHERE farm_id = ? AND timestamp >= date('now', '-7 days')
     GROUP BY day ORDER BY day ASC`,
    [farmId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

router.get('/:farmId/weekly', auth, (req, res) => {
  const { farmId } = req.params;
  db.all(
    `SELECT
       strftime('%Y-W%W', timestamp) as week,
       ROUND(AVG(soil_moisture), 1) as avg_moisture,
       ROUND(AVG(temperature), 1) as avg_temp,
       ROUND(AVG(humidity), 1) as avg_humidity,
       COUNT(*) as reading_count
     FROM sensor_readings
     WHERE farm_id = ? AND timestamp >= date('now', '-28 days')
     GROUP BY week ORDER BY week ASC`,
    [farmId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

router.get('/:farmId/monthly', auth, (req, res) => {
  const { farmId } = req.params;
  db.all(
    `SELECT
       strftime('%Y-%m', timestamp) as month,
       ROUND(AVG(soil_moisture), 1) as avg_moisture,
       ROUND(AVG(temperature), 1) as avg_temp,
       ROUND(AVG(humidity), 1) as avg_humidity,
       COUNT(*) as reading_count
     FROM sensor_readings
     WHERE farm_id = ? AND timestamp >= date('now', '-180 days')
     GROUP BY month ORDER BY month ASC`,
    [farmId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

router.get('/:farmId/summary', auth, (req, res) => {
  const { farmId } = req.params;
  db.get(
    `SELECT
       ROUND(AVG(soil_moisture), 1) as avg_moisture,
       ROUND(AVG(temperature), 1) as avg_temp,
       ROUND(AVG(humidity), 1) as avg_humidity,
       ROUND(AVG(water_level), 1) as avg_water,
       COUNT(*) as total_readings,
       MAX(timestamp) as last_reading
     FROM sensor_readings WHERE farm_id = ?`,
    [farmId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row || {});
    }
  );
});

module.exports = router;
