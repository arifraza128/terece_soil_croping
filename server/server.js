const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsPath));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/farm', require('./routes/farm'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/readings', require('./routes/readings'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/prices', require('./routes/prices'));
app.use('/api/scans', require('./routes/scans'));
app.use('/api/devices', require('./routes/devices'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
