/**
 * Risk Overview Service Module
 * 
 * This module provides rules-based risk prediction for orders and workers.
 * It analyzes order details, worker history, and contextual factors to predict
 * potential violations without requiring ML model training.
 * 
 * @fileoverview Rules-based risk prediction service
 * @author RetailReady Team
 * @version 1.0.0
 */

/**
 * Risk Overview Service Class
 * Provides methods for predicting risk based on heuristic rules
 */
class RiskOverviewService {
  /**
   * Get risk overview for an order and worker combination
   * 
   * @param {Object} order - Order details
   * @param {Object} worker - Worker details
   * @param {Object} context - Contextual factors
   * @returns {Object} Risk overview with level and factors
   */
  getRiskOverview(order, worker, context) {
    const factors = [];
    let riskScore = 0;

    // Order-based risk factors
    if (order.itemCount > 100) {
      factors.push("Large order (>100 items) - risk of mislabeling");
      riskScore += 2;
    } else if (order.itemCount > 50) {
      factors.push("Medium order (50-100 items) - moderate complexity");
      riskScore += 1;
    }

    if (order.shippingDeadline && this.getHoursUntilDeadline(order.shippingDeadline) < 2) {
      factors.push("Tight shipping window (<2 hours) - time pressure may cause mistakes");
      riskScore += 2;
    }

    if (order.orderType === 'Bulk' && order.itemCount > 200) {
      factors.push("Complex bulk order - high risk of packaging errors");
      riskScore += 1;
    }

    // Worker-based risk factors
    if (worker.pastViolations > 5) {
      factors.push("Worker has prior issues (>5 violations)");
      riskScore += 3;
    } else if (worker.pastViolations > 2) {
      factors.push("Worker has some prior violations (2-5)");
      riskScore += 1;
    }

    if (worker.experienceLevel === 'New') {
      factors.push("New worker - limited experience with complex orders");
      riskScore += 2;
    } else if (worker.experienceLevel === 'Junior') {
      factors.push("Junior worker - may need additional guidance");
      riskScore += 1;
    }

    // Context-based risk factors
    if (context.timeOfDay === 'Night') {
      factors.push("Night shift - historically riskier due to fatigue");
      riskScore += 2;
    } else if (context.timeOfDay === 'Late') {
      factors.push("Late shift - increased error risk");
      riskScore += 1;
    }

    if (context.dayOfWeek === 'Monday') {
      factors.push("Monday - potential weekend hangover effect");
      riskScore += 1;
    } else if (context.dayOfWeek === 'Friday') {
      factors.push("Friday - end-of-week fatigue");
      riskScore += 1;
    }

    if (context.shiftLoad === 'High') {
      factors.push("High shift load - worker may be overwhelmed");
      riskScore += 2;
    } else if (context.shiftLoad === 'Medium') {
      factors.push("Medium shift load - manageable but watch for errors");
      riskScore += 1;
    }

    // Additional contextual factors
    if (context.weatherCondition === 'Storm') {
      factors.push("Storm conditions - may affect worker focus");
      riskScore += 1;
    }

    if (context.equipmentStatus === 'Maintenance') {
      factors.push("Equipment under maintenance - potential delays");
      riskScore += 1;
    }

    // Determine risk level based on score
    const riskLevel = this.determineRiskLevel(riskScore);

    return {
      orderId: order.id,
      workerId: worker.id,
      riskLevel: riskLevel,
      riskScore: riskScore,
      factors: factors,
      timestamp: new Date().toISOString(),
      recommendations: this.generateRecommendations(riskLevel, factors)
    };
  }

  /**
   * Determine risk level based on score
   * 
   * @param {number} score - Risk score
   * @returns {string} Risk level: Low, Medium, or High
   */
  determineRiskLevel(score) {
    if (score >= 4) {
      return 'High';
    } else if (score >= 2) {
      return 'Medium';
    } else {
      return 'Low';
    }
  }

  /**
   * Generate recommendations based on risk level and factors
   * 
   * @param {string} riskLevel - Risk level
   * @param {Array} factors - Risk factors
   * @returns {Array} Array of recommendations
   */
  generateRecommendations(riskLevel, factors) {
    const recommendations = [];

    if (riskLevel === 'High') {
      recommendations.push("Assign experienced supervisor to monitor this order");
      recommendations.push("Implement additional quality checks");
      recommendations.push("Consider splitting large orders if possible");
    } else if (riskLevel === 'Medium') {
      recommendations.push("Provide additional guidance to worker");
      recommendations.push("Schedule regular check-ins during order processing");
    } else {
      recommendations.push("Standard monitoring procedures sufficient");
    }

    // Factor-specific recommendations
    if (factors.some(f => f.includes("Large order"))) {
      recommendations.push("Use visual guides for complex packaging");
    }

    if (factors.some(f => f.includes("Night shift"))) {
      recommendations.push("Ensure adequate lighting and breaks");
    }

    if (factors.some(f => f.includes("prior issues"))) {
      recommendations.push("Pair with experienced worker for mentoring");
    }

    return recommendations;
  }

  /**
   * Calculate hours until deadline
   * 
   * @param {string} deadline - Deadline string
   * @returns {number} Hours until deadline
   */
  getHoursUntilDeadline(deadline) {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate - now;
    return Math.max(0, diffMs / (1000 * 60 * 60)); // Convert to hours
  }

