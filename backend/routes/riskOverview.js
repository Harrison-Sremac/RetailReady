/**
 * Risk Overview Routes Module
 * 
 * This module handles risk overview predictions for orders and workers.
 * It provides endpoints for getting proactive risk assessments based on
 * rules-based matching without requiring ML model training.
 * 
 * @fileoverview API routes for risk overview predictions
 * @author RetailReady Team
 * @version 1.0.0
 */

const express = require('express');
const RiskOverviewService = require('../services/riskOverview');

/**
 * Create risk overview router
 * 
 * @returns {express.Router} Express router instance
 */
function createRiskOverviewRouter() {
  const router = express.Router();
  const riskOverviewService = new RiskOverviewService();

  /**
   * POST /api/risk/overview
   * 
   * Get risk overview for an order and worker combination
   * 
   * Request Body:
   * - orderId: ID of the order to assess
   * - workerId: ID of the worker assigned
   * - context: Contextual factors (timeOfDay, dayOfWeek, shiftLoad, etc.)
   * 
   * @route POST /api/risk/overview
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  router.post('/', async (req, res) => {
    try {
      const { orderId, workerId, context } = req.body;
      
      // Validate required parameters
      if (!orderId || !workerId) {
        return res.status(400).json({ 
          error: 'Missing required parameters',
          message: 'orderId and workerId are required'
        });
      }

      console.log('Getting risk overview for order:', orderId, 'worker:', workerId);

      // Get mock data for demo purposes
      const order = riskOverviewService.getMockOrder(orderId);
      const worker = riskOverviewService.getMockWorker(workerId);
      const contextData = riskOverviewService.getMockContext(context || {});

      // Calculate risk overview
      const riskOverview = riskOverviewService.getRiskOverview(order, worker, contextData);

      console.log('Risk overview calculated:', {
        orderId: orderId,
        workerId: workerId,
        riskLevel: riskOverview.riskLevel,
        riskScore: riskOverview.riskScore,
        factorsCount: riskOverview.factors.length
      });

      res.json({
        success: true,
        data: riskOverview,
        message: 'Risk overview calculated successfully'
      });

    } catch (error) {
      console.error('Risk overview calculation error:', error);
      res.status(500).json({ 
        error: 'Risk overview calculation failed',
        message: error.message 
      });
    }
  });

  /**
   * GET /api/risk/overview/mock-data
   * 
   * Get available mock data for demo purposes
   * 
   * @route GET /api/risk/overview/mock-data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {void}
   */
  router.get('/mock-data', (req, res) => {
    const mockData = {
      orders: [
        {
          id: 'ORD-001',
          itemCount: 150,
          orderType: 'Bulk',
          shippingDeadline: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(),
          retailer: "Dick's Sporting Goods",
          priority: 'High',
          description: 'Large bulk order with tight deadline'
        },
        {
          id: 'ORD-002',
          itemCount: 45,
          orderType: 'Pack by Store',
          shippingDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          retailer: "Dick's Sporting Goods",
          priority: 'Medium',
          description: 'Medium complexity order'
        },
        {
          id: 'ORD-003',
          itemCount: 25,
          orderType: 'Direct to Store',
          shippingDeadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          retailer: "Dick's Sporting Goods",
          priority: 'Low',
          description: 'Simple direct-to-store order'
        }
      ],
      workers: [
        {
          id: 'johnny123',
          name: 'Johnny Appleseed',
          pastViolations: 7,
          experienceLevel: 'Senior',
          department: 'Warehouse',
          shiftPreference: 'Day',
          description: 'Experienced worker with some past issues'
        },
        {
          id: 'john456',
          name: 'John Smith',
          pastViolations: 2,
          experienceLevel: 'Junior',
          department: 'Warehouse',
          shiftPreference: 'Day',
          description: 'Junior worker with minimal violations'
        },
        {
          id: 'sarah789',
          name: 'Sarah Johnson',
          pastViolations: 0,
          experienceLevel: 'New',
          department: 'Packaging',
          shiftPreference: 'Night',
          description: 'New worker with clean record'
        },
        {
          id: 'mike001',
          name: 'Mike Rodriguez',
          pastViolations: 1,
          experienceLevel: 'Senior',
          department: 'Warehouse',
          shiftPreference: 'Day',
          description: 'Senior worker with excellent record'
        },
        {
          id: 'lisa002',
          name: 'Lisa Chen',
          pastViolations: 0,
          experienceLevel: 'Senior',
          department: 'Quality Control',
          shiftPreference: 'Day',
          description: 'Quality control specialist with perfect record'
        },
        {
          id: 'david003',
          name: 'David Wilson',
          pastViolations: 3,
          experienceLevel: 'Junior',
          department: 'Packaging',
          shiftPreference: 'Night',
          description: 'Junior worker with some violations'
        },
        {
          id: 'emma004',
          name: 'Emma Thompson',
          pastViolations: 1,
          experienceLevel: 'Senior',
          department: 'Warehouse',
          shiftPreference: 'Day',
          description: 'Senior worker with good record'
        },
        {
          id: 'carlos005',
          name: 'Carlos Martinez',
          pastViolations: 4,
          experienceLevel: 'Junior',
          department: 'Shipping',
          shiftPreference: 'Night',
          description: 'Junior worker with multiple violations'
        },
        {
          id: 'jessica006',
          name: 'Jessica Brown',
          pastViolations: 0,
          experienceLevel: 'New',
          department: 'Packaging',
          shiftPreference: 'Day',
          description: 'New worker with clean record'
        },
        {
          id: 'alex007',
          name: 'Alex Johnson',
          pastViolations: 2,
          experienceLevel: 'Senior',
          department: 'Warehouse',
          shiftPreference: 'Night',
          description: 'Senior worker with minor violations'
        },
        {
          id: 'maria008',
          name: 'Maria Garcia',
          pastViolations: 0,
          experienceLevel: 'Senior',
          department: 'Quality Control',
          shiftPreference: 'Day',
          description: 'Quality control specialist with perfect record'
        },
        {
          id: 'kevin009',
          name: 'Kevin Lee',
          pastViolations: 5,
          experienceLevel: 'Junior',
          department: 'Packaging',
          shiftPreference: 'Night',
          description: 'Junior worker with multiple violations'
        },
        {
          id: 'rachel010',
          name: 'Rachel Davis',
          pastViolations: 1,
          experienceLevel: 'Senior',
          department: 'Warehouse',
          shiftPreference: 'Day',
          description: 'Senior worker with excellent record'
        },
        {
          id: 'tom011',
          name: 'Tom Anderson',
          pastViolations: 2,
          experienceLevel: 'Junior',
          department: 'Shipping',
          shiftPreference: 'Night',
          description: 'Junior worker with minor violations'
        },
        {
          id: 'amy012',
          name: 'Amy Taylor',
          pastViolations: 0,
          experienceLevel: 'New',
          department: 'Packaging',
          shiftPreference: 'Day',
          description: 'New worker with clean record'
        }
      ],
      contextOptions: {
        timeOfDay: ['Day', 'Late', 'Night'],
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        shiftLoad: ['Low', 'Medium', 'High'],
        weatherCondition: ['Clear', 'Rain', 'Storm'],
        equipmentStatus: ['Operational', 'Maintenance', 'Down']
      }
    };

    res.json({
      success: true,
      data: mockData,
      message: 'Mock data retrieved successfully'
    });
  });

  /**
   * GET /api/risk/overview/config
   * 
   * Get risk overview configuration and available endpoints
   * 
   * @route GET /api/risk/overview/config
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {void}
   */
  router.get('/config', (req, res) => {
    const config = {
      service: 'Risk Overview Service',
      version: '1.0.0',
      description: 'Rules-based risk prediction for orders and workers',
      endpoints: {
        'POST /api/risk/overview': 'Get risk overview for order/worker combination',
        'GET /api/risk/overview/mock-data': 'Get available mock data for demo',
        'GET /api/risk/overview/config': 'Get service configuration'
      },
      riskLevels: {
        'Low': '0-1 risk factors',
        'Medium': '2-3 risk factors', 
        'High': '4+ risk factors'
      },
      riskFactors: [
        'Order size and complexity',
        'Worker experience and history',
        'Time of day and shift patterns',
        'Day of week effects',
        'Shift load and workload',
        'Environmental conditions',
        'Equipment status'
      ]
    };
    
    res.json({
      success: true,
      config: config,
      message: 'Risk overview configuration retrieved successfully'
    });
  });

  return router;
}

module.exports = createRiskOverviewRouter;
