/**
 * Risk Overview Demo Component
 * 
 * This component provides a demo interface for the Risk Overview feature.
 * It allows users to adjust contextual factors and see how they affect
 * risk predictions for order/worker combinations.
 * 
 * @fileoverview Risk overview demo component with interactive controls
 * @author RetailReady Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, User, Package, Clock, Calendar, Zap, RefreshCw, Info } from 'lucide-react';

/**
 * Risk overview result interface
 */
interface RiskOverviewResult {
  orderId: string;
  workerId: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number;
  factors: string[];
  recommendations: string[];
  timestamp: string;
}

/**
 * Mock data interface
 */
interface MockData {
  orders: Array<{
    id: string;
    itemCount: number;
    orderType: string;
    shippingDeadline: string;
    retailer: string;
    priority: string;
    description: string;
  }>;
  workers: Array<{
    id: string;
    name: string;
    pastViolations: number;
    experienceLevel: string;
    department: string;
    shiftPreference: string;
    description: string;
  }>;
  contextOptions: {
    timeOfDay: string[];
    dayOfWeek: string[];
    shiftLoad: string[];
    weatherCondition: string[];
    equipmentStatus: string[];
  };
}

/**
 * Risk Overview Demo Component
 * 
 * Provides an interactive demo for the Risk Overview feature with
 * adjustable contextual factors and real-time risk predictions.
 * 
 * @returns JSX element
 */
export const RiskOverviewDemo: React.FC = () => {
  const [mockData, setMockData] = useState<MockData | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string>('ORD-001');
  const [selectedWorker, setSelectedWorker] = useState<string>('johnny123');
  const [context, setContext] = useState({
    timeOfDay: 'Day',
    dayOfWeek: 'Wednesday',
    shiftLoad: 'Medium',
    weatherCondition: 'Clear',
    equipmentStatus: 'Operational'
  });
  const [result, setResult] = useState<RiskOverviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load mock data on component mount
  useEffect(() => {
    const loadMockData = async () => {
      try {
        const response = await fetch('/api/risk/overview/mock-data');
        const data = await response.json();
        if (data.success) {
          setMockData(data.data);
        } else {
          setError('Failed to load mock data');
        }
      } catch (err) {
        setError('Failed to connect to backend');
      }
    };

    loadMockData();
  }, []);

  // Calculate risk overview
  const calculateRiskOverview = async () => {
    if (!selectedOrder || !selectedWorker) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/risk/overview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder,
          workerId: selectedWorker,
          context: context
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message || 'Failed to calculate risk overview');
      }
    } catch (err) {
      setError('Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  // Get risk level color classes
  const getRiskLevelColor = (riskLevel: string) => {
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

  // Get risk level icon
  const getRiskLevelIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'Medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'Low':
        return <AlertTriangle className="w-5 h-5 text-green-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  if (!mockData) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-gray-400" />
          <p className="text-gray-500">Loading mock data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Risk Overview</h2>
          <p className="text-sm text-gray-600">Predict potential violations before they happen</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Configuration</h3>
          
          {/* Order Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="w-4 h-4 inline mr-1" />
              Select Order
            </label>
            <select
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {mockData.orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.id} - {order.description}
                </option>
              ))}
            </select>
            {mockData.orders.find(o => o.id === selectedOrder) && (
              <div className="mt-2 text-sm text-gray-600">
                <p><strong>Items:</strong> {mockData.orders.find(o => o.id === selectedOrder)?.itemCount}</p>
                <p><strong>Type:</strong> {mockData.orders.find(o => o.id === selectedOrder)?.orderType}</p>
                <p><strong>Priority:</strong> {mockData.orders.find(o => o.id === selectedOrder)?.priority}</p>
              </div>
            )}
          </div>

          {/* Worker Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Select Worker
            </label>
            <select
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {mockData.workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name} ({worker.experienceLevel})
                </option>
              ))}
            </select>
            {mockData.workers.find(w => w.id === selectedWorker) && (
              <div className="mt-2 text-sm text-gray-600">
                <p><strong>Experience:</strong> {mockData.workers.find(w => w.id === selectedWorker)?.experienceLevel}</p>
                <p><strong>Past Violations:</strong> {mockData.workers.find(w => w.id === selectedWorker)?.pastViolations}</p>
                <p><strong>Department:</strong> {mockData.workers.find(w => w.id === selectedWorker)?.department}</p>
              </div>
            )}
          </div>

          {/* Context Controls */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Contextual Factors</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Time of Day
                </label>
                <select
                  value={context.timeOfDay}
                  onChange={(e) => setContext(prev => ({ ...prev, timeOfDay: e.target.value }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {mockData.contextOptions.timeOfDay.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Day of Week
                </label>
                <select
                  value={context.dayOfWeek}
                  onChange={(e) => setContext(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {mockData.contextOptions.dayOfWeek.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  <Zap className="w-3 h-3 inline mr-1" />
                  Shift Load
                </label>
                <select
                  value={context.shiftLoad}
                  onChange={(e) => setContext(prev => ({ ...prev, shiftLoad: e.target.value }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {mockData.contextOptions.shiftLoad.map((load) => (
                    <option key={load} value={load}>{load}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Weather
                </label>
                <select
                  value={context.weatherCondition}
                  onChange={(e) => setContext(prev => ({ ...prev, weatherCondition: e.target.value }))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {mockData.contextOptions.weatherCondition.map((weather) => (
                    <option key={weather} value={weather}>{weather}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateRiskOverview}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>{loading ? 'Calculating...' : 'Calculate Risk Overview'}</span>
          </button>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Risk Assessment</h3>
          
          {result ? (
            <div className="space-y-4">
              {/* Risk Level Badge */}
              <div className={`p-4 rounded-lg border ${getRiskLevelColor(result.riskLevel)}`}>
                <div className="flex items-center space-x-2 mb-2">
                  {getRiskLevelIcon(result.riskLevel)}
                  <span className="font-semibold">Risk Level</span>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {result.riskLevel} Risk
                </div>
                <div className="text-sm">
                  Score: {result.riskScore} factors
                </div>
              </div>

              {/* Order & Worker Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Assignment Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span className="font-medium">{result.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Worker ID:</span>
                    <span className="font-medium">{result.workerId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Calculated:</span>
                    <span className="font-medium">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">Risk Factors</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  {result.factors.map((factor, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-3">Recommendations</h4>
                <ul className="space-y-1 text-sm text-green-800">
                  {result.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Configure settings and click calculate to see risk overview</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">How Risk Overview Works</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Rules-based prediction:</strong> Uses heuristic matching instead of ML training</li>
              <li>• <strong>Multi-factor analysis:</strong> Considers order size, worker history, time, and context</li>
              <li>• <strong>Real-time adjustment:</strong> Change contextual factors to see updated risk predictions</li>
              <li>• <strong>Proactive recommendations:</strong> Provides actionable suggestions to reduce risk</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
