function generateRecommendations(reading, crop) {
  const recs = [];
  const { soil_moisture, temperature, humidity, light_intensity, water_level } = reading;

  if (soil_moisture < 30) {
    recs.push({
      type: 'irrigation',
      message: 'Soil moisture is critically low. Irrigate the field immediately.',
      priority: 'high'
    });
  } else if (soil_moisture < 45) {
    recs.push({
      type: 'irrigation',
      message: 'Soil moisture is below optimal. Consider light irrigation within 24 hours.',
      priority: 'medium'
    });
  } else if (soil_moisture > 80) {
    recs.push({
      type: 'drainage',
      message: 'Soil moisture is very high. Check drainage to prevent root rot.',
      priority: 'medium'
    });
  }

  if (temperature > 35 && humidity < 40) {
    recs.push({
      type: 'crop_stress',
      message: 'High temperature with low humidity detected. Risk of crop heat stress. Consider shading.',
      priority: 'high'
    });
  } else if (temperature > 38) {
    recs.push({
      type: 'heat',
      message: 'Extreme temperature detected. Protect crops from heat damage.',
      priority: 'high'
    });
  } else if (temperature < 10) {
    recs.push({
      type: 'cold',
      message: 'Low temperature detected. Frost risk. Cover sensitive crops at night.',
      priority: 'high'
    });
  }

  if (water_level < 20) {
    recs.push({
      type: 'water',
      message: 'Water tank level critically low. Refill the water source urgently.',
      priority: 'high'
    });
  } else if (water_level < 40) {
    recs.push({
      type: 'water',
      message: 'Water level is getting low. Plan to refill your water source soon.',
      priority: 'medium'
    });
  }

  if (light_intensity < 200) {
    recs.push({
      type: 'light',
      message: 'Low sunlight detected. Shade-sensitive crops may do well but sun-loving crops may be affected.',
      priority: 'low'
    });
  } else if (light_intensity > 900) {
    recs.push({
      type: 'light',
      message: 'Excessive sunlight detected. Consider shade nets to prevent leaf burn.',
      priority: 'medium'
    });
  }

  if (crop) {
    if (crop.growth_stage === 'flowering' || crop.growth_stage === 'Flowering') {
      recs.push({
        type: 'fertilizer',
        message: `${crop.crop_name} is in flowering stage. Apply potassium-rich fertilizer to improve fruit set.`,
        priority: 'medium'
      });
    } else if (crop.growth_stage === 'vegetative' || crop.growth_stage === 'Vegetative') {
      recs.push({
        type: 'fertilizer',
        message: `${crop.crop_name} is in vegetative growth. Apply nitrogen fertilizer to boost leaf development.`,
        priority: 'low'
      });
    } else if (crop.growth_stage === 'harvest' || crop.growth_stage === 'Harvest') {
      recs.push({
        type: 'harvest',
        message: `${crop.crop_name} is near harvest stage. Reduce irrigation and monitor crop ripeness daily.`,
        priority: 'medium'
      });
    }
  }

  if (recs.length === 0) {
    recs.push({
      type: 'status',
      message: 'Farm conditions are optimal. No immediate action required.',
      priority: 'low'
    });
  }

  return recs;
}

module.exports = { generateRecommendations };
