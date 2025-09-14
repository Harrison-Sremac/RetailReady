/**
 * Risk Calculation Service Module
 * 
 * This module handles risk assessment calculations for compliance violations.
 * It analyzes fine structures and calculates estimated financial impact
 * based on violation quantities and severity levels.
 * 
 * @fileoverview Risk assessment and financial impact calculation service
 * @author RetailReady Team
 * @version 1.0.0
 */

/**
 * Risk calculation configuration
 * Contains thresholds and calculation parameters
 */
const riskConfig = {
  // Risk level thresholds based on estimated fine amounts
  thresholds: {
    high: 1000,    // $1000+ is considered high risk
    medium: 500     // $500+ is considered medium risk
  },
  
  // Fine calculation patterns
  patterns: {
    perCarton: /\$(\d+)\/carton/,
    perItem: /\$(\d+)\/item/,
    perOccurrence: /\$(\d+)\s+per\s+occurrence/,
    perHour: /\$(\d+)\/hour/,
    perMissing: /\$(\d+)\s+per\s+(?:missing|incorrect|non-compliant)/,
    perViolation: /\$(\d+)\s+per\s+(?:violation|occurrence|incident)/,
    processingFee: /\$(\d+)\s+(?:processing|inspection)\s+fee/,
    baseFee: /\$(\d+)(?:\s+base)?(?:\s+fee)?/,
    fixedAmount: /\$(\d+)(?:\s+per)?(?:\s+(?:missing|incorrect|violation|occurrence))?/
  },
  
  // Severity multipliers
  severityMultipliers: {
    'High': 1.5,
    'Medium': 1.0,
    'Low': 0.5
  }
};

/**
 * Risk calculation service class
 * Provides methods for calculating financial risk from compliance violations
 */
class RiskService {
  /**
   * Calculate estimated fine for a violation
   * 
   * This method analyzes the fine text and calculates an estimated
   * financial impact based on the number of units affected.
   * 
   * @param {string} fineText - The fine structure text from the violation
   * @param {number} units - Number of units (cartons, items, etc.)
   * @returns {number} Estimated fine amount in dollars
   * 
   * @example
   * const fine = calculateEstimatedFine("$2/carton + $250", 100);
   * console.log(fine); // 450 (100 * 2 + 250)
   */
  calculateEstimatedFine(fineText, units) {
    if (!fineText || typeof fineText !== 'string') {
      return 0;
    }
    
    if (!units || typeof units !== 'number' || units <= 0) {
      return 0;
    }
    
    let estimatedFine = 0;
    const lowerFineText = fineText.toLowerCase();
    
    // Calculate per-carton fines
    if (lowerFineText.includes('per carton') || lowerFineText.includes('/carton')) {
      const match = lowerFineText.match(riskConfig.patterns.perCarton);
      if (match) {
        estimatedFine += parseInt(match[1]) * units;
      }
    }
    
    // Calculate per-item fines
    if (lowerFineText.includes('per item') || lowerFineText.includes('/item')) {
      const match = lowerFineText.match(riskConfig.patterns.perItem);
      if (match) {
        estimatedFine += parseInt(match[1]) * units;
      }
    }
    
    // Calculate per-occurrence fines (fixed amount)
    if (lowerFineText.includes('per occurrence')) {
      const match = lowerFineText.match(riskConfig.patterns.perOccurrence);
      if (match) {
        estimatedFine += parseInt(match[1]);
      }
    }
    
    // Calculate per-hour fines
    if (lowerFineText.includes('per hour')) {
      const match = lowerFineText.match(riskConfig.patterns.perHour);
      if (match) {
        estimatedFine += parseInt(match[1]);
      }
    }
    
    // Calculate per-missing fines (e.g., "per missing MSDS")
    if (lowerFineText.includes('per missing') || lowerFineText.includes('per incorrect') || lowerFineText.includes('per non-compliant')) {
      const match = lowerFineText.match(riskConfig.patterns.perMissing);
      if (match) {
        estimatedFine += parseInt(match[1]) * units;
      }
    }
    
    // Calculate per-violation fines
    if (lowerFineText.includes('per violation') || lowerFineText.includes('per incident')) {
      const match = lowerFineText.match(riskConfig.patterns.perViolation);
      if (match) {
        estimatedFine += parseInt(match[1]);
      }
    }
    
    // Add processing/inspection fees
    if (lowerFineText.includes('processing fee') || lowerFineText.includes('inspection fee')) {
      const match = lowerFineText.match(riskConfig.patterns.processingFee);
      if (match) {
        estimatedFine += parseInt(match[1]);
      }
    }
    
    // Add base fees
    if (lowerFineText.includes('base fee') || lowerFineText.includes('fee')) {
      const match = lowerFineText.match(riskConfig.patterns.baseFee);
      if (match) {
        estimatedFine += parseInt(match[1]);
      }
    }
    
    // Fallback: Try to extract any dollar amount if no specific pattern matched
    if (estimatedFine === 0) {
      const fallbackMatch = lowerFineText.match(/\$(\d+)/);
      if (fallbackMatch) {
        // If it contains "per" or similar, multiply by units
        if (lowerFineText.includes('per') || lowerFineText.includes('missing') || lowerFineText.includes('incorrect')) {
          estimatedFine += parseInt(fallbackMatch[1]) * units;
        } else {
          // Otherwise, it's a fixed amount
          estimatedFine += parseInt(fallbackMatch[1]);
        }
      }
    }
    
    return estimatedFine;
  }

