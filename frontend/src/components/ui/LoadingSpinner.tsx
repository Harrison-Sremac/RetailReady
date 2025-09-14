/**
 * Loading Spinner Component
 * 
 * A reusable loading spinner component with different sizes and styles.
 * Provides consistent loading indicators throughout the application.
 * 
 * @fileoverview Reusable loading spinner component
 * @author RetailReady Team
 * @version 1.0.0
 */

import React from 'react';

/**
 * Component props
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'white' | 'gray';
  className?: string;
  text?: string;
}

/**
 * Loading Spinner Component
 * 
 * Displays a spinning loading indicator with customizable size and color.
 * 
 * @param size - Size of the spinner
 * @param color - Color theme of the spinner
 * @param className - Additional CSS classes
 * @param text - Optional text to display below the spinner
 * @returns JSX element
 * 
 * @example
 * <LoadingSpinner size="md" color="blue" />
 * <LoadingSpinner size="lg" color="white" text="Loading..." />
 * <LoadingSpinner size="sm" className="custom-class" />
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  className = '',
  text
}) => {
  // Size-based styling
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  // Color-based styling
  const colorClasses = {
    blue: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`
          animate-spin rounded-full border-b-2
          ${sizeClasses[size]} ${colorClasses[color]}
        `}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className={`mt-2 text-sm ${color === 'white' ? 'text-white' : 'text-gray-600'}`}>
          {text}
        </p>
      )}
    </div>
  );
};
