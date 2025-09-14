/**
 * Violations Data Hook
 * 
 * This hook manages violations data fetching, filtering, and state management.
 * It provides a clean interface for components to interact with violations data.
 * 
 * @fileoverview Custom hook for violations data management
 * @author RetailReady Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Violation, Filters } from '../types';
import { violationsApi } from '../utils/api';
import { ERROR_MESSAGES } from '../utils/constants';

/**
 * Hook return type
 */
interface UseViolationsReturn {
  violations: Violation[];
  filteredViolations: Violation[];
  loading: boolean;
  error: string | null;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  refreshViolations: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for managing violations data
 * 
 * @param initialFilters - Initial filter values
 * @returns Object with violations data and management functions
 * 
 * @example
 * const {
 *   violations,
 *   filteredViolations,
 *   loading,
 *   error,
 *   filters,
 *   setFilters,
 *   refreshViolations
 * } = useViolations();
 */
export function useViolations(initialFilters: Filters = {
  category: '',
  severity: '',
  retailer: ''
}): UseViolationsReturn {
  // State management
  const [violations, setViolations] = useState<Violation[]>([]);
  const [filteredViolations, setFilteredViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<Filters>(initialFilters);

  /**
   * Fetch violations from API
   */
  const fetchViolations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await violationsApi.getAll(filters);
      
      if (response.success && response.data) {
        setViolations(response.data);
      } else {
        setError(response.error || ERROR_MESSAGES.NO_DATA_FOUND);
        setViolations([]);
      }
    } catch (err) {
      console.error('Error fetching violations:', err);
      setError(ERROR_MESSAGES.NETWORK_ERROR);
      setViolations([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Apply filters to violations
   */
  const applyFilters = useCallback((violationsList: Violation[], currentFilters: Filters) => {
    let filtered = violationsList;

    if (currentFilters.category) {
      filtered = filtered.filter(v => v.category === currentFilters.category);
    }
    
    if (currentFilters.severity) {
      filtered = filtered.filter(v => v.severity === currentFilters.severity);
    }
    
    if (currentFilters.retailer) {
      filtered = filtered.filter(v => v.retailer === currentFilters.retailer);
    }

    return filtered;
  }, []);

  /**
   * Set filters and update filtered violations
   */
  const setFilters = useCallback((newFilters: Filters) => {
    setFiltersState(newFilters);
  }, []);

  /**
   * Refresh violations data
   */
  const refreshViolations = useCallback(async () => {
    await fetchViolations();
  }, [fetchViolations]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch violations on mount and when filters change
  useEffect(() => {
    fetchViolations();
  }, [fetchViolations]);

  // Update filtered violations when violations or filters change
  useEffect(() => {
    const filtered = applyFilters(violations, filters);
    setFilteredViolations(filtered);
  }, [violations, filters, applyFilters]);

  return {
    violations,
    filteredViolations,
    loading,
    error,
    filters,
    setFilters,
    refreshViolations,
    clearError
  };
}
