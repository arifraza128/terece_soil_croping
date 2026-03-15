function movingAverage(prices, window) {
  if (prices.length < window) return prices[0] || 0;
  const slice = prices.slice(0, window);
  return slice.reduce((a, b) => a + b, 0) / window;
}

function predictPrice(prices) {
  if (!prices || prices.length === 0) {
    return { day1: 0, week1: 0, month1: 0, trend: 'stable' };
  }

  const current = prices[0];
  const ma3 = movingAverage(prices, 3);
  const ma7 = movingAverage(prices, 7);

  const dailyChange = prices.length >= 2
    ? (prices[0] - prices[Math.min(2, prices.length - 1)]) / Math.max(2, 1)
    : 0;

  const day1 = Math.max(0, parseFloat((current + dailyChange).toFixed(2)));
  const week1 = Math.max(0, parseFloat((ma3 + dailyChange * 7).toFixed(2)));
  const month1 = Math.max(0, parseFloat((ma7 + dailyChange * 30).toFixed(2)));

  let trend = 'stable';
  if (dailyChange > 1) trend = 'rising';
  else if (dailyChange < -1) trend = 'falling';

  return { day1, week1, month1, trend };
}

module.exports = { predictPrice };
