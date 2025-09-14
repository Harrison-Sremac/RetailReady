import React from 'react';

interface AdvertisementProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
}

const Advertisement: React.FC<AdvertisementProps> = ({
  title = "Boost Your Warehouse Efficiency",
  description = "Streamline operations with our advanced warehouse management solutions. Reduce compliance violations by 40% and increase productivity.",
  ctaText = "Learn More",
  ctaLink = "#",
  imageUrl = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=200&fit=crop&crop=center",
  backgroundColor = "bg-gradient-to-r from-blue-600 to-purple-600",
  textColor = "text-white"
}) => {
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
                Sponsored by WarehousePro Solutions
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

export default Advertisement;
