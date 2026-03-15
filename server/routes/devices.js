const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const crypto = require('crypto');

router.get('/:farmId', auth, (req, res) => {
  db.all(`SELECT * FROM devices WHERE farm_id = ?`, [req.params.farmId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', auth, (req, res) => {
  const { farm_id, device_name, device_type } = req.body;
  if (!farm_id || !device_name) return res.status(400).json({ error: 'farm_id and device_name required' });

  const token = crypto.randomBytes(16).toString('hex');

  db.run(
    `INSERT INTO devices (farm_id, device_name, device_type, token) VALUES (?, ?, ?, ?)`,
    [farm_id, device_name, device_type || 'ESP32', token],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, token, message: 'Device registered' });
    }
  );
});

router.patch('/:id/status', auth, (req, res) => {
  const { status } = req.body;
  db.run(
    `UPDATE devices SET status = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?`,
    [status, req.params.id],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Status updated' });
    }
  );
});

router.delete('/:id', auth, (req, res) => {
  db.run(`DELETE FROM devices WHERE id = ?`, [req.params.id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Device deleted' });
  });
});

module.exports = router;
