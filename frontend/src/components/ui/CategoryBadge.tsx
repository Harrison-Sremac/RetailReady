/**
 * Category Badge Component
 * 
 * A reusable component for displaying category information with consistent styling.
 * Provides visual indicators for different compliance categories.
 * 
 * @fileoverview Reusable category badge component
 * @author RetailReady Team
 * @version 1.0.0
 */

import React from 'react';
import { CATEGORY_CONFIG } from '../../utils/constants';

/**
 * Component props
 */
interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Category Badge Component
 * 
 * Displays a category with appropriate styling based on the category type.
 * 
 * @param category - Category name to display
 * @param size - Size variant of the badge
 * @param className - Additional CSS classes
 * @returns JSX element
 * 
 * @example
 * <CategoryBadge category="Labeling" size="md" />
 * <CategoryBadge category="ASN" />
 * <CategoryBadge category="Packaging" size="sm" className="custom-class" />
 */
export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  className = ''
}) => {
  // Get category configuration or use default
  const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.DEFAULT;
  
  // Size-based styling
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <span 
      className={`
        inline-flex items-center rounded-full font-medium
        ${config.bgColor} ${config.textColor}
        ${sizeClasses[size]}
        ${className}
      `}
      title={config.description}
    >
      {category}
    </span>
  );
};
