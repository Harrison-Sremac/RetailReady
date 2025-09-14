/**
 * Severity Badge Component
 * 
 * A reusable component for displaying severity levels with consistent styling.
 * Provides visual indicators for High, Medium, and Low severity levels.
 * 
 * @fileoverview Reusable severity badge component
 * @author RetailReady Team
 * @version 1.0.0
 */

import React from 'react';
import { SEVERITY_CONFIG, SeverityLevel } from '../../utils/constants';

/**
 * Component props
 */
interface SeverityBadgeProps {
  severity: SeverityLevel;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Severity Badge Component
 * 
 * Displays a severity level with appropriate styling and optional icon.
 * 
 * @param severity - Severity level to display
 * @param showIcon - Whether to show the severity icon
 * @param size - Size variant of the badge
 * @param className - Additional CSS classes
 * @returns JSX element
 * 
 * @example
 * <SeverityBadge severity="High" showIcon={true} size="md" />
 * <SeverityBadge severity="Medium" />
 * <SeverityBadge severity="Low" size="sm" className="custom-class" />
 */
export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  showIcon = false,
  size = 'md',
  className = ''
}) => {
  const config = SEVERITY_CONFIG[severity];
  
  // Size-based styling
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span 
      className={`
        inline-flex items-center rounded-full font-medium border
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses[size]}
        ${className}
      `}
      title={config.description}
    >
      {showIcon && (
        <span className={`mr-1 ${iconSizes[size]}`}>
          {config.icon}
        </span>
      )}
      {severity}
    </span>
  );
};
