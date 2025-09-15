/**
 * Application Context
 * 
 * Shared state management for the entire application to avoid
 * duplicate API calls and improve performance.
 * 
 * @fileoverview Global application state management
 * @author RetailReady Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Violation, ParsedRoutingGuideData } from '../types';
import { violationsApi } from '../utils/api';

interface AppContextType {
  violations: Violation[];
  loading: boolean;
  error: string | null;
  apiConnected: boolean;
  parsedRoutingGuideData: ParsedRoutingGuideData | null;
  setParsedRoutingGuideData: (data: ParsedRoutingGuideData | null) => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

/**
 * App Provider Component
 * 
 * Provides shared state and data fetching for the entire application.
 * This prevents duplicate API calls when navigating between pages.
 * 
 * @param children - React children components
 * @returns JSX element
 */
export function AppProvider({ children }: AppProviderProps) {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState(false);
  const [parsedRoutingGuideData, setParsedRoutingGuideData] = useState<ParsedRoutingGuideData | null>(null);

  // Fetch violations data once on app load
  const fetchViolations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await violationsApi.getAll({});
      if (response.success) {
        setApiConnected(true);
        setViolations(response.data || []);
      } else {
        setError('API returned an error');
        setApiConnected(false);
      }
    } catch (err) {
      console.error('API connection failed:', err);
      setError('Cannot connect to backend API');
      setApiConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data function for manual updates
  const refreshData = async () => {
    await fetchViolations();
  };

  // Load data on mount
  useEffect(() => {
    fetchViolations();
  }, []);

  const value: AppContextType = {
    violations,
    loading,
    error,
    apiConnected,
    parsedRoutingGuideData,
    setParsedRoutingGuideData,
    refreshData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook to use the app context
 * 
 * @returns App context value
 * @throws Error if used outside of AppProvider
 */
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
