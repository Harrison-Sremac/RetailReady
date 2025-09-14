import React from 'react';

interface AdToggleProps {
  showAds: boolean;
  onToggle: () => void;
}

const AdToggle: React.FC<AdToggleProps> = ({ showAds, onToggle }) => {
  return (
    <div className="flex items-center justify-between mb-4 p-3 bg-gray-100 rounded-lg">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Advertisement Display:</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          showAds ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
        }`}>
          {showAds ? 'ON' : 'OFF'}
        </span>
      </div>
      <button
        onClick={onToggle}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          showAds 
            ? 'bg-red-600 text-white hover:bg-red-700' 
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {showAds ? 'Hide Ads' : 'Show Ads'}
      </button>
    </div>
  );
};

export default AdToggle;
