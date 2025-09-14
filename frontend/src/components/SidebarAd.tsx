import React from 'react';

interface SidebarAdProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
}

const SidebarAd: React.FC<SidebarAdProps> = ({
  title = "Compliance Training Solutions",
  description = "Train your team with our comprehensive compliance courses. Reduce violations by 60% with expert-led training programs.",
  ctaText = "View Courses",
  ctaLink = "#",
  imageUrl = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop&crop=center",
  backgroundColor = "bg-gradient-to-b from-purple-600 to-indigo-600",
  textColor = "text-white"
}) => {
  return (
    <div className={`${backgroundColor} rounded-lg shadow-lg overflow-hidden mb-6`}>
      <div className="p-4">
        <img 
          src={imageUrl} 
          alt="Advertisement" 
          className="w-full h-24 object-cover rounded-md mb-3"
        />
        <h3 className={`text-sm font-bold ${textColor} mb-2`}>
          {title}
        </h3>
        <p className={`${textColor} opacity-90 text-xs leading-relaxed mb-3`}>
          {description}
        </p>
        <div className="flex items-center justify-between">
          <span className={`${textColor} opacity-75 text-xs`}>
            Sponsored by LearnPro
          </span>
          <a 
            href={ctaLink}
            className={`${textColor} bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded text-xs font-medium transition-all duration-200 border border-white border-opacity-30`}
          >
            {ctaText}
          </a>
        </div>
      </div>
    </div>
  );
};

export default SidebarAd;
