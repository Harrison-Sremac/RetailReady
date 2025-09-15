/**
 * Routing Guide Viewer Component
 * 
 * This component provides a comprehensive view of parsed routing guide data
 * including order types, carton specs, violation matrix, and risk assessment.
 * 
 * @fileoverview Comprehensive routing guide data viewer and analyzer
 * @author RetailReady Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { BookOpen, Package, AlertTriangle, Clock, Tag, Settings } from 'lucide-react';
import { ParsedRoutingGuideData } from '../types';
import { OrderTypeDecisionTree } from './OrderTypeDecisionTree';
import { CartonSpecValidator } from './CartonSpecValidator';
import { ViolationMatrixHeatMap } from './ViolationMatrixHeatMap';
import { RiskCalculator } from './RiskCalculator';

/**
 * Component props
 */
interface RoutingGuideViewerProps {
  parsedData: ParsedRoutingGuideData | null;
  className?: string;
}

/**
 * Tab Navigation Component
 */
const TabNavigation: React.FC<{
  activeTab: string;
  onTabChange: (tab: string) => void;
  data: ParsedRoutingGuideData | null;
}> = ({ activeTab, onTabChange, data }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'order-types', label: 'Order Types', icon: Package },
    { id: 'carton-specs', label: 'Carton Specs', icon: Package },
    { id: 'violations', label: 'Violation Matrix', icon: AlertTriangle },
    { id: 'timing', label: 'Timing Rules', icon: Clock },
    { id: 'products', label: 'Product Rules', icon: Tag },
    { id: 'risk-calc', label: 'Risk Calculator', icon: Settings }
  ];

  return (
    <div className="border-b border-gray-200 bg-gray-50">
      <nav className="-mb-px flex space-x-2 overflow-x-auto px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          // Check if tab has data
          let hasData: boolean = false;
          switch (tab.id) {
            case 'order-types':
              hasData = Boolean(data?.order_types && data.order_types.length > 0);
              break;
            case 'carton-specs':
              hasData = Boolean(data?.carton_specs && Object.keys(data.carton_specs).length > 0);
              break;
            case 'violations':
              hasData = Boolean(data?.requirements && data.requirements.length > 0);
              break;
            case 'timing':
              hasData = Boolean(data?.timing_requirements && data.timing_requirements.length > 0);
              break;
            case 'products':
              hasData = Boolean(data?.product_requirements && data.product_requirements.length > 0);
              break;
            default:
              hasData = true;
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-blue-500 text-blue-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-100'
              } ${!hasData ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!hasData}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-shrink-0">{tab.label}</span>
              {hasData && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs flex-shrink-0 ${
                  isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.id === 'order-types' ? data?.order_types.length :
                   tab.id === 'carton-specs' ? '1' :
                   tab.id === 'violations' ? data?.requirements.length :
                   tab.id === 'timing' ? data?.timing_requirements.length :
                   tab.id === 'products' ? data?.product_requirements.length :
                   '✓'}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

/**
 * Overview Tab Component
 */
const OverviewTab: React.FC<{ data: ParsedRoutingGuideData }> = ({ data }) => {
  const totalViolations = data.requirements.length;
  const highRiskViolations = data.requirements.filter(v => v.severity === 'High').length;
  const totalFineExposure = data.requirements.reduce((sum, v) => sum + (v.fine_amount || 0), 0);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-gray-900">
          Routing Guide Overview
        </h2>
        <p className="text-lg text-gray-600">
          Comprehensive analysis of compliance requirements and risk factors
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="bg-blue-50 p-8 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">Total Violations</p>
              <p className="text-2xl font-bold text-blue-900">{totalViolations}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-8 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-600">High Risk</p>
              <p className="text-2xl font-bold text-red-900">{highRiskViolations}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-8 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-600">Order Types</p>
              <p className="text-2xl font-bold text-yellow-900">{data.order_types.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-8 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">Timing Rules</p>
              <p className="text-2xl font-bold text-green-900">{data.timing_requirements.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Risk Areas</h3>
          <div className="space-y-3">
            {data.requirements
              .filter(v => v.severity === 'High')
              .slice(0, 3)
              .map((violation, index) => (
                <div key={violation.id} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {violation.category}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {violation.violation}
                    </p>
                    <p className="text-sm font-medium text-red-600">
                      {violation.fine}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Available Order Types</h3>
          <div className="space-y-2">
            {data.order_types.slice(0, 5).map((orderType, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{orderType.type}</p>
                  <p className="text-xs text-gray-600">{orderType.description}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {orderType.rules.length} rules
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Timing Requirements Tab Component
 */
const TimingRequirementsTab: React.FC<{ timingRequirements: any[] }> = ({ timingRequirements }) => {
  if (timingRequirements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Timing Requirements</h3>
        <p>No timing requirements found in the routing guide.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Critical Timing Requirements
        </h2>
        <p className="text-gray-600">
          Important deadlines and timing requirements for compliance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {timingRequirements.map((requirement, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {requirement.requirement}
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Deadline:</span>
                    <p className="text-sm text-gray-900">{requirement.deadline}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Timeframe:</span>
                    <p className="text-sm text-gray-900">{requirement.timeframe}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Violation Fine:</span>
                    <p className="text-sm font-medium text-red-600">{requirement.violation_fine}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Product Requirements Tab Component
 */
const ProductRequirementsTab: React.FC<{ productRequirements: any[] }> = ({ productRequirements }) => {
  if (productRequirements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Product Requirements</h3>
        <p>No product-specific requirements found in the routing guide.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Product-Specific Requirements
        </h2>
        <p className="text-gray-600">
          Category-specific rules and requirements for different product types
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {productRequirements.map((product, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Tag className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {product.category}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Requirements</h4>
                    <ul className="space-y-1">
                      {product.requirements.map((req: string, reqIndex: number) => (
                        <li key={reqIndex} className="text-sm text-gray-700 flex items-start space-x-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {product.special_rules.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Special Rules</h4>
                      <ul className="space-y-1">
                        {product.special_rules.map((rule: string, ruleIndex: number) => (
                          <li key={ruleIndex} className="text-sm text-gray-700 flex items-start space-x-2">
                            <span className="text-yellow-600 mt-0.5">!</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {product.violations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Common Violations</h4>
                      <ul className="space-y-1">
                        {product.violations.map((violation: string, violIndex: number) => (
                          <li key={violIndex} className="text-sm text-red-700 flex items-start space-x-2">
                            <span className="text-red-600 mt-0.5">•</span>
                            <span>{violation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Routing Guide Viewer Component
 */
export const RoutingGuideViewer: React.FC<RoutingGuideViewerProps> = ({
  parsedData,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!parsedData) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Routing Guide Data</h2>
        <p className="text-gray-600">
          Upload a routing guide PDF to see comprehensive compliance analysis and risk assessment.
        </p>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab data={parsedData} />;
      case 'order-types':
        return <OrderTypeDecisionTree orderTypes={parsedData.order_types} />;
      case 'carton-specs':
        return <CartonSpecValidator cartonSpecs={parsedData.carton_specs} />;
      case 'violations':
        return <ViolationMatrixHeatMap violations={parsedData.requirements} />;
      case 'timing':
        return <TimingRequirementsTab timingRequirements={parsedData.timing_requirements} />;
      case 'products':
        return <ProductRequirementsTab productRequirements={parsedData.product_requirements} />;
      case 'risk-calc':
        return <RiskCalculator violations={parsedData.requirements} />;
      default:
        return <OverviewTab data={parsedData} />;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <TabNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        data={parsedData}
      />
      
      <div className="p-8">
        {renderTabContent()}
      </div>
    </div>
  );
};
