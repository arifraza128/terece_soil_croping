const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { generateRecommendations } = require('../utils/recommendationEngine');

router.get('/:farmId', auth, (req, res) => {
  const { farmId } = req.params;
  db.all(
    `SELECT * FROM recommendations WHERE farm_id = ? ORDER BY created_at DESC LIMIT 20`,
    [farmId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

router.post('/generate/:farmId', auth, (req, res) => {
  const { farmId } = req.params;

  db.get(
    `SELECT * FROM sensor_readings WHERE farm_id = ? ORDER BY timestamp DESC LIMIT 1`,
    [farmId],
    (err, reading) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!reading) return res.json({ recommendations: [], message: 'No sensor data found' });

      db.get(`SELECT * FROM crops WHERE farm_id = ? AND status = 'active' LIMIT 1`, [farmId], (cropErr, crop) => {
        if (cropErr) return res.status(500).json({ error: cropErr.message });

        const recs = generateRecommendations(reading, crop);

        db.run(`DELETE FROM recommendations WHERE farm_id = ?`, [farmId], () => {
          const stmt = db.prepare(
            `INSERT INTO recommendations (farm_id, type, message, priority) VALUES (?, ?, ?, ?)`
          );
          recs.forEach(r => stmt.run([farmId, r.type, r.message, r.priority]));
          stmt.finalize();

          res.json({ recommendations: recs });
        });
      });
    }
  );
});

module.exports = router;
