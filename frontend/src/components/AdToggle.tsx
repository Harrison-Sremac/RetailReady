import React from 'react';

interface AdToggleProps {
  showAds: boolean;
  onToggle: () => void;
}

const AdToggle: React.FC<AdToggleProps> = ({ showAds, onToggle }) => {
  return (
    <div className="flex items-center justify-end mb-2">
      <button
        onClick={onToggle}
        className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
          showAds 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-gray-500 text-white hover:bg-gray-600'
        }`}
      >
        {showAds ? 'Hide Ads' : 'Show Ads'}
      </button>
    </div>
  );
};

export default AdToggle;
