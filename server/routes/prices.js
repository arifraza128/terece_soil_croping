const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { predictPrice } = require('../utils/pricePrediction');

router.get('/', auth, (req, res) => {
  const { crop } = req.query;
  const query = crop
    ? `SELECT * FROM price_data WHERE crop_name = ? ORDER BY recorded_at DESC LIMIT 30`
    : `SELECT * FROM price_data ORDER BY recorded_at DESC LIMIT 60`;
  const params = crop ? [crop] : [];

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/predict/:cropName', auth, (req, res) => {
  const { cropName } = req.params;
  db.all(
    `SELECT price FROM price_data WHERE crop_name = ? ORDER BY recorded_at DESC LIMIT 30`,
    [cropName],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!rows.length) return res.status(404).json({ error: 'No price data found' });

      const prices = rows.map(r => r.price);
      const prediction = predictPrice(prices);

      res.json({
        crop_name: cropName,
        current_price: prices[0],
        prediction_1day: prediction.day1,
        prediction_1week: prediction.week1,
        prediction_1month: prediction.month1,
        trend: prediction.trend
      });
    }
  );
});

router.get('/crops', auth, (req, res) => {
  db.all(`SELECT DISTINCT crop_name FROM price_data ORDER BY crop_name`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => r.crop_name));
  });
});

router.post('/', auth, (req, res) => {
  const { crop_name, price, market_name, unit } = req.body;
  if (!crop_name || !price) return res.status(400).json({ error: 'crop_name and price required' });

  db.run(
    `INSERT INTO price_data (crop_name, price, market_name, unit) VALUES (?, ?, ?, ?)`,
    [crop_name, price, market_name || 'Local Market', unit || 'kg'],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Price added' });
    }
  );
});

module.exports = router;
