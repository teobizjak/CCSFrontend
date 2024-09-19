import React from 'react';

function StatusIndicator({ status }) {
  let colorClass;

  switch (status) {
    case 'online':
      colorClass = 'bg-green-500';
      break;
    case 'updating':
      colorClass = 'bg-yellow-500';
      break;
    case 'offline':
      colorClass = 'bg-red-500';
      break;
    default:
      colorClass = 'bg-gray-400';
  }

  return (
    <div className="relative flex items-center">
      <div className={`relative w-3 h-3 ${colorClass} rounded-full`}>
        <div className="absolute inset-0 rounded-full border border-white animate-pulse-custom"></div>
      </div>
    </div>
  );
}

export default StatusIndicator;