  /**
   * Determine risk level based on estimated fine
   * 
   * @param {number} estimatedFine - Calculated fine amount
   * @returns {string} Risk level: 'High', 'Medium', or 'Low'
   */
  determineRiskLevel(estimatedFine) {
    if (estimatedFine >= riskConfig.thresholds.high) {
      return 'High';
    } else if (estimatedFine >= riskConfig.thresholds.medium) {
      return 'Medium';
    } else {
      return 'Low';
    }
  }

  /**
   * Calculate risk percentage based on estimated fine and shipment value
   * 
   * @param {number} estimatedFine - Calculated fine amount
   * @param {number} shipmentValue - Estimated value of the shipment (optional)
   * @returns {number} Risk percentage (0-100)
   */
  calculateRiskPercentage(estimatedFine, shipmentValue = null) {
    if (estimatedFine === 0) {
      return 0;
    }

    // If no shipment value provided, use a default calculation based on fine amount
    if (!shipmentValue) {
      // Assume shipment value is 10x the fine amount for percentage calculation
      shipmentValue = estimatedFine * 10;
    }

    const percentage = (estimatedFine / shipmentValue) * 100;
    return Math.min(Math.round(percentage * 100) / 100, 100); // Cap at 100%
  }

  /**
   * Calculate comprehensive risk assessment
   * 
   * This method provides a complete risk assessment including
   * estimated fine, risk level, and additional risk factors.
   * 
   * @param {Object} violation - Violation object
   * @param {number} units - Number of units affected
   * @returns {Object} Complete risk assessment
   * 
   * @example
   * const assessment = calculateRiskAssessment(violation, 50);
   * console.log(assessment);
   * // {
   * //   violation: {...},
   * //   units: 50,
   * //   estimatedFine: 350,
   * //   severity: "High",
   * //   riskLevel: "Medium",
   * //   riskFactors: [...]
   * // }
   */
  calculateRiskAssessment(violation, units) {
    if (!violation || !units) {
      throw new Error('Violation and units are required for risk calculation');
    }
    
    // Calculate base estimated fine
    const baseFine = this.calculateEstimatedFine(violation.fine, units);
    
    // Apply severity multiplier
    const severityMultiplier = riskConfig.severityMultipliers[violation.severity] || 1.0;
    const estimatedFine = Math.round(baseFine * severityMultiplier);
    
    // Determine risk level
    const riskLevel = this.determineRiskLevel(estimatedFine);
    
    // Calculate risk percentage
    const riskPercentage = this.calculateRiskPercentage(estimatedFine);
    
    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(violation, units, estimatedFine);
    
    return {
      violation: violation,
      units: units,
      estimatedFine: estimatedFine,
      severity: violation.severity,
      riskLevel: riskLevel,
      riskPercentage: riskPercentage,
      riskFactors: riskFactors,
      calculationDetails: {
        baseFine: baseFine,
        severityMultiplier: severityMultiplier,
        thresholds: riskConfig.thresholds
      }
    };
  }

