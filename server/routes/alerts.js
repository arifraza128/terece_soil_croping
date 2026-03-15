const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/:farmId', auth, (req, res) => {
  const { farmId } = req.params;
  db.all(
    `SELECT * FROM alerts WHERE farm_id = ? ORDER BY created_at DESC LIMIT 50`,
    [farmId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

router.get('/:farmId/unread', auth, (req, res) => {
  const { farmId } = req.params;
  db.get(
    `SELECT COUNT(*) as count FROM alerts WHERE farm_id = ? AND is_read = 0`,
    [farmId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    }
  );
});

router.post('/', auth, (req, res) => {
  const { farm_id, alert_type, message, severity } = req.body;
  if (!farm_id || !alert_type || !message) {
    return res.status(400).json({ error: 'farm_id, alert_type, message required' });
  }

  db.run(
    `INSERT INTO alerts (farm_id, alert_type, message, severity) VALUES (?, ?, ?, ?)`,
    [farm_id, alert_type, message, severity || 'medium'],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Alert created' });
    }
  );
});

router.patch('/:id/read', auth, (req, res) => {
  db.run(`UPDATE alerts SET is_read = 1 WHERE id = ?`, [req.params.id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Alert marked as read' });
  });
});

router.patch('/farm/:farmId/read-all', auth, (req, res) => {
  db.run(`UPDATE alerts SET is_read = 1 WHERE farm_id = ?`, [req.params.farmId], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'All alerts marked as read' });
  });
});

router.delete('/:id', auth, (req, res) => {
  db.run(`DELETE FROM alerts WHERE id = ?`, [req.params.id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Alert deleted' });
  });
});

module.exports = router;
