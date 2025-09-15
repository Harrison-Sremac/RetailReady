/**
 * Order Type Decision Tree Component
 * 
 * This component provides an interactive decision tree for selecting
 * the correct packing method based on order type requirements.
 * 
 * @fileoverview Interactive decision tree for order type selection
 * @author RetailReady Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Package, ArrowRight, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { OrderType } from '../types';

/**
 * Component props
 */
interface OrderTypeDecisionTreeProps {
  orderTypes: OrderType[];
  className?: string;
}

/**
 * Decision Tree Node Component
 */
const DecisionNode: React.FC<{
  orderType: OrderType;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ orderType, isSelected, onSelect }) => {
  return (
    <div
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
          isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          {isSelected ? <CheckCircle className="w-4 h-4" /> : <Package className="w-4 h-4" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
            {orderType.type}
          </h3>
          <p className={`text-sm mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
            {orderType.description}
          </p>
          
          <div className="mt-3 space-y-2">
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Packing Method
              </span>
              <p className="text-sm text-gray-700 mt-1">{orderType.packing_method}</p>
            </div>
            
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                SKU Mixing Rules
              </span>
              <p className="text-sm text-gray-700 mt-1">{orderType.skus_per_carton}</p>
            </div>
          </div>
        </div>
        
        <ArrowRight className={`w-5 h-5 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
      </div>
    </div>
  );
};

/**
 * Rules Display Component
 */
const RulesDisplay: React.FC<{ orderType: OrderType | null }> = ({ orderType }) => {
  if (!orderType) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <div className="text-center">
          <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select an order type to view detailed rules</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-medium text-gray-900">
          {orderType.type} - Detailed Rules
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* General Rules */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">General Rules</h4>
          <ul className="space-y-2">
            {orderType.rules.map((rule, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm">
                <span className="text-blue-600 mt-0.5">•</span>
                <span className="text-gray-700">{rule}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Special Requirements */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-3">Special Requirements</h4>
          {orderType.special_requirements.length > 0 ? (
            <ul className="space-y-2">
              {orderType.special_requirements.map((req, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-yellow-800">{req}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-yellow-700">No special requirements for this order type.</p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Order Type Decision Tree Component
 */
export const OrderTypeDecisionTree: React.FC<OrderTypeDecisionTreeProps> = ({
  orderTypes,
  className = ''
}) => {
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType | null>(null);

  if (!orderTypes || orderTypes.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Order Types Available</h3>
        <p className="text-gray-600">
          Upload a routing guide to see available order types and packing methods.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Order Type Decision Tree
        </h2>
        <p className="text-gray-600">
          Select the appropriate order type to view packing requirements and rules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Type Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Available Order Types
          </h3>
          
          <div className="space-y-3">
            {orderTypes.map((orderType, index) => (
              <DecisionNode
                key={index}
                orderType={orderType}
                isSelected={selectedOrderType?.type === orderType.type}
                onSelect={() => setSelectedOrderType(orderType)}
              />
            ))}
          </div>
        </div>

        {/* Rules Display */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Detailed Requirements
          </h3>
          <RulesDisplay orderType={selectedOrderType} />
        </div>
      </div>
    </div>
  );
};
