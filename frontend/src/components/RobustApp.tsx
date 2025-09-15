import { useState, useEffect, useMemo } from 'react';
import { Violation, Filters, ParsedRoutingGuideData } from '../types';
import { violationsApi } from '../utils/api';
import Advertisement from './Advertisement';
import AdvertisementBanner from './AdvertisementBanner';
import SidebarAd from './SidebarAd';
import AdToggle from './AdToggle';
import { RoutingGuideViewer } from './RoutingGuideViewer';

/**
 * Robust App Component with Error Boundaries
 * This version handles API errors gracefully and provides fallbacks
 */
function RobustApp() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    category: '',
    severity: '',
    retailer: ''
  });
  const [riskCalculation, setRiskCalculation] = useState<{
    selectedViolation: string;
    quantity: number;
    frequency: string;
    results: any;
  } | null>(null);
  const [showAds, setShowAds] = useState(false);
  const [parsedRoutingGuideData, setParsedRoutingGuideData] = useState<ParsedRoutingGuideData | null>(null);

  // Test API connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await violationsApi.getAll({});
        if (response.success) {
          setApiConnected(true);
          setViolations(response.data || []);
        } else {
          setError('API returned an error');
        }
      } catch (err) {
        console.error('API connection failed:', err);
        setError('Cannot connect to backend API');
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  // Filter violations based on current filters
  const filteredViolations = useMemo(() => {
    let filtered = violations;

    if (filters.category) {
      filtered = filtered.filter(v => v.category === filters.category);
    }
    
    if (filters.severity) {
      filtered = filtered.filter(v => v.severity === filters.severity);
    }
    
    if (filters.retailer) {
      filtered = filtered.filter(v => v.retailer === filters.retailer);
    }

    return filtered;
  }, [violations, filters]);

  // Get unique values for filter options
  const categories = useMemo(() => [...new Set(violations.map(v => v.category))], [violations]);
  const severities = useMemo(() => [...new Set(violations.map(v => v.severity))], [violations]);
  const retailers = useMemo(() => [...new Set(violations.map(v => v.retailer))], [violations]);

  // Handle risk calculation
  const handleRiskCalculation = () => {
    const selectedViolationId = (document.querySelector('select[data-risk-violation]') as HTMLSelectElement)?.value;
    const quantity = parseInt((document.querySelector('input[data-risk-quantity]') as HTMLInputElement)?.value || '0');
    const frequency = (document.querySelector('select[data-risk-frequency]') as HTMLSelectElement)?.value;

    if (!selectedViolationId) {
      alert('Please select a violation to assess');
      return;
    }

    if (!quantity || quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    if (!frequency) {
      alert('Please select a frequency');
      return;
    }

    const violation = violations.find(v => v.id.toString() === selectedViolationId);
    if (!violation) {
      alert('Selected violation not found');
      return;
    }

    // Calculate risk score
    const severityMultiplier = violation.severity === 'High' ? 3 : violation.severity === 'Medium' ? 2 : 1;
    const frequencyMultiplier = parseInt(frequency);
    
    // Extract fine amount (basic parsing)
    const fineMatch = violation.fine.match(/\$(\d+)/);
    const baseFine = fineMatch ? parseInt(fineMatch[1]) : 100;
    
    const monthlyRisk = baseFine * quantity * frequencyMultiplier * severityMultiplier;
    const annualRisk = monthlyRisk * 12;
    
    const riskLevel = monthlyRisk > 10000 ? 'Critical' : 
                     monthlyRisk > 5000 ? 'High' : 
                     monthlyRisk > 2000 ? 'Medium' : 'Low';

    const results = {
      violation: violation,
      quantity: quantity,
      frequency: frequency,
      monthlyRisk: monthlyRisk,
      annualRisk: annualRisk,
      riskLevel: riskLevel,
      severityMultiplier: severityMultiplier,
      frequencyMultiplier: frequencyMultiplier,
      baseFine: baseFine
    };

    setRiskCalculation({
      selectedViolation: selectedViolationId,
      quantity: quantity,
      frequency: frequency,
      results: results
    });
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file.type.includes('pdf')) {
      alert('Please select a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const responseData = await response.json();
        alert('File uploaded successfully! The system will process it shortly.');
        
        // Set parsed routing guide data if available
        if (responseData.data) {
          setParsedRoutingGuideData(responseData.data);
        }
        
        // Refresh violations data
        const violationsResponse = await violationsApi.getAll({});
        if (violationsResponse.success && violationsResponse.data) {
          setViolations(violationsResponse.data);
        }
      } else {
        const errorData = await response.json();
        alert(`Upload failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please check your connection and try again.');
    }
  };

  const handleClearUploadedData = async () => {
    if (!confirm('Are you sure you want to delete all uploaded compliance data? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/violations/clear-uploaded', {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Uploaded data cleared successfully!');
        // Refresh violations data
        const violationsResponse = await violationsApi.getAll({});
        if (violationsResponse.success && violationsResponse.data) {
          setViolations(violationsResponse.data);
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to clear data: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Clear data error:', error);
      alert('Failed to clear data. Please check your connection and try again.');
    }
  };

  const toggleAds = () => {
    setShowAds(!showAds);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading RetailReady</h2>
          <p className="text-gray-600">Connecting to backend...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Advertisement Toggle - Top Right */}
      <div className="container mx-auto px-4 pt-2">
        <AdToggle showAds={showAds} onToggle={toggleAds} />
      </div>
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RetailReady</h1>
          <p className="text-gray-600">AI-powered compliance management and risk assessment platform</p>
          <div className="mt-2 flex items-center space-x-4">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              apiConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {apiConnected ? '✓ Backend Connected' : '✗ Backend Disconnected'}
            </span>
            <span className="text-sm text-gray-500">
              {filteredViolations.length} of {violations.length} requirements shown
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
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

        {/* Advertisement */}
        {showAds && <Advertisement />}

        {/* Step 1: Upload Compliance Guide */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <h2 className="text-xl font-semibold">Upload Compliance Guide</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Area */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Upload PDF Document</h3>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      handleFileUpload(files[0]);
                    }
                  }}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <div className="text-gray-400 text-4xl mb-4">📄</div>
                  <p className="text-gray-600 mb-2">Drag & drop your PDF here</p>
                  <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Choose File
                  </button>
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>Supported formats:</strong> PDF only</p>
                  <p><strong>Max file size:</strong> 10MB</p>
                  <p><strong>Supported content:</strong> Compliance guides, requirement documents</p>
                </div>
              </div>
              
              {/* Upload Status */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Status</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">📤</div>
                    <p className="text-gray-600">No files uploaded yet</p>
                    <p className="text-sm text-gray-500 mt-2">Upload a PDF to start parsing compliance requirements</p>
                  </div>
                </div>
                
                {/* Clear Uploaded Data Button */}
                <div className="mt-4">
                  <button
                    onClick={handleClearUploadedData}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    🗑️ Clear Uploaded Data
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Remove all compliance data from uploaded PDFs
                  </p>
                </div>
                
                {/* Sample Upload Results */}
                <div className="mt-4 bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">What happens after upload:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• PDF content is extracted and analyzed</li>
                    <li>• Compliance requirements are identified</li>
                    <li>• Violations and fines are cataloged</li>
                    <li>• Data is added to your compliance database</li>
                    <li>• Risk scores are calculated automatically</li>
                  </ul>
                </div>
              </div>
            </div>
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
              <div className="lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={filters.severity}
                      onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                    >
                      <option value="">All Severities</option>
                      {severities.map(severity => (
                        <option key={severity} value={severity}>{severity}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Retailer</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={filters.retailer}
                      onChange={(e) => setFilters(prev => ({ ...prev, retailer: e.target.value }))}
                    >
                      <option value="">All Retailers</option>
                      {retailers.map(retailer => (
                        <option key={retailer} value={retailer}>{retailer}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {(filters.category || filters.severity || filters.retailer) && (
                  <div className="mt-4 flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Active filters:</span>
                    {filters.category && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        Category: {filters.category}
                      </span>
                    )}
                    {filters.severity && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        Severity: {filters.severity}
                      </span>
                    )}
                    {filters.retailer && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        Retailer: {filters.retailer}
                      </span>
                    )}
                    <button
                      onClick={() => setFilters({ category: '', severity: '', retailer: '' })}
                      className="text-xs text-red-600 hover:text-red-800 underline"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Showing:</span>
                      <span className="font-medium">{filteredViolations.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">High Risk:</span>
                      <span className="font-medium text-red-600">
                        {filteredViolations.filter(v => v.severity === 'High').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medium Risk:</span>
                      <span className="font-medium text-yellow-600">
                        {filteredViolations.filter(v => v.severity === 'Medium').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Low Risk:</span>
                      <span className="font-medium text-green-600">
                        {filteredViolations.filter(v => v.severity === 'Low').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advertisement Banner */}
        {showAds && (
          <AdvertisementBanner 
            title="Smart Warehouse Management"
            description="Optimize your warehouse operations with AI-powered insights. Reduce costs by 25% and improve efficiency with our advanced analytics platform."
            ctaText="Get Demo"
            backgroundColor="bg-gradient-to-r from-orange-600 to-red-600"
          />
        )}

        {/* Step 3: Routing Guide Analysis */}
        {(parsedRoutingGuideData || (violations.length > 0 && violations.some(v => v.retailer === 'Uploaded Document'))) && (
          <section className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <h2 className="text-xl font-semibold">Routing Guide Analysis</h2>
            </div>
            
            {parsedRoutingGuideData ? (
              <RoutingGuideViewer parsedData={parsedRoutingGuideData} />
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">📊</span>
                  </div>
                  <h3 className="text-lg font-medium text-blue-900">Routing Guide Data Available</h3>
                </div>
                <p className="text-blue-700 mb-4">
                  Upload a routing guide PDF to see detailed analysis including order types, carton specifications, 
                  label placement rules, and product requirements.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Order Types</h4>
                    <p className="text-sm text-blue-700">Bulk Orders, Pack by Store, Direct to Store</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Carton Specs</h4>
                    <p className="text-sm text-blue-700">Conveyable dimensions and weight limits</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Label Placement</h4>
                    <p className="text-sm text-blue-700">2 inches from bottom/right edge</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Step 4: Risk Assessment Calculator */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">{parsedRoutingGuideData ? '4' : '3'}</span>
              </div>
              <h2 className="text-xl font-semibold">Risk Assessment Calculator</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calculator Form */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Calculate Risk Score</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Violation</label>
                    <select 
                      data-risk-violation
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Choose a violation to assess...</option>
                      {filteredViolations.map(violation => (
                        <option key={violation.id} value={violation.id}>
                          {violation.category} - {violation.requirement}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Affected</label>
                    <input 
                      data-risk-quantity
                      type="number" 
                      placeholder="e.g., 10 cartons, 5 items"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency (per month)</label>
                    <select 
                      data-risk-frequency
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select frequency...</option>
                      <option value="1">1-2 times</option>
                      <option value="2">3-5 times</option>
                      <option value="3">6-10 times</option>
                      <option value="4">11+ times</option>
                    </select>
                  </div>
                  
                  <button 
                    onClick={handleRiskCalculation}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Calculate Risk Score
                  </button>
                </div>
              </div>
              
              {/* Results Display */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Assessment Results</h3>
                {riskCalculation ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    {/* Risk Level */}
                    <div className={`text-center p-4 rounded-lg mb-4 ${
                      riskCalculation.results.riskLevel === 'Critical' ? 'bg-red-100 border border-red-200' :
                      riskCalculation.results.riskLevel === 'High' ? 'bg-orange-100 border border-orange-200' :
                      riskCalculation.results.riskLevel === 'Medium' ? 'bg-yellow-100 border border-yellow-200' :
                      'bg-green-100 border border-green-200'
                    }`}>
                      <div className="text-2xl font-bold mb-2">
                        {riskCalculation.results.riskLevel} Risk
                      </div>
                      <div className="text-lg">
                        ${riskCalculation.results.monthlyRisk.toLocaleString()}/month
                      </div>
                      <div className="text-sm text-gray-600">
                        ${riskCalculation.results.annualRisk.toLocaleString()}/year
                      </div>
                    </div>

                    {/* Violation Details */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Violation Details</h4>
                      <div className="text-sm space-y-1">
                        <div><strong>Category:</strong> {riskCalculation.results.violation.category}</div>
                        <div><strong>Severity:</strong> {riskCalculation.results.violation.severity}</div>
                        <div><strong>Base Fine:</strong> ${riskCalculation.results.baseFine}</div>
                        <div><strong>Quantity:</strong> {riskCalculation.quantity} items</div>
                        <div><strong>Frequency:</strong> {riskCalculation.frequency === '1' ? '1-2 times' : 
                                                      riskCalculation.frequency === '2' ? '3-5 times' :
                                                      riskCalculation.frequency === '3' ? '6-10 times' : '11+ times'} per month</div>
                      </div>
                    </div>

                    {/* Calculation Breakdown */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 mb-2">Calculation Breakdown</h4>
                      <div className="text-sm space-y-1">
                        <div>Base Fine: ${riskCalculation.results.baseFine}</div>
                        <div>× Quantity: {riskCalculation.quantity}</div>
                        <div>× Frequency: {riskCalculation.results.frequencyMultiplier}</div>
                        <div>× Severity Multiplier: {riskCalculation.results.severityMultiplier}x</div>
                        <div className="border-t pt-1 mt-2 font-medium">
                          = Monthly Risk: ${riskCalculation.results.monthlyRisk.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-2">📊</div>
                      <p className="text-gray-600">Select a violation and click calculate to see risk assessment</p>
                    </div>
                  </div>
                )}
                
                {/* Sample Risk Breakdown */}
                <div className="mt-4 bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Risk Factors Considered:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Severity level (High/Medium/Low)</li>
                    <li>• Fine amount per violation</li>
                    <li>• Frequency of occurrence</li>
                    <li>• Quantity of items affected</li>
                    <li>• Historical compliance record</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 5: Top Risk Areas */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">{parsedRoutingGuideData ? '5' : '4'}</span>
              </div>
              <h2 className="text-xl font-semibold">Top Risk Areas</h2>
            </div>
            
            {filteredViolations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredViolations
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
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No high-risk violations found</p>
                <p className="text-sm mt-2">Try adjusting your filters or upload more data</p>
              </div>
            )}
          </div>
        </section>

        {/* Step 6: Review Requirements */}
        <section>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">{parsedRoutingGuideData ? '6' : '5'}</span>
              </div>
              <h2 className="text-xl font-semibold">Review Requirements</h2>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Compliance Requirements</h3>
              <span className="text-sm text-gray-500">
                {filteredViolations.length} of {violations.length} requirements
              </span>
            </div>
            
            {filteredViolations.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <div className="space-y-3">
                    {filteredViolations.slice(0, 10).map((violation) => (
                  <div key={violation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2">
                            {violation.category}
                          </span>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            violation.severity === 'High' ? 'bg-red-100 text-red-800' :
                            violation.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {violation.severity}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">{violation.requirement}</p>
                        <p className="text-sm text-gray-600 mb-1">{violation.violation}</p>
                        <p className="text-sm font-medium text-red-600">{violation.fine}</p>
                      </div>
                    </div>
                  </div>
                ))}
                    {filteredViolations.length > 10 && (
                      <p className="text-center text-sm text-gray-500 mt-4">
                        Showing first 10 of {filteredViolations.length} requirements
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Sidebar Advertisement */}
                {showAds && (
                  <div className="lg:col-span-1">
                    <SidebarAd />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No compliance requirements match your filters</p>
                <p className="text-sm mt-2">Try adjusting your filters or clear all filters</p>
              </div>
            )}
          </div>
        </section>

        {/* Bottom Advertisement */}
        {showAds && (
          <AdvertisementBanner 
            title="Enterprise Compliance Solutions"
            description="Scale your compliance management with our enterprise-grade platform. Trusted by Fortune 500 companies worldwide."
            ctaText="Contact Sales"
            backgroundColor="bg-gradient-to-r from-indigo-600 to-purple-600"
            variant="horizontal"
          />
        )}
      </main>
    </div>
  );
}

export default RobustApp;
