import React from 'react';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { languageOptions } from '../utils/translations';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { lang, changeLang, t } = useLang();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-xl font-bold text-green-800">⚙️ {t('settings')}</h2>

      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-2">
        <h3 className="text-sm font-semibold text-green-700">Account</h3>
        <p className="text-sm text-gray-700">
          Name: <span className="font-medium">{user?.name}</span>
        </p>
        <p className="text-sm text-gray-700">
          Email: <span className="font-medium">{user?.email}</span>
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
        <h3 className="text-sm font-semibold text-green-700">Language</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {languageOptions.map(l => (
            <button
              key={l.code}
              onClick={() => changeLang(l.code)}
              className={`py-2 px-3 rounded-lg text-sm border transition ${
                lang === l.code ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-2">
        <h3 className="text-sm font-semibold text-green-700">Voice Assistant</h3>
        <p className="text-xs text-gray-500">
          Uses browser Text-to-Speech. Tap the speaker icon on any card, alert, or scan result to hear it.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-2">
        <h3 className="text-sm font-semibold text-green-700">ESP32 Integration</h3>
        <p className="text-xs text-gray-500 leading-relaxed">Register your device and use generated token to POST sensor data:</p>
        <code className="block text-xs bg-gray-50 border rounded p-2 text-gray-700">
          POST /api/readings/device/:token
          <br />
          {'{ soil_moisture, temperature, humidity, light_intensity, water_level }'}
        </code>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <button onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-semibold text-sm transition">
          Sign Out
        </button>
      </div>
    </div>
  );
}
