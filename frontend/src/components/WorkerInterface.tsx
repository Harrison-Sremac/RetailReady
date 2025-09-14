/**
 * Worker Interface Component
 * 
 * Simple, mobile-first interface for warehouse workers to scan orders
 * and receive real-time compliance guidance.
 * 
 * @fileoverview Mobile worker interface for real-time compliance guidance
 * @author RetailReady Team
 * @version 1.0.0
 */

import { useState } from 'react';

interface Worker {
  id: string;
  name: string;
  department: string;
}

interface GuidanceStep {
  step: number;
  instruction: string;
  visual: string;
  warning: string | null;
  nextAction: string;
  specificGuidance?: string;
}

interface WorkerPerformance {
  scansToday: number;
  accuracyRate: number;
  finesSaved: number;
  streak: number;
}

interface ScanResponse {
  scanId: number;
  worker: Worker;
  order: {
    barcode: string;
    type: string;
    retailer: string;
  };
  guidance: {
    currentStep: number;
    totalSteps: number;
    steps: GuidanceStep[];
    warnings: Array<{
      type: string;
      message: string;
      category: string;
    }>;
    visualGuides: string[];
  };
  performance: WorkerPerformance;
}

/**
 * Worker Interface Component
 * 
 * Provides a simple, mobile-first interface for warehouse workers
 * to scan orders and receive step-by-step compliance guidance.
 * 
 * @returns JSX element
 */
function WorkerInterface() {
  const [workerId, setWorkerId] = useState<string>('');
  const [orderBarcode, setOrderBarcode] = useState<string>('');
  const [currentScan, setCurrentScan] = useState<ScanResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  /**
   * Handle worker scan submission
   */
  const handleScan = async () => {
    if (!workerId || !orderBarcode) {
      setError('Please enter both Worker ID and Order Barcode');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/worker/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workerId,
          orderBarcode,
          retailer: "Dick's Sporting Goods",
          orderType: "Standard"
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentScan(data.data);
        setCurrentStepIndex(0);
      } else {
        setError(data.message || 'Failed to process scan');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Move to next step
   */
  const nextStep = () => {
    if (currentScan && currentStepIndex < currentScan.guidance.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  /**
   * Complete the scan
   */
  const completeScan = async () => {
    if (!currentScan) return;

    try {
      const response = await fetch(`http://localhost:3001/api/worker/scan/${currentScan.scanId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
          violationsPrevented: [],
          violationsOccurred: [],
          estimatedFineSaved: currentScan.performance.finesSaved + 250, // Example: prevented a fine
          estimatedFineIncurred: 0
        }),
      });

      if (response.ok) {
        // Reset for next scan
        setCurrentScan(null);
        setCurrentStepIndex(0);
        setOrderBarcode('');
      }
    } catch (err) {
      setError('Failed to complete scan');
    }
  };

  /**
   * Reset to start new scan
   */
  const startNewScan = () => {
    setCurrentScan(null);
    setCurrentStepIndex(0);
    setOrderBarcode('');
    setError(null);
  };

  // If we have a current scan, show the guidance interface
  if (currentScan) {
    const currentStep = currentScan.guidance.steps[currentStepIndex];
    const isLastStep = currentStepIndex === currentScan.guidance.steps.length - 1;

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        {/* Header with worker info */}
        <div className="bg-green-100 rounded-lg p-4 mb-6">
          <h1 className="text-xl font-bold text-green-800">
            Hi {currentScan.worker.name}!
          </h1>
          <p className="text-sm text-green-700">
            Order: {currentScan.order.type} to {currentScan.order.retailer}
          </p>
          <p className="text-xs text-green-600 mt-1">
            Order: {currentScan.order.barcode}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            {currentScan.guidance.steps.map((_, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index <= currentStepIndex
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Current step */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Visual guide */}
          <div className="bg-gray-100 rounded-lg h-48 mb-4 flex items-center justify-center overflow-hidden">
            {currentStep.visual ? (
              <img 
                src={`/worker-images/${currentStep.visual.endsWith('.png') ? currentStep.visual.replace('.png', '.svg') : currentStep.visual}`}
                alt="Compliance guidance visual"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  // Final fallback to emoji
                  e.currentTarget.style.display = 'none';
                  const fallbackDiv = document.createElement('div');
                  fallbackDiv.className = 'text-center text-gray-500';
                  fallbackDiv.innerHTML = '<div class="text-4xl mb-2">📦</div><p class="text-sm">Visual guide</p>';
                  e.currentTarget.parentNode?.appendChild(fallbackDiv);
                }}
              />
            ) : (
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📦</div>
                <p className="text-sm">Visual guide</p>
              </div>
            )}
          </div>

          {/* Instruction */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {currentStep.instruction}
          </h2>

          {/* Warning if present */}
          {currentStep.warning && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800 font-medium">{currentStep.warning}</p>
            </div>
          )}

          {/* Next action */}
          <p className="text-gray-600 mb-4">{currentStep.nextAction}</p>
          
          {/* Specific guidance if available */}
          {currentStep.specificGuidance && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>💡 Pro Tip:</strong> {currentStep.specificGuidance}
              </p>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={isLastStep ? completeScan : nextStep}
            className="w-full py-4 bg-blue-500 text-white text-lg font-bold rounded-lg hover:bg-blue-600 transition-colors"
          >
            {isLastStep ? '✓ Complete Order' : '✓ Done - Next Step'}
          </button>
        </div>

        {/* Performance stats */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="font-bold text-gray-900 mb-3">Today's Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {currentScan.performance.scansToday}
              </div>
              <div className="text-gray-600">orders correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {currentScan.performance.accuracyRate}%
              </div>
              <div className="text-gray-600">accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {currentScan.performance.streak}
              </div>
              <div className="text-gray-600">perfect streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${currentScan.performance.finesSaved}
              </div>
              <div className="text-gray-600">fines saved</div>
            </div>
          </div>
        </div>

        {/* Gamification */}
        <div className="text-center text-sm text-gray-600 mb-4">
          Streak: 🔥 {currentScan.performance.streak} perfect orders today!
        </div>

        {/* Start new scan button */}
        <button
          onClick={startNewScan}
          className="w-full py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Start New Scan
        </button>
      </div>
    );
  }

  // Initial scan interface
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            RetailReady
          </h1>
          <p className="text-gray-600">Worker Compliance Guide</p>
        </div>

        {/* Scan form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Scan Order
          </h2>

          {/* Worker ID input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Worker ID
            </label>
            <input
              type="text"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              placeholder="Enter your worker ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Order barcode input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Barcode
            </label>
            <input
              type="text"
              value={orderBarcode}
              onChange={(e) => setOrderBarcode(e.target.value)}
              placeholder="Scan or enter order barcode"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Scan button */}
          <button
            onClick={handleScan}
            disabled={loading || !workerId || !orderBarcode}
            className="w-full py-4 bg-blue-500 text-white text-lg font-bold rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : 'Scan Order'}
          </button>
        </div>

        {/* Quick worker IDs for demo */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-bold text-gray-900 mb-2">Demo Worker IDs:</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <div>• maria123 - Maria Rodriguez</div>
            <div>• john456 - John Smith</div>
            <div>• sarah789 - Sarah Johnson</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkerInterface;
