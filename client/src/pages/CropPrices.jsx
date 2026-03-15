import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useLang } from '../context/LangContext';
import { speak } from '../utils/voice';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const trendBadge = t =>
  (
    {
      rising: 'bg-green-100 text-green-700',
      falling: 'bg-red-100 text-red-700',
      stable: 'bg-gray-100 text-gray-600'
    }[t] || 'bg-gray-100 text-gray-600'
  );

export default function CropPrices() {
  const { t, lang } = useLang();
  const [crops, setCrops] = useState([]);
  const [selected, setSelected] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ crop_name: '', price: '', market_name: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const loadCrops = () => api.get('/api/prices/crops').then(r => setCrops(r.data)).catch(() => {});

  useEffect(() => {
    loadCrops();
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    Promise.all([api.get(`/api/prices/predict/${selected}`), api.get(`/api/prices?crop=${selected}`)])
      .then(([r1, r2]) => {
        setPrediction(r1.data);
        setHistory(r2.data.slice(0, 15).reverse());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selected]);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const addPrice = async e => {
    e.preventDefault();
    await api.post('/api/prices', form);
    setMsg('Price added');
    setTimeout(() => setMsg(''), 3000);
    const nextCrop = form.crop_name;
    setForm({ crop_name: '', price: '', market_name: '' });
    loadCrops();
    if (nextCrop === selected) setSelected('');
    setTimeout(() => setSelected(nextCrop), 100);
  };

  const speakPrediction = () => {
    if (!prediction) return;
    speak(
      `${prediction.crop_name}. Current price: ${prediction.current_price} rupees. Trend: ${prediction.trend}. After one week: ${prediction.prediction_1week} rupees.`,
      lang
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-green-800">💰 {t('prices')}</h2>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-green-700 mb-3">Add / Update Price</h3>
        {msg && <p className="text-green-600 text-sm mb-2">{msg}</p>}
        <form onSubmit={addPrice} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-600">Crop Name</label>
            <input
              name="crop_name"
              value={form.crop_name}
              onChange={handle}
              required
              placeholder="e.g. Tomato"
              className="w-full mt-1 px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Price (Rs/kg)</label>
            <input
              name="price"
              type="number"
              step="0.1"
              value={form.price}
              onChange={handle}
              required
              className="w-full mt-1 px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Market Name</label>
            <input
              name="market_name"
              value={form.market_name}
              onChange={handle}
              placeholder="Local Market"
              className="w-full mt-1 px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div className="sm:col-span-3">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition">
              Add Price
            </button>
          </div>
        </form>
      </div>

      {crops.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {crops.map(c => (
            <button
              key={c}
              onClick={() => setSelected(c)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                selected === c ? 'bg-green-600 text-white border-green-600' : 'border-green-300 text-green-700 hover:bg-green-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          {loading ? (
            <p className="text-sm text-gray-500">{t('loading')}</p>
          ) : prediction ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-green-800">{prediction.crop_name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${trendBadge(prediction.trend)}`}>
                    {prediction.trend} 
                  </span>
                  <button onClick={speakPrediction} className="text-xs text-gray-400 hover:text-gray-600">
                    🔊
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Current', val: prediction.current_price },
                  { label: 'After 1 Day', val: prediction.prediction_1day },
                  { label: 'After 1 Week', val: prediction.prediction_1week },
                  { label: 'After 1 Month', val: prediction.prediction_1month }
                ].map(p => (
                  <div key={p.label} className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500">{p.label}</p>
                    <p className="text-lg font-bold text-green-700">Rs {p.val}</p>
                    <p className="text-xs text-gray-400">per kg</p>
                  </div>
                ))}
              </div>

              {history.length > 0 && (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="recorded_at" tick={{ fontSize: 10 }} tickFormatter={v => (v ? new Date(v).toLocaleDateString() : '')} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={v => `Rs ${v}`} />
                    <Line type="monotone" dataKey="price" stroke="#16a34a" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
