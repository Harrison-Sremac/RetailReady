/**
 * Carton Specification Validator Component
 * 
 * This component provides an interactive validator for carton specifications
 * based on routing guide requirements.
 * 
 * @fileoverview Interactive carton specification validator
 * @author RetailReady Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Package, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { CartonSpecs } from '../types';

/**
 * Component props
 */
interface CartonSpecValidatorProps {
  cartonSpecs: CartonSpecs;
  className?: string;
}

/**
 * Validation Result Interface
 */
interface ValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
}

/**
 * Carton Input Form Component
 */
const CartonInputForm: React.FC<{
  onValidate: (dimensions: CartonDimensions) => void;
  isLoading: boolean;
}> = ({ onValidate, isLoading }) => {
  const [dimensions, setDimensions] = useState<CartonDimensions>({
    length: '',
    width: '',
    height: '',
    weight: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onValidate(dimensions);
  };

  const handleChange = (field: keyof CartonDimensions, value: string) => {
    setDimensions(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Length (inches)
          </label>
          <input
            type="number"
            step="0.1"
            value={dimensions.length}
            onChange={(e) => handleChange('length', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 24.5"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Width (inches)
          </label>
          <input
            type="number"
            step="0.1"
            value={dimensions.width}
            onChange={(e) => handleChange('width', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 18.0"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height (inches)
          </label>
          <input
            type="number"
            step="0.1"
            value={dimensions.height}
            onChange={(e) => handleChange('height', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 12.0"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight (pounds)
          </label>
          <input
            type="number"
            step="0.1"
            value={dimensions.weight}
            onChange={(e) => handleChange('weight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 35.5"
            required
          />
        </div>
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Package className="w-4 h-4" />
        )}
        <span>{isLoading ? 'Validating...' : 'Validate Carton'}</span>
      </button>
    </form>
  );
};

/**
 * Carton Dimensions Interface
 */
interface CartonDimensions {
  length: string;
  width: string;
  height: string;
  weight: string;
}

/**
 * Validation Result Display Component
 */
const ValidationResultDisplay: React.FC<{
  result: ValidationResult | null;
  cartonSpecs: CartonSpecs;
}> = ({ result, cartonSpecs }) => {
  if (!result) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <div className="text-center">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Enter carton dimensions to validate</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Validation Status */}
      <div className={`p-4 rounded-lg border-2 ${
        result.isValid
          ? 'border-green-200 bg-green-50'
          : 'border-red-200 bg-red-50'
      }`}>
        <div className="flex items-center space-x-3">
          {result.isValid ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600" />
          )}
          <div>
            <h3 className={`font-semibold ${
              result.isValid ? 'text-green-900' : 'text-red-900'
            }`}>
              {result.isValid ? '✓ Carton is Valid' : '✗ Carton Issues Found'}
            </h3>
            <p className={`text-sm ${
              result.isValid ? 'text-green-700' : 'text-red-700'
            }`}>
              {result.isValid 
                ? 'This carton meets all conveyable specifications'
                : 'This carton does not meet conveyable specifications'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Issues */}
      {result.issues.length > 0 && (
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-medium text-red-900 mb-2 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Issues Found</span>
          </h4>
          <ul className="space-y-1">
            {result.issues.map((issue, index) => (
              <li key={index} className="text-sm text-red-800 flex items-start space-x-2">
                <span className="text-red-600 mt-0.5">•</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Warnings</span>
          </h4>
          <ul className="space-y-1">
            {result.warnings.map((warning, index) => (
              <li key={index} className="text-sm text-yellow-800 flex items-start space-x-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Specifications Reference */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Conveyable Specifications</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Length:</span>
            <span className="ml-2 font-medium">
              {cartonSpecs.conveyable.length_min}" - {cartonSpecs.conveyable.length_max}"
            </span>
          </div>
          <div>
            <span className="text-gray-600">Width:</span>
            <span className="ml-2 font-medium">
              {cartonSpecs.conveyable.width_min}" - {cartonSpecs.conveyable.width_max}"
            </span>
          </div>
          <div>
            <span className="text-gray-600">Height:</span>
            <span className="ml-2 font-medium">
              {cartonSpecs.conveyable.height_min}" - {cartonSpecs.conveyable.height_max}"
            </span>
          </div>
          <div>
            <span className="text-gray-600">Weight:</span>
            <span className="ml-2 font-medium">
              {cartonSpecs.conveyable.weight_min} - {cartonSpecs.conveyable.weight_max} lbs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Carton Specification Validator Component
 */
export const CartonSpecValidator: React.FC<CartonSpecValidatorProps> = ({
  cartonSpecs,
  className = ''
}) => {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateCarton = async (dimensions: CartonDimensions) => {
    setIsLoading(true);
    
    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const length = parseFloat(dimensions.length);
    const width = parseFloat(dimensions.width);
    const height = parseFloat(dimensions.height);
    const weight = parseFloat(dimensions.weight);
    
    const issues: string[] = [];
    const warnings: string[] = [];
    
    // Validate against conveyable specs
    const lengthMin = parseFloat(cartonSpecs.conveyable.length_min);
    const lengthMax = parseFloat(cartonSpecs.conveyable.length_max);
    const widthMin = parseFloat(cartonSpecs.conveyable.width_min);
    const widthMax = parseFloat(cartonSpecs.conveyable.width_max);
    const heightMin = parseFloat(cartonSpecs.conveyable.height_min);
    const heightMax = parseFloat(cartonSpecs.conveyable.height_max);
    const weightMin = parseFloat(cartonSpecs.conveyable.weight_min);
    const weightMax = parseFloat(cartonSpecs.conveyable.weight_max);
    
    if (length < lengthMin || length > lengthMax) {
      issues.push(`Length ${length}" is outside the conveyable range of ${lengthMin}" - ${lengthMax}"`);
    }
    
    if (width < widthMin || width > widthMax) {
      issues.push(`Width ${width}" is outside the conveyable range of ${widthMin}" - ${widthMax}"`);
    }
    
    if (height < heightMin || height > heightMax) {
      issues.push(`Height ${height}" is outside the conveyable range of ${heightMin}" - ${heightMax}"`);
    }
    
    if (weight < weightMin || weight > weightMax) {
      issues.push(`Weight ${weight} lbs is outside the conveyable range of ${weightMin} - ${weightMax} lbs`);
    }
    
    // Add warnings for edge cases
    if (length > lengthMax * 0.9) {
      warnings.push(`Length is near the maximum limit`);
    }
    
    if (weight > weightMax * 0.9) {
      warnings.push(`Weight is near the maximum limit`);
    }
    
    const result: ValidationResult = {
      isValid: issues.length === 0,
      issues,
      warnings
    };
    
    setValidationResult(result);
    setIsLoading(false);
  };

  if (!cartonSpecs || !cartonSpecs.conveyable) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Carton Specifications Available</h3>
        <p className="text-gray-600">
          Upload a routing guide to see carton specifications and validation rules.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Carton Specification Validator
        </h2>
        <p className="text-gray-600">
          Enter your carton dimensions to check if they meet conveyable specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Enter Carton Dimensions
          </h3>
          <CartonInputForm onValidate={validateCarton} isLoading={isLoading} />
        </div>

        {/* Validation Results */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Validation Results
          </h3>
          <ValidationResultDisplay 
            result={validationResult} 
            cartonSpecs={cartonSpecs}
          />
        </div>
      </div>
    </div>
  );
};
