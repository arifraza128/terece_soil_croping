import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

const links = [
  { path: '/', key: 'dashboard', icon: '🏠' },
  { path: '/farm', key: 'farm', icon: '🌾' },
  { path: '/crops', key: 'crops', icon: '🌱' },
  { path: '/readings', key: 'readings', icon: '📡' },
  { path: '/alerts', key: 'alerts', icon: '🔔' },
  { path: '/analytics', key: 'analytics', icon: '📊' },
  { path: '/prices', key: 'prices', icon: '💰' },
  { path: '/scan', key: 'scan', icon: '🔬' },
  { path: '/devices', key: 'devices', icon: '📟' },
  { path: '/settings', key: 'settings', icon: '⚙️' }
];

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-black bg-opacity-40 md:hidden" onClick={onClose} />}

      <aside
        className={`
        fixed z-30 top-0 left-0 h-full w-60 bg-green-800 text-white flex flex-col
        transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:static md:translate-x-0
      `}
      >
        <div className="px-5 py-4 border-b border-green-700">
          <h1 className="text-lg font-bold text-green-100">🌿 Smart Terrace</h1>
          <p className="text-xs text-green-300">Farming System</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {links.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors
                 ${isActive ? 'bg-green-600 text-white font-semibold' : 'text-green-200 hover:bg-green-700'}`
              }
            >
              <span className="text-base">{link.icon}</span>
              {t(link.key)}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-green-700">
          <button
            onClick={handleLogout}
            className="w-full text-sm text-green-200 hover:text-white flex items-center gap-2 py-2 px-3 rounded hover:bg-green-700 transition"
          >
            🚪 {t('logout')}
          </button>
        </div>
      </aside>
    </>
  );
}
