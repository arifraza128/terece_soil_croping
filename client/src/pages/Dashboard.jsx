import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import SensorCard from '../components/SensorCard';
import AlertBadge from '../components/AlertBadge';
import { speak } from '../utils/voice';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const farmId = localStorage.getItem('farmId');

  const [farm, setFarm] = useState(null);
  const [latest, setLatest] = useState(null);
  const [crops, setCrops] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recs, setRecs] = useState([]);
  const [trend, setTrend] = useState([]);
  const [prices, setPrices] = useState([]);
  const [lastScan, setLastScan] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!farmId) {
      setLoading(false);
      return;
    }
    try {
      const [fRes, lRes, cRes, aRes, rRes, tRes, pRes, sRes] = await Promise.allSettled([
        api.get('/api/farm'),
        api.get(`/api/readings/${farmId}/latest`),
        api.get(`/api/crops/${farmId}`),
        api.get(`/api/alerts/${farmId}`),
        api.get(`/api/recommendations/${farmId}`),
        api.get(`/api/analytics/${farmId}/daily`),
        api.get('/api/prices'),
        api.get(`/api/scans/${farmId}`)
      ]);
      if (fRes.status === 'fulfilled') setFarm(fRes.value.data);
      if (lRes.status === 'fulfilled') setLatest(lRes.value.data);
      if (cRes.status === 'fulfilled') setCrops(cRes.value.data);
      if (aRes.status === 'fulfilled') setAlerts(aRes.value.data.filter(a => !a.is_read).slice(0, 3));
      if (rRes.status === 'fulfilled') setRecs(rRes.value.data.slice(0, 3));
      if (tRes.status === 'fulfilled') setTrend(tRes.value.data.slice(-7));
      if (pRes.status === 'fulfilled') {
        const seen = new Set();
        const latestPrice = pRes.value.data
          .filter(p => {
            if (seen.has(p.crop_name)) return false;
            seen.add(p.crop_name);
            return true;
          })
          .slice(0, 4);
        setPrices(latestPrice);
      }
      if (sRes.status === 'fulfilled') setLastScan(sRes.value.data[0] || null);
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    load();
  }, [load]);

  const genRecommendations = async () => {
    if (!farmId) return;
    await api.post(`/api/recommendations/generate/${farmId}`);
    load();
  };

  const sensorCards = [
    { label: t('soilMoisture'), key: 'soil_moisture', unit: '%', icon: '💧', color: 'blue', alert: latest?.soil_moisture < 30 ? 'Low' : null },
    { label: t('temperature'), key: 'temperature', unit: '°C', icon: '🌡️', color: 'orange', alert: latest?.temperature > 35 ? 'High' : null },
    { label: t('humidity'), key: 'humidity', unit: '%', icon: '🌫️', color: 'green', alert: null },
    { label: t('lightIntensity'), key: 'light_intensity', unit: 'lux', icon: '☀️', color: 'yellow', alert: null },
    { label: t('waterLevel'), key: 'water_level', unit: '%', icon: '🪣', color: 'blue', alert: latest?.water_level < 20 ? 'Critical' : null }
  ];

  if (!farmId)
    return (
      <div className="text-center py-16">
        <p className="text-5xl mb-4">🌾</p>
        <h2 className="text-xl font-bold text-green-800">Welcome, {user?.name}!</h2>
        <p className="text-gray-500 mt-2 text-sm">Start by setting up your farm profile.</p>
        <a href="/farm" className="inline-block mt-4 bg-green-600 text-white px-6 py-2 rounded-xl font-semibold text-sm hover:bg-green-700 transition">
          Set Up Farm
        </a>
      </div>
    );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-green-800">Welcome, {farm?.farmer_name || user?.name}</h2>
          <p className="text-sm text-gray-500">
            {farm?.farm_name} · {farm?.location}
          </p>
        </div>
        <button onClick={genRecommendations} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition">
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {sensorCards.map(s => (
          <SensorCard key={s.key} label={s.label} value={latest?.[s.key]} unit={s.unit} icon={s.icon} color={s.color} alert={s.alert} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-green-700 mb-3">Active Alerts</h3>
          {alerts.length === 0 ? (
            <p className="text-xs text-gray-400">No active alerts</p>
          ) : (
            <div className="space-y-2">
              {alerts.map(a => (
                <AlertBadge key={a.id} message={a.message} severity={a.severity} />
              ))}
              <a href="/alerts" className="text-xs text-green-600 hover:underline">
                View all
              </a>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-green-700 mb-3">Recommendations</h3>
          {recs.length === 0 ? (
            <p className="text-xs text-gray-400">No recommendations yet.</p>
          ) : (
            <div className="space-y-2">
              {recs.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-base mt-0.5">{r.priority === 'high' ? '🔴' : r.priority === 'medium' ? '🟡' : '🟢'}</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-700">{r.message}</p>
                  </div>
                  <button onClick={() => speak(r.message, lang)} className="text-xs text-gray-400 hover:text-gray-600">
                    🔊
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-green-700 mb-3">7-Day Trend</h3>
          {trend.length === 0 ? (
            <p className="text-xs text-gray-400">{t('noData')}</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} tickFormatter={v => v?.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="avg_moisture" stroke="#3b82f6" dot={false} strokeWidth={2} name="Moisture" />
                <Line type="monotone" dataKey="avg_temp" stroke="#f97316" dot={false} strokeWidth={2} name="Temp" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-green-700 mb-2">Crops ({crops.length})</h3>
            {crops.slice(0, 3).map(c => (
              <div key={c.id} className="flex items-center justify-between py-1 text-xs border-b last:border-0">
                <span className="font-medium text-gray-700">{c.crop_name}</span>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{c.growth_stage}</span>
              </div>
            ))}
            {crops.length === 0 && <p className="text-xs text-gray-400">No crops added.</p>}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-green-700 mb-2">Price Snapshot</h3>
            {prices.length === 0 ? (
              <p className="text-xs text-gray-400">No price data.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {prices.map(p => (
                  <div key={p.id} className="bg-green-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-500">{p.crop_name}</p>
                    <p className="text-sm font-bold text-green-700">Rs {p.price}/kg</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {lastScan && (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="text-sm font-semibold text-green-700 mb-2">Latest Scan</h3>
              <div className="flex items-center gap-3">
                {lastScan.image_url && <img src={lastScan.image_url} alt="scan" className="w-12 h-12 rounded-lg object-cover border" />}
                <div>
                  <p className="text-xs font-bold text-gray-700">{lastScan.result}</p>
                  <p className="text-xs text-gray-400">{lastScan.crop_name}</p>
                </div>
                <button onClick={() => speak(`${lastScan.result}. ${lastScan.advice}`, lang)} className="ml-auto text-gray-400 hover:text-gray-600">
                  🔊
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {loading && <p className="text-xs text-gray-400">Loading dashboard...</p>}
    </div>
  );
}
