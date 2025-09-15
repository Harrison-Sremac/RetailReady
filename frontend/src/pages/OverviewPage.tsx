/**
 * Overview Page Component
 * 
 * Dashboard page with quick stats, upload functionality, and recent activity.
 * 
 * @fileoverview Main dashboard overview page
 * @author RetailReady Team
 * @version 1.0.0
 */

import { UploadZone } from '../components/UploadZone';
import { useApp } from '../contexts/AppContext';

/**
 * Overview Page Component
 * 
 * Provides a dashboard view with key metrics and quick access to main features.
 * 
 * @returns JSX element
 */
export function OverviewPage() {
  const { violations, loading, error, apiConnected, setParsedRoutingGuideData, refreshData } = useApp();

  // Handle successful file upload
  const handleUploadSuccess = async (data?: any) => {
    try {
      if (data) {
        setParsedRoutingGuideData(data);
      }
      // Refresh violations data
      await refreshData();
    } catch (err) {
      console.error('Error refreshing data after upload:', err);
    }
  };

  // Handle clearing uploaded data
  const handleClearUploadedData = async () => {
    if (!confirm('Are you sure you want to delete all uploaded data? This will clear violations and worker scan data. This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/violations/clear-all-uploaded', {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Data cleared successfully! Cleared ${result.total_cleared} total records (${result.violations_cleared} violations, ${result.scans_cleared} worker scans)`);
        // Refresh violations data
        await refreshData();
      } else {
        const errorData = await response.json();
        alert(`Failed to clear data: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Clear data error:', error);
      alert('Failed to clear data. Please check your connection and try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome to RetailReady compliance management</p>
          <div className="mt-2 flex items-center space-x-4">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              apiConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {apiConnected ? '✓ Backend Connected' : '✗ Backend Disconnected'}
            </span>
            <span className="text-sm text-gray-500">
              {violations.length} compliance requirements loaded
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


        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload Compliance Guide</h2>
          <UploadZone onUploadSuccess={handleUploadSuccess} />
          
          {/* Clear Uploaded Data Button */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleClearUploadedData}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Clear All Uploaded Data
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Remove all uploaded compliance data and worker scan history
            </p>
          </div>
        </div>


      </main>
    </div>
  );
}