  /**
   * Get mock order data for demo purposes
   * 
   * @param {string} orderId - Order ID
   * @returns {Object} Mock order data
   */
  getMockOrder(orderId) {
    const mockOrders = {
      'ORD-001': {
        id: 'ORD-001',
        itemCount: 150,
        orderType: 'Bulk',
        shippingDeadline: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours from now
        retailer: "Dick's Sporting Goods",
        priority: 'High'
      },
      'ORD-002': {
        id: 'ORD-002',
        itemCount: 45,
        orderType: 'Pack by Store',
        shippingDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
        retailer: "Dick's Sporting Goods",
        priority: 'Medium'
      },
      'ORD-003': {
        id: 'ORD-003',
        itemCount: 25,
        orderType: 'Direct to Store',
        shippingDeadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
        retailer: "Dick's Sporting Goods",
        priority: 'Low'
      }
    };

    return mockOrders[orderId] || mockOrders['ORD-001'];
  }

  /**
   * Get mock worker data for demo purposes
   * 
   * @param {string} workerId - Worker ID
   * @returns {Object} Mock worker data
   */
  getMockWorker(workerId) {
    const mockWorkers = {
      'johnny123': {
        id: 'johnny123',
        name: 'Johnny Appleseed',
        pastViolations: 7,
        experienceLevel: 'Senior',
        department: 'Warehouse',
        shiftPreference: 'Day'
      },
      'john456': {
        id: 'john456',
        name: 'John Smith',
        pastViolations: 2,
        experienceLevel: 'Junior',
        department: 'Warehouse',
        shiftPreference: 'Day'
      },
      'sarah789': {
        id: 'sarah789',
        name: 'Sarah Johnson',
        pastViolations: 0,
        experienceLevel: 'New',
        department: 'Packaging',
        shiftPreference: 'Night'
      },
      'mike001': {
        id: 'mike001',
        name: 'Mike Rodriguez',
        pastViolations: 1,
        experienceLevel: 'Senior',
        department: 'Warehouse',
        shiftPreference: 'Day'
      },
      'lisa002': {
        id: 'lisa002',
        name: 'Lisa Chen',
        pastViolations: 0,
        experienceLevel: 'Senior',
        department: 'Quality Control',
        shiftPreference: 'Day'
      },
      'david003': {
        id: 'david003',
        name: 'David Wilson',
        pastViolations: 3,
        experienceLevel: 'Junior',
        department: 'Packaging',
        shiftPreference: 'Night'
      },
      'emma004': {
        id: 'emma004',
        name: 'Emma Thompson',
        pastViolations: 1,
        experienceLevel: 'Senior',
        department: 'Warehouse',
        shiftPreference: 'Day'
      },
      'carlos005': {
        id: 'carlos005',
        name: 'Carlos Martinez',
        pastViolations: 4,
        experienceLevel: 'Junior',
        department: 'Shipping',
        shiftPreference: 'Night'
      },
      'jessica006': {
        id: 'jessica006',
        name: 'Jessica Brown',
        pastViolations: 0,
        experienceLevel: 'New',
        department: 'Packaging',
        shiftPreference: 'Day'
      },
      'alex007': {
        id: 'alex007',
        name: 'Alex Johnson',
        pastViolations: 2,
        experienceLevel: 'Senior',
        department: 'Warehouse',
        shiftPreference: 'Night'
      },
      'maria008': {
        id: 'maria008',
        name: 'Maria Garcia',
        pastViolations: 0,
        experienceLevel: 'Senior',
        department: 'Quality Control',
        shiftPreference: 'Day'
      },
      'kevin009': {
        id: 'kevin009',
        name: 'Kevin Lee',
        pastViolations: 5,
        experienceLevel: 'Junior',
        department: 'Packaging',
        shiftPreference: 'Night'
      },
      'rachel010': {
        id: 'rachel010',
        name: 'Rachel Davis',
        pastViolations: 1,
        experienceLevel: 'Senior',
        department: 'Warehouse',
        shiftPreference: 'Day'
      },
      'tom011': {
        id: 'tom011',
        name: 'Tom Anderson',
        pastViolations: 2,
        experienceLevel: 'Junior',
        department: 'Shipping',
        shiftPreference: 'Night'
      },
      'amy012': {
        id: 'amy012',
        name: 'Amy Taylor',
        pastViolations: 0,
        experienceLevel: 'New',
        department: 'Packaging',
        shiftPreference: 'Day'
      }
    };

    return mockWorkers[workerId] || mockWorkers['johnny123'];
  }

  /**
   * Get mock context data for demo purposes
   * 
   * @param {Object} contextInput - Context input from request
   * @returns {Object} Mock context data
   */
  getMockContext(contextInput) {
    return {
      timeOfDay: contextInput.timeOfDay || 'Day',
      dayOfWeek: contextInput.dayOfWeek || 'Wednesday',
      shiftLoad: contextInput.shiftLoad || 'Medium',
      weatherCondition: contextInput.weatherCondition || 'Clear',
      equipmentStatus: contextInput.equipmentStatus || 'Operational',
      supervisorAvailable: contextInput.supervisorAvailable || true
    };
  }
}

module.exports = RiskOverviewService;
