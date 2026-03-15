const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/:farmId', auth, (req, res) => {
  db.all(
    `SELECT * FROM crops WHERE farm_id = ? ORDER BY created_at DESC`,
    [req.params.farmId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

router.post('/', auth, (req, res) => {
  const { farm_id, crop_name, crop_type, sowing_date, growth_stage, notes } = req.body;
  if (!farm_id || !crop_name) return res.status(400).json({ error: 'farm_id and crop_name required' });

  db.run(
    `INSERT INTO crops (farm_id, crop_name, crop_type, sowing_date, growth_stage, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [farm_id, crop_name, crop_type || 'Vegetable', sowing_date, growth_stage || 'Seedling', notes],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Crop added' });
    }
  );
});

router.put('/:id', auth, (req, res) => {
  const { crop_name, crop_type, sowing_date, growth_stage, notes, status } = req.body;
  db.run(
    `UPDATE crops
     SET crop_name = ?, crop_type = ?, sowing_date = ?, growth_stage = ?, notes = ?, status = ?
     WHERE id = ?`,
    [crop_name, crop_type, sowing_date, growth_stage, notes, status || 'active', req.params.id],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Crop updated' });
    }
  );
});

router.delete('/:id', auth, (req, res) => {
  db.run('DELETE FROM crops WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Crop deleted' });
  });
});

module.exports = router;
