import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useLang } from '../context/LangContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const { t } = useLang();
  const farmId = localStorage.getItem('farmId');
  const [tab, setTab] = useState('daily');
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmId) return;
    setLoading(true);
    Promise.all([api.get(`/api/analytics/${farmId}/${tab}`), api.get(`/api/analytics/${farmId}/summary`)])
      .then(([r1, r2]) => {
        setData(r1.data);
        setSummary(r2.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [farmId, tab]);

  const tabs = ['daily', 'weekly', 'monthly'];
  const xKey = tab === 'daily' ? 'day' : tab === 'weekly' ? 'week' : 'month';

  if (!farmId) return <p className="text-sm text-gray-500 p-4">Set up your farm first.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-green-800">📊 {t('analytics')}</h2>

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Avg Moisture', val: summary.avg_moisture, unit: '%' },
            { label: 'Avg Temperature', val: summary.avg_temp, unit: '°C' },
            { label: 'Avg Humidity', val: summary.avg_humidity, unit: '%' },
            { label: 'Total Readings', val: summary.total_readings, unit: '' }
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {c.val ?? '—'}
                <span className="text-sm font-normal ml-1">{c.unit}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {tabs.map(tb => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition capitalize ${
              tab === tb ? 'bg-green-600 text-white' : 'border border-green-300 text-green-700 hover:bg-green-50'
            }`}
          >
            {tb}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-green-700 mb-4 capitalize">{tab} Sensor Trends</h3>
        {loading ? (
          <p className="text-sm text-gray-500">{t('loading')}</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">{t('noData')}</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="avg_moisture" stroke="#3b82f6" name="Moisture%" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="avg_temp" stroke="#f97316" name="Temp°C" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="avg_humidity" stroke="#22c55e" name="Humidity%" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="avg_water" stroke="#06b6d4" name="Water%" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
