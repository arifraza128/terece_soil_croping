import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useLang } from '../context/LangContext';
import AlertBadge from '../components/AlertBadge';
import { speak } from '../utils/voice';

export default function Alerts() {
  const { t, lang } = useLang();
  const farmId = localStorage.getItem('farmId');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!farmId) return setLoading(false);
    api
      .get(`/api/alerts/${farmId}`)
      .then(r => setAlerts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [farmId]);

  const markRead = async id => {
    await api.patch(`/api/alerts/${id}/read`);
    load();
  };

  const markAll = async () => {
    await api.patch(`/api/alerts/farm/${farmId}/read-all`);
    load();
  };

  const deleteAlert = async id => {
    await api.delete(`/api/alerts/${id}`);
    load();
  };

  const speakAll = () => {
    const msgs = alerts.filter(a => !a.is_read).map(a => a.message).join('. ');
    speak(msgs || 'No active alerts.', lang);
  };

  const unread = alerts.filter(a => !a.is_read);
  const read = alerts.filter(a => a.is_read);

  if (!farmId) return <p className="text-sm text-gray-500 p-4">Set up your farm first.</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-green-800">🔔 {t('alerts')}</h2>
        <div className="flex gap-2">
          <button onClick={speakAll} className="text-xs border border-green-300 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50">
            Read All
          </button>
          {unread.length > 0 && (
            <button onClick={markAll} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">{t('loading')}</p>
      ) : (
        <>
          {unread.length === 0 && read.length === 0 && <p className="text-center text-gray-400 py-12">No alerts. All looks good.</p>}

          {unread.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active ({unread.length})</p>
              {unread.map(a => (
                <div key={a.id} className="flex items-start gap-2">
                  <div className="flex-1">
                    <AlertBadge message={a.message} severity={a.severity} onRead={() => markRead(a.id)} />
                  </div>
                  <button onClick={() => speak(a.message, lang)} className="text-xs text-gray-400 hover:text-gray-600 mt-1.5">
                    🔊
                  </button>
                  <button onClick={() => deleteAlert(a.id)} className="text-xs text-red-300 hover:text-red-500 mt-1.5">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {read.length > 0 && (
            <div className="space-y-2 opacity-60">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Read ({read.length})</p>
              {read.slice(0, 10).map(a => (
                <AlertBadge key={a.id} message={a.message} severity={a.severity} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
