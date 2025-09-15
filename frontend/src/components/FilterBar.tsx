import React from 'react'
import { Filter, X } from 'lucide-react'
import { Filters } from '../types'

/**
 * Filter Bar Component Props
 */
interface FilterBarProps {
  /** Array of available categories for filtering */
  categories: string[]
  /** Array of available severities for filtering */
  severities: string[]
  /** Array of available retailers for filtering */
  retailers: string[]
  /** Current filter values */
  filters: Filters
  /** Callback function when filters change */
  onFiltersChange: (filters: Filters) => void
}

/**
 * Filter Bar Component
 * 
 * Provides filtering controls for compliance violations including category,
 * severity, and retailer filters. Displays active filters and allows clearing.
 * 
 * @fileoverview Filtering interface component for violations data
 * @author RetailReady Team
 * @version 1.0.0
 * 
 * @param props - Component props
 * @param props.categories - Available categories for filtering
 * @param props.filters - Current filter state
 * @param props.onFilterChange - Callback for filter changes
 * @returns JSX element containing filter controls
 * 
 * @example
 * <FilterBar 
 *   categories={['Labeling', 'ASN', 'Packaging']}
 *   filters={{ category: '', severity: '', retailer: '' }}
 *   onFilterChange={(filters) => setFilters(filters)}
 * />
 */
export const FilterBar: React.FC<FilterBarProps> = React.memo(({ 
  categories,
  severities,
  retailers,
  filters, 
  onFiltersChange 
}) => {

  /**
   * Handle category filter change
   * 
   * @param category - Selected category value
   */
  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, category })
  }

  /**
   * Handle severity filter change
   * 
   * @param severity - Selected severity value
   */
  const handleSeverityChange = (severity: string) => {
    onFiltersChange({ ...filters, severity })
  }

  /**
   * Handle retailer filter change
   * 
   * @param retailer - Selected retailer value
   */
  const handleRetailerChange = (retailer: string) => {
    onFiltersChange({ ...filters, retailer })
  }

  /**
   * Clear all active filters
   */
  const clearFilters = () => {
    onFiltersChange({ category: '', severity: '', retailer: '' })
  }

  const hasActiveFilters = filters.category || filters.severity || filters.retailer

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filters</h3>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Severity
          </label>
          <select
            value={filters.severity}
            onChange={(e) => handleSeverityChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Severities</option>
            {severities.map((severity) => (
              <option key={severity} value={severity}>
                {severity}
              </option>
            ))}
          </select>
        </div>

        {/* Retailer Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Retailer
          </label>
          <select
            value={filters.retailer}
            onChange={(e) => handleRetailerChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Retailers</option>
            {retailers.map((retailer) => (
              <option key={retailer} value={retailer}>
                {retailer}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Category: {filters.category}
              </span>
            )}
            {filters.severity && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Severity: {filters.severity}
              </span>
            )}
            {filters.retailer && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Retailer: {filters.retailer}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
});

