const db = require('../db');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('Seeding database...');

  const hash = await bcrypt.hash('demo1234', 10);

  db.run(
    `INSERT OR IGNORE INTO users (name, email, password) VALUES (?, ?, ?)`,
    ['Rajan Kumar', 'demo@farm.com', hash],
    function (err) {
      if (err) return console.error('User seed error:', err.message);
      const userId = this.lastID || 1;
      console.log('Demo user created -> email: demo@farm.com | password: demo1234');
      seedFarm(userId);
    }
  );
}

function seedFarm(userId) {
  db.run(
    `INSERT OR IGNORE INTO farms
       (user_id, farmer_name, farm_name, location, region_type,
        terrace_count, farm_size, soil_type, water_source, preferred_language)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      'Rajan Kumar',
      'Green Hills Farm',
      'Munnar, Kerala',
      'Hilly',
      5,
      2.5,
      'Loamy',
      'Rainwater',
      'en'
    ],
    function (err) {
      if (err) return console.error('Farm seed error:', err.message);
      const farmId = this.lastID || 1;
      console.log('Demo farm created');
      seedCrops(farmId);
      seedReadings(farmId);
      seedAlerts(farmId);
      seedRecommendations(farmId);
      seedPrices();
    }
  );
}

function seedCrops(farmId) {
  const crops = [
    ['Tomato', 'Vegetable', '2024-11-01', 'Flowering', 'Main terrace row 1'],
    ['Spinach', 'Vegetable', '2024-11-15', 'Vegetative', 'Shade section'],
    ['Chilli', 'Vegetable', '2024-10-20', 'Fruiting', 'South-facing terrace'],
    ['Coriander', 'Herb', '2024-12-01', 'Seedling', 'Small pots'],
    ['Beans', 'Legume', '2024-10-10', 'Harvest', 'Row 3']
  ];

  const stmt = db.prepare(
    `INSERT OR IGNORE INTO crops
       (farm_id, crop_name, crop_type, sowing_date, growth_stage, notes)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  crops.forEach(c => stmt.run([farmId, ...c]));
  stmt.finalize();
  console.log('Crops seeded');
}

function seedReadings(farmId) {
  const stmt = db.prepare(
    `INSERT INTO sensor_readings
       (farm_id, soil_moisture, temperature, humidity,
        light_intensity, water_level, source_type, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, 'demo', ?)`
  );

  for (let d = 29; d >= 0; d--) {
    for (let h = 0; h < 3; h++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      date.setHours(7 + h * 6);

      const moisture = Math.round(30 + Math.random() * 45);
      const temp = +(18 + Math.random() * 18).toFixed(1);
      const humidity = Math.round(45 + Math.random() * 40);
      const light = Math.round(100 + Math.random() * 850);
      const water = Math.round(25 + Math.random() * 65);

      stmt.run([farmId, moisture, temp, humidity, light, water, date.toISOString()]);
    }
  }
  stmt.finalize();
  console.log('Sensor readings seeded (90 records)');
}

function seedAlerts(farmId) {
  const alerts = [
    ['low_moisture', 'Soil moisture dropped below 30%. Irrigation recommended.', 'high', 0],
    ['high_temperature', 'Temperature exceeded 35C. Monitor crop stress.', 'medium', 0],
    ['low_water', 'Water tank level at 18%. Refill soon.', 'high', 0],
    ['crop_stress', 'High temperature and low humidity detected together.', 'medium', 0],
    ['low_moisture', 'Moisture recovered after irrigation.', 'low', 1],
    ['sensor_offline', 'Device STF-001 was offline for 2 hours.', 'low', 1]
  ];

  const stmt = db.prepare(
    `INSERT OR IGNORE INTO alerts (farm_id, alert_type, message, severity, is_read)
     VALUES (?, ?, ?, ?, ?)`
  );
  alerts.forEach(a => stmt.run([farmId, ...a]));
  stmt.finalize();
  console.log('Alerts seeded');
}

function seedRecommendations(farmId) {
  const recs = [
    ['irrigation', 'Soil moisture is below optimal. Consider light irrigation within 24 hours.', 'medium'],
    ['fertilizer', 'Tomato is in flowering stage. Apply potassium-rich fertilizer to improve fruit set.', 'medium'],
    ['crop_stress', 'High temperature with low humidity detected. Risk of crop heat stress.', 'high'],
    ['status', 'Water levels are adequate. No immediate action required for irrigation.', 'low']
  ];

  const stmt = db.prepare(
    `INSERT OR IGNORE INTO recommendations (farm_id, type, message, priority)
     VALUES (?, ?, ?, ?)`
  );
  recs.forEach(r => stmt.run([farmId, ...r]));
  stmt.finalize();
  console.log('Recommendations seeded');
}

function seedPrices() {
  const crops = [
    { name: 'Tomato', base: 25, volatility: 6 },
    { name: 'Onion', base: 35, volatility: 10 },
    { name: 'Potato', base: 20, volatility: 4 },
    { name: 'Spinach', base: 18, volatility: 3 },
    { name: 'Chilli', base: 60, volatility: 15 },
    { name: 'Coriander', base: 40, volatility: 8 },
    { name: 'Beans', base: 45, volatility: 9 },
    { name: 'Brinjal', base: 22, volatility: 5 },
    { name: 'Cabbage', base: 15, volatility: 4 },
    { name: 'Carrot', base: 30, volatility: 7 }
  ];

  const markets = ['Munnar Mandi', 'Ernakulam Market', 'Local Market', 'Kozhikode Wholesale'];

  const stmt = db.prepare(
    `INSERT INTO price_data (crop_name, price, market_name, unit, recorded_at)
     VALUES (?, ?, ?, 'kg', ?)`
  );

  crops.forEach(crop => {
    let price = crop.base;
    for (let d = 29; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);

      const change = (Math.random() - 0.48) * crop.volatility;
      price = Math.max(5, +(price + change).toFixed(2));

      const market = markets[Math.floor(Math.random() * markets.length)];
      stmt.run([crop.name, price, market, date.toISOString()]);
    }
  });

  stmt.finalize();
  console.log('Price data seeded (300 records across 10 crops)');
}

seed().catch(console.error);
