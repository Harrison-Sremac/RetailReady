/**
 * API Utility Functions
 * 
 * This module provides utility functions for making API calls,
 * handling responses, and managing API-related operations.
 * 
 * @fileoverview API utility functions and helpers
 * @author RetailReady Team
 * @version 1.0.0
 */

import { API_CONFIG, ERROR_MESSAGES } from './constants';
import { Violation, RiskCalculation, Filters } from '../types';

/**
 * API Response wrapper type
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

/**
 * Generic API request function
 * 
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @returns Promise with API response
 */
async function apiRequest<T>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || ERROR_MESSAGES.GENERIC_ERROR,
        message: data.message
      };
    }

    return {
      success: true,
      data: data,
      message: data.message
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: ERROR_MESSAGES.NETWORK_ERROR
    };
  }
}

/**
 * Violations API functions
 */
export const violationsApi = {
  /**
   * Get all violations with optional filtering
   * 
   * @param filters - Optional filters to apply
   * @returns Promise with violations array
   */
  async getAll(filters: Partial<Filters> = {}): Promise<ApiResponse<Violation[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.severity) queryParams.append('severity', filters.severity);
    if (filters.retailer) queryParams.append('retailer', filters.retailer);
    
    const url = `${API_CONFIG.ENDPOINTS.VIOLATIONS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<Violation[]>(url);
  },

  /**
   * Get a specific violation by ID
   * 
   * @param id - Violation ID
   * @returns Promise with violation data
   */
  async getById(id: number): Promise<ApiResponse<Violation>> {
    return apiRequest<Violation>(`${API_CONFIG.ENDPOINTS.VIOLATIONS}/${id}`);
  },

  /**
   * Get all unique categories
   * 
   * @returns Promise with categories array
   */
  async getCategories(): Promise<ApiResponse<string[]>> {
    return apiRequest<string[]>(API_CONFIG.ENDPOINTS.CATEGORIES);
  },

  /**
   * Get all unique retailers
   * 
   * @returns Promise with retailers array
   */
  async getRetailers(): Promise<ApiResponse<string[]>> {
    return apiRequest<string[]>(API_CONFIG.ENDPOINTS.RETAILERS);
  },

  /**
   * Get database view organized by retailer and category
   * 
   * @returns Promise with database view data
   */
  async getDatabaseView(): Promise<ApiResponse<any>> {
    return apiRequest<any>(API_CONFIG.ENDPOINTS.DATABASE_VIEW);
  },

  /**
   * Get detailed view for specific retailer/category
   * 
   * @param retailer - Retailer name
   * @param category - Category name
   * @returns Promise with detailed view data
   */
  async getDetailedView(retailer: string, category: string): Promise<ApiResponse<any>> {
    const encodedRetailer = encodeURIComponent(retailer);
    const encodedCategory = encodeURIComponent(category);
    return apiRequest<any>(`${API_CONFIG.ENDPOINTS.DATABASE_VIEW}/${encodedRetailer}/${encodedCategory}`);
  }
};

/**
 * Upload API functions
 */
export const uploadApi = {
  /**
   * Upload and parse a PDF file
   * 
   * @param file - PDF file to upload
   * @returns Promise with upload result
   */
  async uploadFile(file: File): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch(API_CONFIG.ENDPOINTS.UPLOAD, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || ERROR_MESSAGES.UPLOAD_FAILED,
          message: data.message
        };
      }

      return {
        success: true,
        data: data,
        message: data.message || 'Upload successful'
      };
    } catch (error) {
      console.error('Upload failed:', error);
      return {
        success: false,
        error: ERROR_MESSAGES.UPLOAD_FAILED
      };
    }
  },

  /**
   * Validate a PDF file without processing
   * 
   * @param file - PDF file to validate
   * @returns Promise with validation result
   */
  async validateFile(file: File): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch(API_CONFIG.ENDPOINTS.UPLOAD_VALIDATE, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Validation failed',
          message: data.message
        };
      }

      return {
        success: true,
        data: data,
        message: data.message || 'Validation successful'
      };
    } catch (error) {
      console.error('Validation failed:', error);
      return {
        success: false,
        error: 'Validation failed'
      };
    }
  },

  /**
   * Get upload configuration and requirements
   * 
   * @returns Promise with upload info
   */
  async getInfo(): Promise<ApiResponse<any>> {
    return apiRequest<any>(API_CONFIG.ENDPOINTS.UPLOAD_INFO);
  }
};

/**
 * Risk calculation API functions
 */
export const riskApi = {
  /**
   * Calculate risk score for a specific violation
   * 
   * @param violationId - Violation ID
   * @param units - Number of units
   * @returns Promise with risk calculation result
   */
  async calculateScore(violationId: number, units: number): Promise<ApiResponse<RiskCalculation>> {
    return apiRequest<RiskCalculation>(API_CONFIG.ENDPOINTS.RISK_SCORE, {
      method: 'POST',
      body: JSON.stringify({ violationId, units })
    });
  },

  /**
   * Calculate risk scores for multiple violations
   * 
   * @param violations - Array of violation IDs
   * @param units - Number of units
   * @returns Promise with batch calculation result
   */
  async calculateBatch(violations: number[], units: number): Promise<ApiResponse<any>> {
    return apiRequest<any>(API_CONFIG.ENDPOINTS.RISK_BATCH, {
      method: 'POST',
      body: JSON.stringify({ violations, units })
    });
  },

  /**
   * Estimate fine without database lookup
   * 
   * @param violation - Violation object with fine structure
   * @param units - Number of units
   * @returns Promise with estimation result
   */
  async estimateFine(violation: Partial<Violation>, units: number): Promise<ApiResponse<any>> {
    return apiRequest<any>(API_CONFIG.ENDPOINTS.RISK_ESTIMATE, {
      method: 'POST',
      body: JSON.stringify({ violation, units })
    });
  },

  /**
   * Get risk calculation configuration
   * 
   * @returns Promise with risk configuration
   */
  async getConfig(): Promise<ApiResponse<any>> {
    return apiRequest<any>(API_CONFIG.ENDPOINTS.RISK_CONFIG);
  }
};

/**
 * System API functions
 */
export const systemApi = {
  /**
   * Check system health
   * 
   * @returns Promise with health status
   */
  async checkHealth(): Promise<ApiResponse<any>> {
    return apiRequest<any>(API_CONFIG.ENDPOINTS.HEALTH);
  },

  /**
   * Get API information
   * 
   * @returns Promise with API info
   */
  async getInfo(): Promise<ApiResponse<any>> {
    return apiRequest<any>(API_CONFIG.BASE_URL);
  }
};

/**
 * File validation utility
 * 
 * @param file - File to validate
 * @returns Validation result
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_FILE_TYPE
    };
  }

  // Check file size
  if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: ERROR_MESSAGES.FILE_TOO_LARGE
    };
  }

  return { valid: true };
}

/**
 * Debounce utility for API calls
 * 
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
