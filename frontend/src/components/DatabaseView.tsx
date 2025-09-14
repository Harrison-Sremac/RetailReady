/**
 * Database View Component
 * 
 * This component displays organized compliance data by retailer and category.
 * It shows summary statistics and allows drilling down into specific combinations.
 * 
 * @fileoverview Database view component for organized compliance data
 * @author RetailReady Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Building, Package, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';
import { violationsApi } from '../utils/api';
import { LoadingSpinner } from './ui/LoadingSpinner';

/**
 * Database view data structure
 */
interface DatabaseViewData {
  retailer: string;
  category: string;
  summary: {
    total_violations: number;
    severity_breakdown: {
      high: number;
      medium: number;
      low: number;
    };
  };
  details: {
    requirements: string[];
    violations: string[];
    fines: string[];
  };
  timestamps: {
    first_added: string;
    last_updated: string;
  };
}

/**
 * Database view response structure
 */
interface DatabaseViewResponse {
  message: string;
  total_components: number;
  data: DatabaseViewData[];
}

/**
 * Individual retailer/category card component
 */
interface DatabaseCardProps {
  data: DatabaseViewData;
  onViewDetails: (retailer: string, category: string) => void;
}

/**
 * Database Card Component
 * 
 * Displays individual retailer/category combination with summary statistics.
 * 
 * @param data - Database view data for this combination
 * @param onViewDetails - Callback when user wants to see details
 * @returns JSX element
 */
const DatabaseCard: React.FC<DatabaseCardProps> = ({ data, onViewDetails }) => {
  const { retailer, category, summary, timestamps } = data;
  
  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Building className="w-4 h-4 text-blue-600 mr-2" />
            <span className="font-semibold text-gray-900">{retailer}</span>
          </div>
          <div className="flex items-center mb-3">
            <Package className="w-4 h-4 text-purple-600 mr-2" />
            <span className="text-gray-700">{category}</span>
          </div>
        </div>
        <button
          onClick={() => onViewDetails(retailer, category)}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{summary.total_violations}</div>
          <div className="text-xs text-gray-500">Total Requirements</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{summary.severity_breakdown.high}</div>
          <div className="text-xs text-gray-500">High Risk</div>
        </div>
      </div>

      {/* Severity Breakdown */}
      <div className="flex space-x-2 mb-3">
        {summary.severity_breakdown.high > 0 && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor('high')}`}>
            {summary.severity_breakdown.high} High
          </span>
        )}
        {summary.severity_breakdown.medium > 0 && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor('medium')}`}>
            {summary.severity_breakdown.medium} Medium
          </span>
        )}
        {summary.severity_breakdown.low > 0 && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor('low')}`}>
            {summary.severity_breakdown.low} Low
          </span>
        )}
      </div>

      {/* Timestamps */}
      <div className="flex items-center text-xs text-gray-500">
        <Calendar className="w-3 h-3 mr-1" />
        <span>Updated: {new Date(timestamps.last_updated).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

/**
 * Database View Component
 * 
 * Displays organized compliance data by retailer and category.
 * 
 * @returns JSX element
 */
export const DatabaseView: React.FC = () => {
  const [data, setData] = useState<DatabaseViewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch database view data
   */
  useEffect(() => {
    const fetchDatabaseView = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching database view...');
        const response = await violationsApi.getDatabaseView();
        console.log('Database view response:', response);
        
        if (response.success && response.data) {
          console.log('Setting database view data:', response.data);
          // The backend returns { message, total_components, data: [...] }
          // So we need to access response.data.data for the actual array
          if (response.data.data && Array.isArray(response.data.data)) {
            setData(response.data.data);
          } else if (Array.isArray(response.data)) {
            // Fallback if response.data is directly the array
            setData(response.data);
          } else {
            console.error('Unexpected data structure:', response.data);
            setError('Unexpected data structure received');
          }
        } else {
          console.error('Database view response failed:', response);
          setError('Failed to load database view');
        }
      } catch (err) {
        console.error('Error fetching database view:', err);
        setError(`Failed to load database view: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDatabaseView();
  }, []);

  /**
   * Handle view details click
   */
  const handleViewDetails = (retailer: string, category: string) => {
    // For now, just log the details
    // In a full implementation, this could open a modal or navigate to a detailed view
    console.log('View details for:', retailer, category);
    alert(`Viewing details for ${retailer} - ${category}\n\nThis would show detailed requirements, violations, and fines for this specific combination.`);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading database view..." />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">Error loading database view</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Show empty state
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
        <p className="text-gray-500">Upload compliance documents to see organized data here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-blue-900">Database Overview</h3>
        </div>
        <p className="text-blue-700 text-sm">
          Organized by {data.length} retailer/category combinations • 
          Total requirements: {data.reduce((sum, item) => sum + item.summary.total_violations, 0)}
        </p>
      </div>

      {/* Database Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item, index) => (
          <DatabaseCard
            key={`${item.retailer}-${item.category}-${index}`}
            data={item}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>
    </div>
  );
};
