/**
 * Main Application Component (Refactored)
 * 
 * This is the main application component with enhanced architecture,
 * better state management, and improved user experience.
 * 
 * @fileoverview Enhanced main application component
 * @author RetailReady Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { UploadZone } from './components/UploadZone';
import { ViolationsList } from './components/ViolationsList';
import { RiskCalculator } from './components/RiskCalculator';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { DatabaseView } from './components/DatabaseView';
import { WorkerLeaderboard } from './components/WorkerLeaderboard';
import { Violation, Filters } from './types';
import { useViolations } from './hooks/useViolations';
import { violationsApi } from './utils/api';
import { APP_METADATA } from './utils/constants';

/**
 * Application state interface
 */
interface AppState {
  categories: string[];
  retailers: string[];
  selectedViolation: Violation | null;
  showDatabaseView: boolean;
}

/**
 * Main Application Component
 * 
 * Enhanced application with improved architecture and user experience.
 * 
 * @returns JSX element
 * 
 * @example
 * <App />
 */
function App() {
  // Custom hooks for data management
  const {
    violations,
    filteredViolations,
    loading: violationsLoading,
    error: violationsError,
    filters,
    setFilters,
    refreshViolations,
    clearError: clearViolationsError
  } = useViolations();

  // Local state
  const [appState, setAppState] = useState<AppState>({
    categories: [],
    retailers: [],
    selectedViolation: null,
    showDatabaseView: false
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch categories and retailers on component mount
   */
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [categoriesResponse, retailersResponse] = await Promise.all([
          violationsApi.getCategories(),
          violationsApi.getRetailers()
        ]);

        if (categoriesResponse.success && categoriesResponse.data) {
          setAppState(prev => ({ ...prev, categories: categoriesResponse.data }));
        }

        if (retailersResponse.success && retailersResponse.data) {
          setAppState(prev => ({ ...prev, retailers: retailersResponse.data }));
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load application data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  /**
   * Handle successful file upload
   */
  const handleUploadSuccess = async () => {
    try {
      // Refresh violations data
      await refreshViolations();
      
      // Refresh categories and retailers
      const [categoriesResponse, retailersResponse] = await Promise.all([
        violationsApi.getCategories(),
        violationsApi.getRetailers()
      ]);

      if (categoriesResponse.success && categoriesResponse.data) {
        setAppState(prev => ({ ...prev, categories: categoriesResponse.data }));
      }

      if (retailersResponse.success && retailersResponse.data) {
        setAppState(prev => ({ ...prev, retailers: retailersResponse.data }));
      }
    } catch (err) {
      console.error('Error refreshing data after upload:', err);
    }
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  /**
   * Handle violation selection
   */
  const handleViolationClick = (violation: Violation) => {
    setAppState(prev => ({ ...prev, selectedViolation: violation }));
  };

  /**
   * Handle risk calculation completion
   */
  const handleRiskCalculationComplete = (calculation: any) => {
    console.log('Risk calculation completed:', calculation);
    // Could store calculation history or trigger other actions
  };

  /**
   * Toggle database view
   */
  const toggleDatabaseView = () => {
    setAppState(prev => ({ ...prev, showDatabaseView: !prev.showDatabaseView }));
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading {APP_METADATA.NAME}</h2>
          <p className="text-gray-600">Please wait while we initialize the application...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Application Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Step 1: Upload Compliance Guide */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <h2 className="text-xl font-semibold">Upload Compliance Guide</h2>
            </div>
            <UploadZone onUploadSuccess={handleUploadSuccess} />
          </div>
        </section>

        {/* Step 2: Filter & Explore */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <h2 className="text-xl font-semibold">Filter & Explore</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Filters */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Requirements</h3>
                <FilterBar 
                  categories={appState.categories}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </div>
              
              {/* Database View & Quick Stats */}
              <div className="space-y-4">
                {/* Database View Toggle */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Database View</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    View organized compliance data by retailer and category
                  </p>
                  <button
                    onClick={toggleDatabaseView}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {appState.showDatabaseView ? 'Hide' : 'Show'} Database View
                  </button>
                </div>
                
                {/* Quick Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Requirements:</span>
                      <span className="font-medium">{violations.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">High Risk:</span>
                      <span className="font-medium text-red-600">
                        {violations.filter(v => v.severity === 'High').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medium Risk:</span>
                      <span className="font-medium text-yellow-600">
                        {violations.filter(v => v.severity === 'Medium').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Low Risk:</span>
                      <span className="font-medium text-green-600">
                        {violations.filter(v => v.severity === 'Low').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Database View */}
        {appState.showDatabaseView && (
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <DatabaseView />
            </div>
          </section>
        )}

        {/* Worker Performance Tracking */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 font-semibold text-sm">👥</span>
              </div>
              <h2 className="text-xl font-semibold">Worker Performance Tracking</h2>
            </div>
            
            <WorkerLeaderboard />
          </div>
        </section>

        {/* Step 3: Risk Assessment Calculator */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <h2 className="text-xl font-semibold">Risk Assessment Calculator</h2>
            </div>
            
            <RiskCalculator 
              violations={filteredViolations}
              onCalculationComplete={handleRiskCalculationComplete}
            />
          </div>
        </section>

        {/* Step 4: Top Risk Areas */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">4</span>
              </div>
              <h2 className="text-xl font-semibold">Top Risk Areas</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {violations
                .filter(v => v.severity === 'High')
                .slice(0, 6)
                .map((violation, index) => (
                  <div key={violation.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-red-600 font-semibold text-sm mr-2">
                            #{index + 1} Risk:
                          </span>
                          <span className="text-red-800 font-medium">{violation.category}</span>
                        </div>
                        <p className="text-sm text-red-700 mb-1">{violation.requirement}</p>
                        <p className="text-sm font-medium text-red-800">{violation.fine}</p>
                      </div>
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                        High
                      </span>
                    </div>
                  </div>
                ))}
            </div>
            
            {violations.filter(v => v.severity === 'High').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No high-risk violations found</p>
                <p className="text-sm mt-2">Upload compliance documents to see risk areas</p>
              </div>
            )}
          </div>
        </section>

        {/* Step 5: Review Requirements */}
        <section>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">5</span>
              </div>
              <h2 className="text-xl font-semibold">Review Requirements</h2>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Compliance Requirements</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {filteredViolations.length} of {violations.length} requirements
                </span>
                {violationsError && (
                  <button
                    onClick={clearViolationsError}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Clear Error
                  </button>
                )}
              </div>
            </div>
            
            <ViolationsList 
              violations={filteredViolations}
              loading={violationsLoading}
              error={violationsError}
              onViolationClick={handleViolationClick}
            />
          </div>
        </section>

        {/* Selected Violation Details */}
        {appState.selectedViolation && (
          <section className="mt-8">
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Selected Violation Details
              </h3>
              <div className="space-y-2 text-sm">
                <div><strong>Requirement:</strong> {appState.selectedViolation.requirement}</div>
                <div><strong>Violation:</strong> {appState.selectedViolation.violation}</div>
                <div><strong>Fine:</strong> {appState.selectedViolation.fine}</div>
                <div><strong>Category:</strong> {appState.selectedViolation.category}</div>
                <div><strong>Severity:</strong> {appState.selectedViolation.severity}</div>
                <div><strong>Retailer:</strong> {appState.selectedViolation.retailer}</div>
              </div>
              <button
                onClick={() => setAppState(prev => ({ ...prev, selectedViolation: null }))}
                className="mt-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Close Details
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
