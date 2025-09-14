/**
 * Violations List Component (Refactored)
 * 
 * This component displays a list of compliance violations with enhanced
 * functionality, better organization, and improved user experience.
 * 
 * @fileoverview Enhanced violations list component with improved UX
 * @author RetailReady Team
 * @version 1.0.0
 */

import React from 'react';
import { AlertTriangle, DollarSign, Calendar, Building, Eye, EyeOff } from 'lucide-react';
import { Violation } from '../types';
import { SeverityBadge } from './ui/SeverityBadge';
import { CategoryBadge } from './ui/CategoryBadge';
import { LoadingSpinner } from './ui/LoadingSpinner';

/**
 * Component props
 */
interface ViolationsListProps {
  violations: Violation[];
  loading?: boolean;
  error?: string | null;
  onViolationClick?: (violation: Violation) => void;
  showDetails?: boolean;
  className?: string;
}

/**
 * Individual violation card component
 */
interface ViolationCardProps {
  violation: Violation;
  onViolationClick?: (violation: Violation) => void;
  showDetails?: boolean;
}

/**
 * Violation Card Component
 * 
 * Displays individual violation information in a card format.
 * 
 * @param violation - Violation data to display
 * @param onViolationClick - Callback when violation is clicked
 * @param showDetails - Whether to show detailed information
 * @returns JSX element
 */
const ViolationCard: React.FC<ViolationCardProps> = ({
  violation,
  onViolationClick,
  showDetails = true
}) => {
  const handleClick = () => {
    if (onViolationClick) {
      onViolationClick(violation);
    }
  };

  return (
    <div
      className={`
        border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200
        ${onViolationClick ? 'cursor-pointer hover:border-blue-300' : ''}
      `}
      onClick={handleClick}
      role={onViolationClick ? 'button' : undefined}
      tabIndex={onViolationClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onViolationClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {violation.requirement}
          </h3>
          <p className="text-gray-600 mb-3 line-clamp-2">
            <strong>Violation:</strong> {violation.violation}
          </p>
        </div>
        
        <div className="flex flex-col items-end space-y-2 ml-4">
          <SeverityBadge severity={violation.severity} showIcon={true} size="md" />
          <CategoryBadge category={violation.category} size="md" />
        </div>
      </div>

      {/* Details Grid */}
      {showDetails && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="truncate">
              <strong>Fine:</strong> {violation.fine}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Building className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="truncate">
              <strong>Retailer:</strong> {violation.retailer}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span className="truncate">
              <strong>Added:</strong> {new Date(violation.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            ID: #{violation.id}
          </div>
          <div className="text-sm text-gray-500">
            Risk Level: {violation.severity === 'High' ? 'High Risk' : 
                       violation.severity === 'Medium' ? 'Medium Risk' : 
                       'Low Risk'}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Empty State Component
 * 
 * Displays when no violations are found.
 * 
 * @param violations - Array of violations to determine message
 * @returns JSX element
 */
const EmptyState: React.FC<{ violations: Violation[] }> = ({ violations }) => (
  <div className="text-center py-12">
    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">No violations found</h3>
    <p className="text-gray-500">
      {violations.length === 0 
        ? "Upload a compliance guide to get started, or adjust your filters."
        : "Try adjusting your filters to see more results."
      }
    </p>
  </div>
);

/**
 * Error State Component
 * 
 * Displays when there's an error loading violations.
 * 
 * @param error - Error message to display
 * @returns JSX element
 */
const ErrorState: React.FC<{ error: string }> = ({ error }) => (
  <div className="text-center py-12">
    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-red-900 mb-2">Error loading violations</h3>
    <p className="text-red-600">{error}</p>
  </div>
);

/**
 * Violations List Component
 * 
 * Displays a list of compliance violations with enhanced functionality.
 * 
 * @param violations - Array of violations to display
 * @param loading - Whether the component is in loading state
 * @param error - Error message if any
 * @param onViolationClick - Callback when a violation is clicked
 * @param showDetails - Whether to show detailed information
 * @param className - Additional CSS classes
 * @returns JSX element
 * 
 * @example
 * <ViolationsList 
 *   violations={violations} 
 *   loading={loading}
 *   onViolationClick={(violation) => console.log(violation)}
 * />
 */
export const ViolationsList: React.FC<ViolationsListProps> = ({
  violations,
  loading = false,
  error = null,
  onViolationClick,
  showDetails = true,
  className = ''
}) => {
  // Show loading state
  if (loading) {
    return (
      <div className={`flex justify-center py-12 ${className}`}>
        <LoadingSpinner size="lg" text="Loading violations..." />
      </div>
    );
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} />;
  }

  // Show empty state
  if (violations.length === 0) {
    return <EmptyState violations={violations} />;
  }

  // Show violations list
  return (
    <div className={`space-y-4 ${className}`}>
      {violations.map((violation) => (
        <ViolationCard
          key={violation.id}
          violation={violation}
          onViolationClick={onViolationClick}
          showDetails={showDetails}
        />
      ))}
    </div>
  );
};
