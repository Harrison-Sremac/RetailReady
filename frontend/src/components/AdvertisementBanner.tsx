import React from 'react';

interface AdvertisementBannerProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  variant?: 'horizontal' | 'vertical';
}

const AdvertisementBanner: React.FC<AdvertisementBannerProps> = ({
  title = "Advanced Warehouse Analytics",
  description = "Get real-time insights into your warehouse operations. Track performance, identify bottlenecks, and optimize your workflow.",
  ctaText = "Start Free Trial",
  ctaLink = "#",
  imageUrl = "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200&fit=crop&crop=center",
  backgroundColor = "bg-gradient-to-r from-green-600 to-teal-600",
  textColor = "text-white",
  variant = 'horizontal'
}) => {
  if (variant === 'vertical') {
    return (
      <div className={`${backgroundColor} rounded-lg shadow-lg overflow-hidden mb-6`}>
        <div className="p-6">
          <img 
            src={imageUrl} 
            alt="Advertisement" 
            className="w-full h-32 object-cover rounded-md mb-4"
          />
          <h3 className={`text-lg font-bold ${textColor} mb-2`}>
            {title}
          </h3>
          <p className={`${textColor} opacity-90 text-sm leading-relaxed mb-4`}>
            {description}
          </p>
          <div className="flex items-center justify-between">
            <span className={`${textColor} opacity-75 text-xs`}>
              Sponsored by DataFlow Pro
            </span>
            <a 
              href={ctaLink}
              className={`${textColor} bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 border border-white border-opacity-30`}
            >
              {ctaText}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${backgroundColor} rounded-lg shadow-lg overflow-hidden mb-6`}>
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="md:w-1/3">
          <img 
            src={imageUrl} 
            alt="Advertisement" 
            className="w-full h-48 md:h-full object-cover"
          />
        </div>
        
        {/* Content Section */}
        <div className="md:w-2/3 p-6 flex flex-col justify-center">
          <div className="mb-4">
            <h3 className={`text-xl font-bold ${textColor} mb-2`}>
              {title}
            </h3>
            <p className={`${textColor} opacity-90 text-sm leading-relaxed`}>
              {description}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`${textColor} opacity-75 text-xs`}>
                Sponsored by DataFlow Pro
              </span>
            </div>
            <a 
              href={ctaLink}
              className={`${textColor} bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border border-white border-opacity-30`}
            >
              {ctaText}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertisementBanner;
