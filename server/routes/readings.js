const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { checkAndCreateAlerts } = require('../utils/alertEngine');

router.get('/:farmId', auth, (req, res) => {
  const { farmId } = req.params;
  const { limit = 20 } = req.query;

  db.all(
    `SELECT * FROM sensor_readings WHERE farm_id = ? ORDER BY timestamp DESC LIMIT ?`,
    [farmId, Number(limit)],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

router.get('/:farmId/latest', auth, (req, res) => {
  const { farmId } = req.params;
  db.get(
    `SELECT * FROM sensor_readings WHERE farm_id = ? ORDER BY timestamp DESC LIMIT 1`,
    [farmId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row || {});
    }
  );
});

router.post('/', auth, (req, res) => {
  const {
    farm_id,
    soil_moisture,
    temperature,
    humidity,
    light_intensity,
    water_level,
    source_type
  } = req.body;

  if (!farm_id) return res.status(400).json({ error: 'farm_id is required' });

  db.run(
    `INSERT INTO sensor_readings
      (farm_id, soil_moisture, temperature, humidity, light_intensity, water_level, source_type)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [farm_id, soil_moisture, temperature, humidity, light_intensity, water_level, source_type || 'manual'],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      checkAndCreateAlerts(farm_id, { soil_moisture, temperature, humidity, water_level });
      res.json({ id: this.lastID, message: 'Reading saved' });
    }
  );
});

router.post('/demo/:farmId', auth, (req, res) => {
  const { farmId } = req.params;

  const demo = {
    soil_moisture: Math.floor(Math.random() * 60) + 20,
    temperature: Math.floor(Math.random() * 20) + 18,
    humidity: Math.floor(Math.random() * 40) + 40,
    light_intensity: Math.floor(Math.random() * 800) + 100,
    water_level: Math.floor(Math.random() * 50) + 30
  };

  db.run(
    `INSERT INTO sensor_readings
      (farm_id, soil_moisture, temperature, humidity, light_intensity, water_level, source_type)
     VALUES (?, ?, ?, ?, ?, ?, 'demo')`,
    [farmId, demo.soil_moisture, demo.temperature, demo.humidity, demo.light_intensity, demo.water_level],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      checkAndCreateAlerts(farmId, demo);
      res.json({ id: this.lastID, ...demo, message: 'Demo reading generated' });
    }
  );
});

router.post('/device/:deviceToken', (req, res) => {
  const { deviceToken } = req.params;

  db.get(`SELECT * FROM devices WHERE token = ?`, [deviceToken], (err, device) => {
    if (err || !device) return res.status(401).json({ error: 'Invalid device token' });

    const { soil_moisture, temperature, humidity, light_intensity, water_level } = req.body;

    db.run(
      `INSERT INTO sensor_readings
        (farm_id, soil_moisture, temperature, humidity, light_intensity, water_level, source_type)
       VALUES (?, ?, ?, ?, ?, ?, 'device')`,
      [device.farm_id, soil_moisture, temperature, humidity, light_intensity, water_level],
      function (insertErr) {
        if (insertErr) return res.status(500).json({ error: insertErr.message });
        checkAndCreateAlerts(device.farm_id, { soil_moisture, temperature, humidity, water_level });
        db.run(
          `UPDATE devices SET last_seen = CURRENT_TIMESTAMP, status = 'active' WHERE id = ?`,
          [device.id]
        );
        res.json({ success: true, id: this.lastID });
      }
    );
  });
});

module.exports = router;
