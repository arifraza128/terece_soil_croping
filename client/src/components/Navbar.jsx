import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { languageOptions } from '../utils/translations';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const { lang, changeLang } = useLang();

  return (
    <header className="bg-white border-b border-green-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <button className="md:hidden text-green-700 text-2xl" onClick={onMenuClick}>
        ☰
      </button>

      <span className="hidden md:block text-green-800 font-semibold text-sm">🌿 Smart Terrace Farming System</span>

      <div className="flex items-center gap-3">
        <select
          value={lang}
          onChange={e => changeLang(e.target.value)}
          className="text-xs border border-green-300 rounded px-2 py-1 text-green-700 focus:outline-none"
        >
          {languageOptions.map(l => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>

        <span className="text-sm text-green-700 font-medium hidden sm:block">👤 {user?.name || 'Farmer'}</span>
      </div>
    </header>
  );
}
