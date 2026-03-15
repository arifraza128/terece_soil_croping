import React from 'react';
import { speak } from '../utils/voice';
import { useLang } from '../context/LangContext';

export default function SensorCard({ label, value, unit, icon, color, alert }) {
  const { lang } = useLang();
  const colorMap = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    red: 'bg-red-50 border-red-200 text-red-700'
  };

  const cls = colorMap[color] || colorMap.green;

  return (
    <div className={`border rounded-xl p-4 shadow-sm ${cls} relative`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-2xl">{icon}</span>
        <button
          onClick={() => speak(`${label}: ${value} ${unit}`, lang)}
          className="text-xs opacity-60 hover:opacity-100"
          title="Read aloud"
        >
          🔊
        </button>
      </div>
      <p className="text-xs font-medium opacity-70 mt-1">{label}</p>
      <p className="text-2xl font-bold mt-0.5">
        {value !== undefined && value !== null ? value : '—'}
        <span className="text-sm font-normal ml-1">{unit}</span>
      </p>
      {alert && <p className="text-xs mt-1 font-semibold text-red-600">⚠ {alert}</p>}
    </div>
  );
}
