/**
 * Violation Matrix Heat Map Component
 * 
 * This component displays a visual heat map of violations with their
 * associated fine amounts for risk assessment.
 * 
 * @fileoverview Interactive violation matrix heat map
 * @author RetailReady Team
 * @version 1.0.0
 */

import React, { useState, useMemo } from 'react';
import { DollarSign, AlertTriangle, TrendingUp, Filter } from 'lucide-react';
import { Violation } from '../types';

/**
 * Component props
 */
interface ViolationMatrixHeatMapProps {
  violations: Violation[];
  onViolationSelect?: (violation: Violation) => void;
  className?: string;
}

/**
 * Heat Map Cell Component
 */
const HeatMapCell: React.FC<{
  violation: Violation;
  onClick?: () => void;
  isSelected?: boolean;
}> = ({ violation, onClick, isSelected = false }) => {
  const getFineAmount = (violation: Violation): number => {
    if (violation.fine_amount) return violation.fine_amount;
    
    // Extract numeric value from fine string
    const match = violation.fine.match(/\$?(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const fineAmount = getFineAmount(violation);
  
  // Determine color intensity based on fine amount
  const getColorClass = (amount: number, severity: string) => {
    if (severity === 'High' || amount >= 500) {
      return 'bg-red-500 hover:bg-red-600';
    } else if (severity === 'Medium' || amount >= 100) {
      return 'bg-yellow-500 hover:bg-yellow-600';
    } else {
      return 'bg-green-500 hover:bg-green-600';
    }
  };

  const colorClass = getColorClass(fineAmount, violation.severity);

  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-sm hover:shadow-md'
      } ${colorClass} text-white`}
      onClick={onClick}
    >
      <div className="text-center">
        <div className="text-lg font-bold">
          ${fineAmount > 0 ? fineAmount.toLocaleString() : 'N/A'}
        </div>
        <div className="text-xs opacity-90 mt-1">
          {violation.category}
        </div>
        <div className="text-xs opacity-75 mt-1 truncate">
          {violation.violation.length > 30 
            ? `${violation.violation.substring(0, 30)}...`
            : violation.violation
          }
        </div>
      </div>
    </div>
  );
};

/**
 * Filter Controls Component
 */
const FilterControls: React.FC<{
  violations: Violation[];
  onFilterChange: (filtered: Violation[]) => void;
}> = ({ violations, onFilterChange }) => {
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [fineRangeFilter, setFineRangeFilter] = useState<string>('All');

  const categories = useMemo(() => {
    const cats = [...new Set(violations.map(v => v.category))];
    return ['All', ...cats];
  }, [violations]);

  const applyFilters = () => {
    let filtered = violations;

    if (severityFilter !== 'All') {
      filtered = filtered.filter(v => v.severity === severityFilter);
    }

    if (categoryFilter !== 'All') {
      filtered = filtered.filter(v => v.category === categoryFilter);
    }

    if (fineRangeFilter !== 'All') {
      const [min, max] = fineRangeFilter.split('-').map(Number);
      filtered = filtered.filter(v => {
        const fineAmount = v.fine_amount || 0;
        if (max) {
          return fineAmount >= min && fineAmount <= max;
        } else {
          return fineAmount >= min;
        }
      });
    }

    onFilterChange(filtered);
  };

  React.useEffect(() => {
    applyFilters();
  }, [severityFilter, categoryFilter, fineRangeFilter, violations]);

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-4 h-4 text-gray-600" />
        <h3 className="font-medium text-gray-900">Filter Violations</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Severity
          </label>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Severities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fine Range
          </label>
          <select
            value={fineRangeFilter}
            onChange={(e) => setFineRangeFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Amounts</option>
            <option value="0-50">$0 - $50</option>
            <option value="51-100">$51 - $100</option>
            <option value="101-500">$101 - $500</option>
            <option value="501">$500+</option>
          </select>
        </div>
      </div>
    </div>
  );
};

/**
 * Violation Details Panel Component
 */
const ViolationDetailsPanel: React.FC<{
  violation: Violation | null;
  onClose: () => void;
}> = ({ violation, onClose }) => {
  if (!violation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Violation Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Violation Description</h3>
              <p className="text-gray-700">{violation.violation}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Requirement</h3>
              <p className="text-gray-700">{violation.requirement}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Fine Structure</h3>
                <p className="text-gray-700">{violation.fine}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Category</h3>
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {violation.category}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Severity</h3>
                <span className={`inline-block px-2 py-1 rounded text-sm ${
                  violation.severity === 'High' ? 'bg-red-100 text-red-800' :
                  violation.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {violation.severity}
                </span>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Responsible Party</h3>
                <p className="text-gray-700">{violation.responsible_party || 'Warehouse Worker'}</p>
              </div>
            </div>
            
            {violation.prevention_method && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Prevention Method</h3>
                <p className="text-gray-700">{violation.prevention_method}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Violation Matrix Heat Map Component
 */
export const ViolationMatrixHeatMap: React.FC<ViolationMatrixHeatMapProps> = ({
  violations,
  onViolationSelect,
  className = ''
}) => {
  const [filteredViolations, setFilteredViolations] = useState<Violation[]>(violations);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);

  React.useEffect(() => {
    setFilteredViolations(violations);
  }, [violations]);

  const handleViolationClick = (violation: Violation) => {
    setSelectedViolation(violation);
    if (onViolationSelect) {
      onViolationSelect(violation);
    }
  };

  const getStats = () => {
    const totalFines = filteredViolations.reduce((sum, v) => {
      const amount = v.fine_amount || 0;
      return sum + amount;
    }, 0);
    
    const avgFine = filteredViolations.length > 0 ? totalFines / filteredViolations.length : 0;
    const highRiskCount = filteredViolations.filter(v => v.severity === 'High').length;
    
    return { totalFines, avgFine, highRiskCount };
  };

  const stats = getStats();

  if (!violations || violations.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Violations Available</h3>
        <p className="text-gray-600">
          Upload a routing guide to see violation matrix and fine structures.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Violation Matrix Heat Map
        </h2>
        <p className="text-gray-600">
          Visual representation of violations with their associated fine amounts.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Total Fine Exposure</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            ${stats.totalFines.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Average Fine</span>
          </div>
          <div className="text-2xl font-bold text-green-900 mt-1">
            ${stats.avgFine.toFixed(0)}
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">High Risk Violations</span>
          </div>
          <div className="text-2xl font-bold text-red-900 mt-1">
            {stats.highRiskCount}
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <FilterControls 
        violations={violations}
        onFilterChange={setFilteredViolations}
      />

      {/* Heat Map Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredViolations.map((violation, index) => (
          <HeatMapCell
            key={index}
            violation={violation}
            onClick={() => handleViolationClick(violation)}
            isSelected={selectedViolation?.id === violation.id}
          />
        ))}
      </div>

      {filteredViolations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No violations match the current filters.</p>
        </div>
      )}

      {/* Violation Details Modal */}
      <ViolationDetailsPanel
        violation={selectedViolation}
        onClose={() => setSelectedViolation(null)}
      />
    </div>
  );
};
