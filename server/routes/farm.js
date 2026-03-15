const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, (req, res) => {
  db.get('SELECT * FROM farms WHERE user_id = ? LIMIT 1', [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || {});
  });
});

router.post('/', auth, (req, res) => {
  const {
    farmer_name,
    farm_name,
    location,
    region_type,
    terrace_count,
    farm_size,
    soil_type,
    water_source,
    preferred_language
  } = req.body;

  db.get('SELECT id FROM farms WHERE user_id = ? LIMIT 1', [req.user.id], (findErr, existing) => {
    if (findErr) return res.status(500).json({ error: findErr.message });

    if (existing?.id) {
      db.run(
        `UPDATE farms SET
          farmer_name = ?, farm_name = ?, location = ?, region_type = ?, terrace_count = ?,
          farm_size = ?, soil_type = ?, water_source = ?, preferred_language = ?
         WHERE id = ?`,
        [
          farmer_name,
          farm_name,
          location,
          region_type,
          terrace_count,
          farm_size,
          soil_type,
          water_source,
          preferred_language,
          existing.id
        ],
        err => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ id: existing.id, message: 'Farm updated' });
        }
      );
    } else {
      db.run(
        `INSERT INTO farms
          (user_id, farmer_name, farm_name, location, region_type, terrace_count, farm_size, soil_type, water_source, preferred_language)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          farmer_name,
          farm_name,
          location,
          region_type,
          terrace_count,
          farm_size,
          soil_type,
          water_source,
          preferred_language
        ],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ id: this.lastID, message: 'Farm created' });
        }
      );
    }
  });
});

module.exports = router;
