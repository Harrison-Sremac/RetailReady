/**
 * Compliance Page Component
 * 
 * Page for viewing and filtering compliance requirements and violations.
 * 
 * @fileoverview Compliance requirements and violations page
 * @author RetailReady Team
 * @version 1.0.0
 */

import { useState, useMemo } from 'react';
import { Filters } from '../types';
import { FilterBar } from '../components/FilterBar';
import { ViolationsList } from '../components/ViolationsList';
import { useApp } from '../contexts/AppContext';

/**
 * Compliance Page Component
 * 
 * Provides comprehensive view of compliance requirements with filtering capabilities.
 * 
 * @returns JSX element
 */
export function CompliancePage() {
  const { violations, loading, error, apiConnected } = useApp();
  const [filters, setFilters] = useState<Filters>({
    category: '',
    severity: '',
    retailer: ''
  });

  // Filter violations based on current filters
  const filteredViolations = useMemo(() => {
    let filtered = violations;

    if (filters.category) {
      filtered = filtered.filter(v => v.category === filters.category);
    }
    
    if (filters.severity) {
      filtered = filtered.filter(v => v.severity === filters.severity);
    }
    
    if (filters.retailer) {
      filtered = filtered.filter(v => v.retailer === filters.retailer);
    }

    return filtered;
  }, [violations, filters]);

  // Get unique values for filter options
  const categories = useMemo(() => [...new Set(violations.map(v => v.category))], [violations]);
  // const severities = useMemo(() => [...new Set(violations.map(v => v.severity))], [violations]);
  // const retailers = useMemo(() => [...new Set(violations.map(v => v.retailer))], [violations]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Compliance Data</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compliance Requirements</h1>
          <p className="text-gray-600">Browse and filter compliance requirements and violations</p>
          <div className="mt-2 flex items-center space-x-4">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              apiConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {apiConnected ? '✓ Backend Connected' : '✗ Backend Disconnected'}
            </span>
            <span className="text-sm text-gray-500">
              {filteredViolations.length} of {violations.length} requirements shown
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">!</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <p className="text-xs text-red-600 mt-2">
                  Make sure the backend server is running on port 3001
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Filter Requirements</h2>
          <FilterBar 
            filters={filters}
            onFilterChange={setFilters}
            categories={categories}
          />
        </div>

        {/* Violations List */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Compliance Requirements</h2>
            <span className="text-sm text-gray-500">
              {filteredViolations.length} of {violations.length} requirements
            </span>
          </div>
          
          <ViolationsList violations={filteredViolations} />
        </div>
      </main>
    </div>
  );
}
