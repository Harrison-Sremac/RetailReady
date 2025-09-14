/**
 * Risk Calculation Hook
 * 
 * This hook manages risk calculation functionality including
 * violation selection, unit input, and calculation results.
 * 
 * @fileoverview Custom hook for risk calculation management
 * @author RetailReady Team
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { Violation, RiskCalculation } from '../types';
import { riskApi } from '../utils/api';
import { ERROR_MESSAGES, RISK_CONFIG } from '../utils/constants';

/**
 * Hook return type
 */
interface UseRiskCalculationReturn {
  selectedViolationId: number | null;
  units: number;
  calculation: RiskCalculation | null;
  loading: boolean;
  error: string | null;
  setSelectedViolationId: (id: number | null) => void;
  setUnits: (units: number) => void;
  calculateRisk: () => Promise<void>;
  clearCalculation: () => void;
  clearError: () => void;
  isValidInput: boolean;
}

/**
 * Custom hook for managing risk calculations
 * 
 * @param violations - Array of available violations
 * @returns Object with risk calculation state and functions
 * 
 * @example
 * const {
 *   selectedViolationId,
 *   units,
 *   calculation,
 *   loading,
 *   calculateRisk,
 *   setSelectedViolationId,
 *   setUnits
 * } = useRiskCalculation(violations);
 */
export function useRiskCalculation(violations: Violation[]): UseRiskCalculationReturn {
  // State management
  const [selectedViolationId, setSelectedViolationId] = useState<number | null>(null);
  const [units, setUnits] = useState<number>(RISK_CONFIG.DEFAULT_UNITS);
  const [calculation, setCalculation] = useState<RiskCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate input parameters
   */
  const isValidInput = selectedViolationId !== null && 
                      units >= RISK_CONFIG.MIN_UNITS && 
                      units <= RISK_CONFIG.MAX_UNITS;

  /**
   * Set selected violation ID
   */
  const handleSetSelectedViolationId = useCallback((id: number | null) => {
    setSelectedViolationId(id);
    setError(null);
  }, []);

  /**
   * Set units value
   */
  const handleSetUnits = useCallback((newUnits: number) => {
    // Clamp units to valid range
    const clampedUnits = Math.max(
      RISK_CONFIG.MIN_UNITS, 
      Math.min(RISK_CONFIG.MAX_UNITS, newUnits)
    );
    setUnits(clampedUnits);
    setError(null);
  }, []);

  /**
   * Calculate risk for selected violation
   */
  const calculateRisk = useCallback(async () => {
    if (!isValidInput) {
      setError('Please select a violation and enter valid units');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await riskApi.calculateScore(selectedViolationId!, units);
      
      if (response.success && response.data) {
        setCalculation(response.data);
      } else {
        setError(response.error || ERROR_MESSAGES.CALCULATION_FAILED);
        setCalculation(null);
      }
    } catch (err) {
      console.error('Risk calculation error:', err);
      setError(ERROR_MESSAGES.CALCULATION_FAILED);
      setCalculation(null);
    } finally {
      setLoading(false);
    }
  }, [selectedViolationId, units, isValidInput]);

  /**
   * Clear calculation results
   */
  const clearCalculation = useCallback(() => {
    setCalculation(null);
    setError(null);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    selectedViolationId,
    units,
    calculation,
    loading,
    error,
    setSelectedViolationId: handleSetSelectedViolationId,
    setUnits: handleSetUnits,
    calculateRisk,
    clearCalculation,
    clearError,
    isValidInput
  };
}
