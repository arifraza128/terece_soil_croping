import React from 'react';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-green-600">
      <div className="w-8 h-8 border-4 border-green-300 border-t-green-600 rounded-full animate-spin mb-3" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
