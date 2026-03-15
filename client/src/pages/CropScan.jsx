import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useLang } from '../context/LangContext';
import { speak } from '../utils/voice';

const resultColors = {
  Healthy: 'bg-green-100 text-green-800',
  'Leaf Spot': 'bg-yellow-100 text-yellow-800',
  'Powdery Mildew': 'bg-purple-100 text-purple-800',
  'Early Blight': 'bg-orange-100 text-orange-800',
  'Nutrient Deficiency': 'bg-red-100 text-red-800'
};

export default function CropScan() {
  const { t, lang } = useLang();
  const farmId = localStorage.getItem('farmId');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cropName, setCropName] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = () => {
    if (!farmId) return;
    api.get(`/api/scans/${farmId}`).then(r => setHistory(r.data)).catch(() => {});
  };

  useEffect(() => {
    loadHistory();
  }, [farmId]);

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const analyze = async () => {
    if (!file || !farmId) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('image', file);
    fd.append('farm_id', farmId);
    fd.append('crop_name', cropName || 'Unknown');
    try {
      const res = await api.post('/api/scans/analyze', fd);
      setResult(res.data);
      loadHistory();
      speak(`Scan result: ${res.data.result}. ${res.data.advice}`, lang);
    } catch (err) {
      alert('Scan failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!farmId) return <p className="text-sm text-gray-500 p-4">Set up your farm first.</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-green-800">🔬 {t('scan')}</h2>

      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-600">Crop Name (optional)</label>
          <input
            value={cropName}
            onChange={e => setCropName(e.target.value)}
            placeholder="e.g. Tomato"
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div className="border-2 border-dashed border-green-300 rounded-xl p-6 text-center">
          {preview ? (
            <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-lg object-contain" />
          ) : (
            <p className="text-sm text-gray-400">Click to select a crop image</p>
          )}
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" id="scan-input" />
          <label htmlFor="scan-input" className="inline-block mt-3 cursor-pointer bg-green-50 border border-green-300 text-green-700 px-4 py-1.5 rounded-lg text-sm hover:bg-green-100">
            {preview ? 'Change Image' : 'Select Image'}
          </label>
        </div>

        <button
          onClick={analyze}
          disabled={!file || loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-60"
        >
          {loading ? 'Analyzing...' : 'Analyze Crop'}
        </button>

        {result && (
          <div className={`rounded-xl p-4 space-y-2 ${resultColors[result.result] || 'bg-gray-100 text-gray-800'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">{result.result}</p>
                <p className="text-xs opacity-70">Confidence: {result.confidence}%</p>
              </div>
              <button onClick={() => speak(`${result.result}. ${result.advice}`, lang)} className="text-xl">
                🔊
              </button>
            </div>
            <p className="text-sm">{result.advice}</p>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-green-700 mb-3">Scan History</h3>
          <div className="space-y-3">
            {history.map(s => (
              <div key={s.id} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                {s.image_url && <img src={s.image_url} alt="scan" className="w-14 h-14 object-cover rounded-lg border" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${resultColors[s.result] || 'bg-gray-100 text-gray-600'}`}>
                      {s.result}
                    </span>
                    <span className="text-xs text-gray-400">{s.crop_name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{s.advice?.slice(0, 80)}...</p>
                  <p className="text-xs text-gray-300 mt-0.5">{new Date(s.scanned_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
