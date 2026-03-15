const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { analyzeCropImage } = require('../utils/cropScan');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `scan_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    cb(null, allowed.test(file.mimetype));
  }
});

router.get('/:farmId', auth, (req, res) => {
  db.all(
    `SELECT * FROM crop_scans WHERE farm_id = ? ORDER BY scanned_at DESC LIMIT 20`,
    [req.params.farmId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

router.post('/analyze', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  const { farm_id, crop_name } = req.body;
  if (!farm_id) return res.status(400).json({ error: 'farm_id required' });

  const imageUrl = `/uploads/${req.file.filename}`;
  const result = analyzeCropImage(req.file.filename);

  db.run(
    `INSERT INTO crop_scans (farm_id, crop_name, image_url, result, confidence, advice)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [farm_id, crop_name || 'Unknown', imageUrl, result.result, result.confidence, result.advice],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, imageUrl, ...result });
    }
  );
});

module.exports = router;
