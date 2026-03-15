import React from 'react';

const colors = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-blue-100 text-blue-700 border-blue-200'
};

export default function AlertBadge({ message, severity, onRead }) {
  return (
    <div className={`flex items-start gap-2 border rounded-lg px-3 py-2 text-sm ${colors[severity] || colors.medium}`}>
      <span className="mt-0.5">{severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🔵'}</span>
      <p className="flex-1">{message}</p>
      {onRead && (
        <button onClick={onRead} className="text-xs underline opacity-70 hover:opacity-100 shrink-0">
          ✓
        </button>
      )}
    </div>
  );
}
