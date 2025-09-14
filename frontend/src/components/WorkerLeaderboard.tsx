/**
 * Worker Leaderboard Component
 * 
 * Displays worker performance metrics and leaderboard for managers
 * to track compliance performance and identify training needs.
 * 
 * @fileoverview Worker performance tracking and leaderboard
 * @author RetailReady Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';

interface Worker {
  id: string;
  name: string;
  department: string;
}

interface WorkerPerformance {
  totalScans: number;
  completedScans: number;
  violationsPrevented: number;
  violationsOccurred: number;
  totalFineSaved: number;
  totalFineIncurred: number;
  accuracyRate: number;
}

interface WorkerWithPerformance extends Worker {
  performance: WorkerPerformance;
}

interface LeaderboardEntry {
  rank: number;
  worker: Worker;
  performance: WorkerPerformance;
}

/**
 * Worker Leaderboard Component
 * 
 * Shows real-time worker performance metrics and leaderboard
 * to help managers track compliance and identify training needs.
 * 
 * @returns JSX element
 */
function WorkerLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeframe, setTimeframe] = useState<string>('today');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch leaderboard data
   */
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/worker/leaderboard?timeframe=${timeframe}`);
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.data.leaderboard);
      } else {
        setError(data.message || 'Failed to load leaderboard');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch leaderboard on component mount and timeframe change
   */
  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  /**
   * Handle timeframe change
   */
  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
  };

  /**
   * Get performance badge color based on accuracy rate
   */
  const getPerformanceBadgeColor = (accuracyRate: number) => {
    if (accuracyRate >= 95) return 'bg-green-100 text-green-800';
    if (accuracyRate >= 85) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  /**
   * Get common mistakes for a worker (mock data for now)
   */
  const getCommonMistakes = (worker: Worker): string[] => {
    // This would be calculated from actual violation data
    const mockMistakes: { [key: string]: string[] } = {
      'maria123': ['Label placement errors'],
      'john456': ['Box size selection'],
      'sarah789': ['Packaging protection']
    };
    return mockMistakes[worker.id] || [];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading worker data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">!</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Worker Performance</h2>
        
        {/* Timeframe selector */}
        <div className="flex space-x-2">
          {['today', 'week', 'month'].map((period) => (
            <button
              key={period}
              onClick={() => handleTimeframeChange(period)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeframe === period
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {leaderboard.reduce((sum, entry) => sum + entry.performance.totalScans, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Scans</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            ${leaderboard.reduce((sum, entry) => sum + entry.performance.totalFineSaved, 0).toFixed(0)}
          </div>
          <div className="text-sm text-gray-600">Fines Prevented</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {leaderboard.reduce((sum, entry) => sum + entry.performance.violationsOccurred, 0)}
          </div>
          <div className="text-sm text-gray-600">Violations</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {leaderboard.length > 0 
              ? Math.round(leaderboard.reduce((sum, entry) => sum + entry.performance.accuracyRate, 0) / leaderboard.length)
              : 0}%
          </div>
          <div className="text-sm text-gray-600">Avg Accuracy</div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Worker Leaderboard</h3>
        
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No worker data available for {timeframe} timeframe</p>
            <p className="text-sm mt-2">Workers need to scan orders to appear here</p>
          </div>
        ) : (
          leaderboard.map((entry) => {
            const commonMistakes = getCommonMistakes(entry.worker);
            
            return (
              <div key={entry.worker.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        entry.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                        entry.rank === 2 ? 'bg-gray-100 text-gray-800' :
                        entry.rank === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {entry.rank}
                      </div>
                    </div>
                    
                    {/* Worker info */}
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{entry.worker.name}</h4>
                      <p className="text-sm text-gray-600">{entry.worker.department}</p>
                    </div>
                  </div>
                  
                  {/* Performance metrics */}
                  <div className="text-right">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {entry.performance.totalScans}
                        </div>
                        <div className="text-xs text-gray-500">scans</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold px-2 py-1 rounded text-xs ${
                          getPerformanceBadgeColor(entry.performance.accuracyRate)
                        }`}>
                          {entry.performance.accuracyRate}%
                        </div>
                        <div className="text-xs text-gray-500">accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          ${entry.performance.totalFineSaved.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-500">saved</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Training recommendations */}
                {commonMistakes.length > 0 && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded text-xs">
                    <p className="font-semibold text-yellow-800">Needs training on:</p>
                    <p className="text-yellow-700">{commonMistakes[0]}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Refresh button */}
      <div className="mt-6 text-center">
        <button
          onClick={fetchLeaderboard}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
}

export default WorkerLeaderboard;