  /**
   * Identify risk factors for a violation
   * 
   * @param {Object} violation - Violation object
   * @param {number} units - Number of units
   * @param {number} estimatedFine - Calculated fine amount
   * @returns {Array} Array of risk factor descriptions
   */
  identifyRiskFactors(violation, units, estimatedFine) {
    const factors = [];
    
    // High severity factor
    if (violation.severity === 'High') {
      factors.push('High severity violation');
    }
    
    // Large quantity factor
    if (units > 100) {
      factors.push('Large quantity affected');
    } else if (units > 50) {
      factors.push('Moderate quantity affected');
    }
    
    // High financial impact
    if (estimatedFine > 1000) {
      factors.push('High financial impact');
    } else if (estimatedFine > 500) {
      factors.push('Moderate financial impact');
    }
    
    // Category-specific factors
    if (violation.category === 'Labeling') {
      factors.push('Labeling violations can affect entire shipments');
    }
    
    if (violation.category === 'Delivery') {
      factors.push('Delivery violations can disrupt supply chain');
    }
    
    if (violation.category === 'Packaging') {
      factors.push('Packaging violations can cause product damage');
    }
    
    return factors;
  }

  /**
   * Calculate batch risk assessment for multiple violations
   * 
   * @param {Array} violations - Array of violation objects
   * @param {number} units - Number of units for each violation
   * @returns {Array} Array of risk assessments
   */
  calculateBatchRiskAssessment(violations, units) {
    if (!Array.isArray(violations)) {
      throw new Error('Violations must be an array');
    }
    
    return violations.map(violation => 
      this.calculateRiskAssessment(violation, units)
    );
  }

  /**
   * Get risk statistics for a set of violations
   * 
   * @param {Array} violations - Array of violation objects
   * @param {number} units - Number of units
   * @returns {Object} Risk statistics
   */
  getRiskStatistics(violations, units) {
    if (!Array.isArray(violations) || violations.length === 0) {
      return {
        totalViolations: 0,
        totalEstimatedFine: 0,
        averageFine: 0,
        riskLevelDistribution: { High: 0, Medium: 0, Low: 0 },
        highestRiskViolation: null
      };
    }
    
    const assessments = this.calculateBatchRiskAssessment(violations, units);
    
    const totalEstimatedFine = assessments.reduce((sum, assessment) => 
      sum + assessment.estimatedFine, 0
    );
    
    const averageFine = totalEstimatedFine / assessments.length;
    
    const riskLevelDistribution = assessments.reduce((dist, assessment) => {
      dist[assessment.riskLevel]++;
      return dist;
    }, { High: 0, Medium: 0, Low: 0 });
    
    const highestRiskViolation = assessments.reduce((highest, current) => 
      current.estimatedFine > highest.estimatedFine ? current : highest
    );
    
    return {
      totalViolations: violations.length,
      totalEstimatedFine: totalEstimatedFine,
      averageFine: Math.round(averageFine),
      riskLevelDistribution: riskLevelDistribution,
      highestRiskViolation: highestRiskViolation,
      assessments: assessments
    };
  }

  /**
   * Get risk service configuration
   * 
   * @returns {Object} Risk service configuration
   */
  getRiskConfig() {
    return {
      thresholds: riskConfig.thresholds,
      severityMultipliers: riskConfig.severityMultipliers,
      patterns: Object.keys(riskConfig.patterns)
    };
  }
}

module.exports = RiskService;
