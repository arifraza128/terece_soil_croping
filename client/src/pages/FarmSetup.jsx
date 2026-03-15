import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useLang } from '../context/LangContext';

const soilTypes = ['Loamy', 'Clay', 'Sandy', 'Silty', 'Chalky', 'Peaty'];
const waterSources = ['Rainwater', 'Borewell', 'River', 'Canal', 'Tank', 'Drip Irrigation'];
const regionTypes = ['Hilly', 'Plateau', 'Valley', 'Coastal', 'Plain'];

export default function FarmSetup() {
  const { t } = useLang();
  const [form, setForm] = useState({
    farmer_name: '',
    farm_name: '',
    location: '',
    region_type: 'Hilly',
    terrace_count: '',
    farm_size: '',
    soil_type: 'Loamy',
    water_source: 'Rainwater',
    preferred_language: 'en'
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/api/farm')
      .then(r => {
        if (r.data && r.data.id) {
          setForm(r.data);
          localStorage.setItem('farmId', r.data.id);
        }
      })
      .catch(() => {});
  }, []);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/farm', form);
      localStorage.setItem('farmId', res.data.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save farm');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, name, type = 'text', options }) => (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {options ? (
        <select
          name={name}
          value={form[name]}
          onChange={handle}
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          {options.map(o => (
            <option key={o.value ?? o} value={o.value ?? o}>
              {o.label ?? o}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={name}
          type={type}
          value={form[name]}
          onChange={handle}
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-green-800 mb-6">🌾 {t('farm')}</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {saved && <p className="text-green-600 text-sm mb-4">Farm details saved!</p>}
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Farmer Name" name="farmer_name" />
          <Field label="Farm Name" name="farm_name" />
          <Field label="Location" name="location" />
          <Field label="Region Type" name="region_type" options={regionTypes} />
          <Field label="Terrace Count" name="terrace_count" type="number" />
          <Field label="Farm Size (acres)" name="farm_size" type="number" />
          <Field label="Soil Type" name="soil_type" options={soilTypes} />
          <Field label="Water Source" name="water_source" options={waterSources} />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 transition"
        >
          {loading ? 'Saving...' : `💾 ${t('save')}`}
        </button>
      </form>
    </div>
  );
}
