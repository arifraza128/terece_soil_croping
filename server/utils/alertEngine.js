const db = require('../db');

function checkAndCreateAlerts(farmId, reading) {
  const alerts = [];

  if (reading.soil_moisture < 30) {
    alerts.push({ type: 'low_moisture', message: 'Soil moisture critically low!', severity: 'high' });
  }
  if (reading.temperature > 38) {
    alerts.push({
      type: 'high_temperature',
      message: `Temperature is dangerously high: ${reading.temperature}C`,
      severity: 'high'
    });
  }
  if (reading.water_level < 20) {
    alerts.push({ type: 'low_water', message: 'Water level critically low. Refill needed.', severity: 'high' });
  }
  if (reading.humidity < 30) {
    alerts.push({
      type: 'low_humidity',
      message: `Very low humidity: ${reading.humidity}%. Crop stress risk.`,
      severity: 'medium'
    });
  }

  alerts.forEach(alert => {
    db.run(
      `INSERT INTO alerts (farm_id, alert_type, message, severity) VALUES (?, ?, ?, ?)`,
      [farmId, alert.type, alert.message, alert.severity]
    );
  });

  return alerts;
}

module.exports = { checkAndCreateAlerts };
