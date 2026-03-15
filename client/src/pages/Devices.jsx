import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function Devices() {
  const farmId = localStorage.getItem('farmId');
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState({ device_name: '', device_type: 'ESP32' });
  const [loading, setLoading] = useState(true);
  const [newToken, setNewToken] = useState(null);

  const load = () => {
    if (!farmId) return setLoading(false);
    api
      .get(`/api/devices/${farmId}`)
      .then(r => setDevices(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [farmId]);

  const addDevice = async e => {
    e.preventDefault();
    const res = await api.post('/api/devices', { ...form, farm_id: farmId });
    setNewToken(res.data.token);
    setForm({ device_name: '', device_type: 'ESP32' });
    load();
  };

  const deleteDevice = async id => {
    await api.delete(`/api/devices/${id}`);
    load();
  };

  if (!farmId) return <p className="text-sm text-gray-500 p-4">Set up your farm first.</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-green-800">📟 Devices</h2>

      {newToken && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 text-sm">
          <p className="font-semibold text-yellow-800">Device Token (save this):</p>
          <code className="block mt-1 text-xs bg-white px-3 py-2 rounded border break-all">{newToken}</code>
          <p className="text-xs text-yellow-600 mt-1">Use this token with POST /api/readings/device/:token</p>
          <button onClick={() => setNewToken(null)} className="text-xs mt-2 text-yellow-500 underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-green-700 mb-3">Register Device</h3>
        <form onSubmit={addDevice} className="flex gap-3 flex-wrap">
          <input
            value={form.device_name}
            onChange={e => setForm(p => ({ ...p, device_name: e.target.value }))}
            required
            placeholder="Device name"
            className="flex-1 min-w-0 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <select
            value={form.device_type}
            onChange={e => setForm(p => ({ ...p, device_type: e.target.value }))}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            {['ESP32', 'ESP8266', 'Arduino', 'Raspberry Pi', 'Other'].map(d => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition">
            Register
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-green-700 mb-3">Registered Devices ({devices.length})</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : devices.length === 0 ? (
          <p className="text-sm text-gray-400">No devices registered yet.</p>
        ) : (
          <div className="space-y-3">
            {devices.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
                <div>
                  <p className="font-medium text-sm text-gray-800">{d.device_name}</p>
                  <p className="text-xs text-gray-400">
                    {d.device_type} · {d.status}
                  </p>
                  {d.last_seen && <p className="text-xs text-gray-300">Last: {new Date(d.last_seen).toLocaleString()}</p>}
                </div>
                <button onClick={() => deleteDevice(d.id)} className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
