import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useLang } from '../context/LangContext';

const stages = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Harvest', 'Dormant'];
const cropTypes = ['Vegetable', 'Fruit', 'Grain', 'Legume', 'Herb', 'Spice', 'Flower'];

export default function Crops() {
  const { t } = useLang();
  const farmId = localStorage.getItem('farmId');
  const [crops, setCrops] = useState([]);
  const [form, setForm] = useState({ crop_name: '', crop_type: 'Vegetable', sowing_date: '', growth_stage: 'Seedling', notes: '' });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!farmId) return setLoading(false);
    api
      .get(`/api/crops/${farmId}`)
      .then(r => setCrops(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [farmId]);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    const payload = { ...form, farm_id: farmId };
    if (editId) await api.put(`/api/crops/${editId}`, payload);
    else await api.post('/api/crops', payload);
    setForm({ crop_name: '', crop_type: 'Vegetable', sowing_date: '', growth_stage: 'Seedling', notes: '' });
    setEditId(null);
    setShowForm(false);
    load();
  };

  const startEdit = c => {
    setForm({
      crop_name: c.crop_name,
      crop_type: c.crop_type,
      sowing_date: c.sowing_date?.slice(0, 10) || '',
      growth_stage: c.growth_stage,
      notes: c.notes || ''
    });
    setEditId(c.id);
    setShowForm(true);
  };

  const deleteCrop = async id => {
    if (window.confirm('Delete this crop?')) {
      await api.delete(`/api/crops/${id}`);
      load();
    }
  };

  const stageBadge = s => {
    const map = {
      Seedling: 'bg-green-100 text-green-700',
      Vegetative: 'bg-teal-100 text-teal-700',
      Flowering: 'bg-pink-100 text-pink-700',
      Fruiting: 'bg-orange-100 text-orange-700',
      Harvest: 'bg-yellow-100 text-yellow-700',
      Dormant: 'bg-gray-100 text-gray-600'
    };
    return map[s] || 'bg-gray-100 text-gray-600';
  };

  if (!farmId) return <p className="text-gray-500 text-sm p-4">Set up your farm first.</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-green-800">🌱 {t('crops')}</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditId(null);
            setForm({ crop_name: '', crop_type: 'Vegetable', sowing_date: '', growth_stage: 'Seedling', notes: '' });
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          + {t('addCrop')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600">Crop Name</label>
            <input
              name="crop_name"
              value={form.crop_name}
              onChange={handle}
              required
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Crop Type</label>
            <select
              name="crop_type"
              value={form.crop_type}
              onChange={handle}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {cropTypes.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Sowing Date</label>
            <input
              name="sowing_date"
              type="date"
              value={form.sowing_date}
              onChange={handle}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Growth Stage</label>
            <select
              name="growth_stage"
              value={form.growth_stage}
              onChange={handle}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {stages.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-gray-600">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handle}
              rows={2}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700">
              {editId ? 'Update' : 'Add'} Crop
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50">
              {t('cancel')}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">{t('loading')}</p>
      ) : crops.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No crops added yet. Add your first crop.</p>
      ) : (
        <div className="grid gap-4">
          {crops.map(c => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm p-4 flex items-start justify-between">
              <div>
                <p className="font-semibold text-green-800">{c.crop_name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {c.crop_type} · Sown: {c.sowing_date?.slice(0, 10) || '—'}
                </p>
                <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${stageBadge(c.growth_stage)}`}>
                  {c.growth_stage}
                </span>
                {c.notes && <p className="text-xs text-gray-400 mt-1">{c.notes}</p>}
              </div>
              <div className="flex gap-2 ml-4 shrink-0">
                <button onClick={() => startEdit(c)} className="text-xs px-3 py-1 border border-green-300 rounded-lg text-green-700 hover:bg-green-50">
                  Edit
                </button>
                <button onClick={() => deleteCrop(c.id)} className="text-xs px-3 py-1 border border-red-200 rounded-lg text-red-600 hover:bg-red-50">
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
