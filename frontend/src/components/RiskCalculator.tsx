/**
 * Risk Calculator Component (Refactored)
 * 
 * This component provides an enhanced risk assessment calculator with
 * improved UX, better error handling, and more comprehensive features.
 * 
 * @fileoverview Enhanced risk calculator component with improved functionality
 * @author RetailReady Team
 * @version 1.0.0
 */

import React from 'react';
import { Calculator, AlertTriangle, DollarSign, TrendingUp, Info, RefreshCw } from 'lucide-react';
import { Violation } from '../types';
import { useRiskCalculation } from '../hooks/useRiskCalculation';
import { SeverityBadge } from './ui/SeverityBadge';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { RISK_CONFIG, ERROR_MESSAGES } from '../utils/constants';

/**
 * Component props
 */
interface RiskCalculatorProps {
  violations: Violation[];
  onCalculationComplete?: (calculation: any) => void;
  className?: string;
}

/**
 * Risk Assessment Result Component
 * 
 * Displays the results of a risk calculation.
 * 
 * @param calculation - Risk calculation result
 * @returns JSX element
 */
const RiskAssessmentResult: React.FC<{ calculation: any }> = ({ calculation }) => {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Risk Assessment */}
      <div className={`p-4 rounded-lg border ${getRiskColor(calculation.riskLevel)}`}>
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-semibold">Risk Assessment</span>
        </div>
        <div className="text-2xl font-bold mb-1">
          ${calculation.estimatedFine.toLocaleString()}
        </div>
        <div className="text-sm mb-2">
          Potential exposure for {calculation.units} units
        </div>
        {calculation.riskPercentage !== undefined && (
          <div className="text-sm font-medium">
            Risk Level: {calculation.riskPercentage.toFixed(1)}%
          </div>
        )}
      </div>

      {/* Calculation Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Calculation Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Violation:</span>
            <span className="font-medium text-right max-w-xs truncate">
              {calculation.violation.violation}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Fine Structure:</span>
            <span className="font-medium text-right max-w-xs truncate">
              {calculation.violation.fine}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Severity:</span>
            <SeverityBadge severity={calculation.severity} size="sm" />
          </div>
          <div className="flex justify-between">
            <span>Risk Level:</span>
            <span className={`font-medium px-2 py-1 rounded text-xs ${getRiskColor(calculation.riskLevel)}`}>
              {calculation.riskLevel}
            </span>
          </div>
          {calculation.riskPercentage !== undefined && (
            <div className="flex justify-between">
              <span>Risk Percentage:</span>
              <span className="font-medium">
                {calculation.riskPercentage.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Risk Factors */}
      {calculation.riskFactors && calculation.riskFactors.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Risk Factors</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            {calculation.riskFactors.map((factor: string, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Violation Selector Component
 * 
 * Provides a dropdown for selecting violations.
 * 
 * @param violations - Array of available violations
 * @param selectedId - Currently selected violation ID
 * @param onSelectionChange - Callback when selection changes
 * @returns JSX element
 */
const ViolationSelector: React.FC<{
  violations: Violation[];
  selectedId: number | null;
  onSelectionChange: (id: number | null) => void;
}> = ({ violations, selectedId, onSelectionChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Select Violation
    </label>
    <select
      value={selectedId || ''}
      onChange={(e) => onSelectionChange(Number(e.target.value) || null)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="">Choose a violation...</option>
      {violations.map((violation) => (
        <option key={violation.id} value={violation.id}>
          {violation.category}: {violation.violation}
        </option>
      ))}
    </select>
  </div>
);

/**
 * Units Input Component
 * 
 * Provides input for number of units.
 * 
 * @param units - Current units value
 * @param onUnitsChange - Callback when units change
 * @returns JSX element
 */
const UnitsInput: React.FC<{
  units: number;
  onUnitsChange: (units: number) => void;
}> = ({ units, onUnitsChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Shipment Size (units)
    </label>
    <input
      type="number"
      min={RISK_CONFIG.MIN_UNITS}
      max={RISK_CONFIG.MAX_UNITS}
      value={units}
      onChange={(e) => onUnitsChange(Number(e.target.value))}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Enter number of units"
    />
    <p className="text-xs text-gray-500 mt-1">
      Range: {RISK_CONFIG.MIN_UNITS} - {RISK_CONFIG.MAX_UNITS.toLocaleString()} units
    </p>
  </div>
);

/**
 * Top Risks Summary Component
 * 
 * Displays a summary of the highest risk violations.
 * 
 * @param violations - Array of violations to analyze
 * @returns JSX element
 */
const TopRisksSummary: React.FC<{ violations: Violation[] }> = ({ violations }) => {
  const getTopRisks = () => {
    const highRiskViolations = violations.filter(v => v.severity === 'High');
    return highRiskViolations.slice(0, 3);
  };

  const topRisks = getTopRisks();

  if (topRisks.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center space-x-2 mb-3">
        <TrendingUp className="w-5 h-5 text-gray-600" />
        <h4 className="font-medium text-gray-900">Top Risk Areas</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topRisks.map((violation, index) => (
          <div key={violation.id} className="bg-white p-3 rounded border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">
                #{index + 1} Risk
              </span>
              <SeverityBadge severity={violation.severity} size="sm" />
            </div>
            <div className="text-sm text-gray-600 mb-1">
              {violation.category}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {violation.fine}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Risk Calculator Component
 * 
 * Enhanced risk assessment calculator with improved UX and functionality.
 * 
 * @param violations - Array of available violations
 * @param onCalculationComplete - Callback when calculation is complete
 * @param className - Additional CSS classes
 * @returns JSX element
 * 
 * @example
 * <RiskCalculator 
 *   violations={violations}
 *   onCalculationComplete={(calc) => console.log(calc)}
 * />
 */
export const RiskCalculator: React.FC<RiskCalculatorProps> = ({
  violations,
  onCalculationComplete,
  className = ''
}) => {
  const {
    selectedViolationId,
    units,
    calculation,
    loading,
    error,
    setSelectedViolationId,
    setUnits,
    calculateRisk,
    clearCalculation,
    clearError,
    isValidInput
  } = useRiskCalculation(violations);

  // Handle calculation completion
  React.useEffect(() => {
    if (calculation && onCalculationComplete) {
      onCalculationComplete(calculation);
    }
  }, [calculation, onCalculationComplete]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Calculator Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <ViolationSelector
            violations={violations}
            selectedId={selectedViolationId}
            onSelectionChange={setSelectedViolationId}
          />

          <UnitsInput
            units={units}
            onUnitsChange={setUnits}
          />

          <button
            onClick={calculateRisk}
            disabled={!isValidInput || loading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              <Calculator className="w-4 h-4" />
            )}
            <span>{loading ? 'Calculating...' : 'Calculate Risk'}</span>
          </button>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
              <button
                onClick={clearError}
                className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {calculation ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Risk Assessment</h3>
                <button
                  onClick={clearCalculation}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              </div>
              <RiskAssessmentResult calculation={calculation} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <Calculator className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a violation and enter units to calculate risk</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Risks Summary */}
      <TopRisksSummary violations={violations} />
    </div>
  );
};
