const results = [
  {
    result: 'Healthy',
    confidence: 92,
    advice: 'Your crop looks healthy. Continue regular watering and fertilization schedule.'
  },
  {
    result: 'Leaf Spot',
    confidence: 78,
    advice: 'Leaf spot disease detected. Remove infected leaves and apply copper-based fungicide. Avoid overhead irrigation.'
  },
  {
    result: 'Powdery Mildew',
    confidence: 81,
    advice: 'Powdery mildew detected. Apply sulfur-based fungicide. Improve air circulation around plants.'
  },
  {
    result: 'Early Blight',
    confidence: 74,
    advice: 'Early blight detected. Remove affected leaves, apply fungicide, and ensure proper plant spacing for air circulation.'
  },
  {
    result: 'Nutrient Deficiency',
    confidence: 69,
    advice: 'Signs of nutrient deficiency observed. Apply balanced NPK fertilizer and check soil pH levels.'
  }
];

function analyzeCropImage(filename) {
  const hash = filename.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const index = hash % results.length;
  return results[index];
}

module.exports = { analyzeCropImage };
