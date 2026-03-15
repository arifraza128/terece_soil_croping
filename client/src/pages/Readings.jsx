import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useLang } from '../context/LangContext';
import SensorCard from '../components/SensorCard';

export default function Readings() {
  const { t } = useLang();
  const farmId = localStorage.getItem('farmId');
  const [readings, setReadings] = useState([]);
  const [latest, setLatest] = useState(null);
  const [form, setForm] = useState({ soil_moisture: '', temperature: '', humidity: '', light_intensity: '', water_level: '' });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = () => {
    if (!farmId) return setLoading(false);
    Promise.all([api.get(`/api/readings/${farmId}`), api.get(`/api/readings/${farmId}/latest`)])
      .then(([r1, r2]) => {
        setReadings(r1.data);
        setLatest(r2.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [farmId]);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submitManual = async e => {
    e.preventDefault();
    await api.post('/api/readings', { ...form, farm_id: farmId });
    setMsg('Reading saved');
    setTimeout(() => setMsg(''), 3000);
    setForm({ soil_moisture: '', temperature: '', humidity: '', light_intensity: '', water_level: '' });
    load();
  };

  const generateDemo = async () => {
    await api.post(`/api/readings/demo/${farmId}`);
    setMsg('Demo reading generated');
    setTimeout(() => setMsg(''), 3000);
    load();
  };

  if (!farmId) return <p className="text-sm text-gray-500 p-4">Set up your farm first.</p>;

  const sensorCards = [
    { label: t('soilMoisture'), key: 'soil_moisture', unit: '%', icon: '💧', color: 'blue' },
    { label: t('temperature'), key: 'temperature', unit: '°C', icon: '🌡️', color: 'orange' },
    { label: t('humidity'), key: 'humidity', unit: '%', icon: '🌫️', color: 'green' },
    { label: t('lightIntensity'), key: 'light_intensity', unit: 'lux', icon: '☀️', color: 'yellow' },
    { label: t('waterLevel'), key: 'water_level', unit: '%', icon: '🪣', color: 'blue' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-green-800">📡 {t('readings')}</h2>

      {latest && latest.id && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {sensorCards.map(s => (
            <SensorCard key={s.key} label={s.label} value={latest[s.key]} unit={s.unit} icon={s.icon} color={s.color} />
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={generateDemo} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
          Generate Demo Reading
        </button>
      </div>
      {msg && <p className="text-green-600 text-sm">{msg}</p>}

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-semibold text-green-700 mb-4 text-sm">Manual Entry</h3>
        <form onSubmit={submitManual} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {sensorCards.map(s => (
            <div key={s.key}>
              <label className="text-xs text-gray-600">
                {s.label} ({s.unit})
              </label>
              <input
                name={s.key}
                type="number"
                step="0.1"
                value={form[s.key]}
                onChange={handle}
                className="w-full mt-1 px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          ))}
          <div className="col-span-2 sm:col-span-3">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition">
              Save Reading
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 overflow-x-auto">
        <h3 className="font-semibold text-green-700 mb-3 text-sm">Recent Readings</h3>
        {loading ? (
          <p className="text-sm text-gray-500">{t('loading')}</p>
        ) : readings.length === 0 ? (
          <p className="text-sm text-gray-400">No readings yet.</p>
        ) : (
          <table className="w-full text-xs text-gray-700">
            <thead>
              <tr className="border-b">
                {['Time', 'Moisture%', 'Temp°C', 'Humid%', 'Light', 'Water%', 'Source'].map(h => (
                  <th key={h} className="pb-2 pr-3 text-left font-semibold text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {readings.map(r => (
                <tr key={r.id} className="border-b hover:bg-green-50">
                  <td className="py-1.5 pr-3">{new Date(r.timestamp).toLocaleString()}</td>
                  <td className="pr-3">{r.soil_moisture}</td>
                  <td className="pr-3">{r.temperature}</td>
                  <td className="pr-3">{r.humidity}</td>
                  <td className="pr-3">{r.light_intensity}</td>
                  <td className="pr-3">{r.water_level}</td>
                  <td>
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{r.source_type}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
