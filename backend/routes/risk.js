/**
 * Risk Calculation Routes Module
 * 
 * This module handles risk assessment calculations for compliance violations.
 * It provides endpoints for calculating financial risk and impact assessments.
 * 
 * @fileoverview API routes for risk assessment and calculation
 * @author RetailReady Team
 * @version 1.0.0
 */

const express = require('express');
const DatabaseService = require('../services/databaseService');
const RiskService = require('../services/riskService');

/**
 * Create risk router
 * 
 * @param {sqlite3.Database} db - Database connection instance
 * @returns {express.Router} Express router instance
 */
function createRiskRouter(db) {
  const router = express.Router();
  const dbService = new DatabaseService(db);
  const riskService = new RiskService();

  /**
   * POST /api/risk-score
   * 
   * Calculate risk score for a specific violation
   * 
   * Request Body:
   * - violationId: ID of the violation to assess
   * - units: Number of units affected
   * 
   * @route POST /api/risk-score
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  router.post('/score', async (req, res) => {
    try {
      const { violationId, units } = req.body;
      
      // Validate required parameters
      if (!violationId || !units) {
        return res.status(400).json({ 
          error: 'Missing required parameters',
          message: 'violationId and units are required'
        });
      }

      // Validate violationId
      if (isNaN(parseInt(violationId))) {
        return res.status(400).json({ 
          error: 'Invalid violation ID',
          message: 'violationId must be a valid number'
        });
      }

      // Validate units
      if (isNaN(parseInt(units)) || parseInt(units) <= 0) {
        return res.status(400).json({ 
          error: 'Invalid units',
          message: 'units must be a positive number'
        });
      }

      console.log('🎯 Calculating risk score for violation:', violationId, 'units:', units);

      // Get violation from database
      const violation = await dbService.getViolationById(parseInt(violationId));
      
      if (!violation) {
        return res.status(404).json({ 
          error: 'Violation not found',
          message: `No violation found with ID ${violationId}`
        });
      }

      // Calculate risk assessment
      const assessment = riskService.calculateRiskAssessment(violation, parseInt(units));

      console.log('✅ Risk calculation completed:', {
        violationId: violationId,
        estimatedFine: assessment.estimatedFine,
        riskLevel: assessment.riskLevel
      });

      res.json(assessment);

    } catch (error) {
      console.error('❌ Risk calculation error:', error);
      res.status(500).json({ 
        error: 'Risk calculation failed',
        message: error.message 
      });
    }
  });

  /**
   * POST /api/risk/batch
   * 
   * Calculate risk scores for multiple violations
   * 
   * Request Body:
   * - violations: Array of violation IDs
   * - units: Number of units affected for each violation
   * 
   * @route POST /api/risk/batch
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  router.post('/batch', async (req, res) => {
    try {
      const { violations, units } = req.body;
      
      // Validate required parameters
      if (!violations || !Array.isArray(violations) || violations.length === 0) {
        return res.status(400).json({ 
          error: 'Invalid violations parameter',
          message: 'violations must be a non-empty array'
        });
      }

      if (!units || isNaN(parseInt(units)) || parseInt(units) <= 0) {
        return res.status(400).json({ 
          error: 'Invalid units parameter',
          message: 'units must be a positive number'
        });
      }

      console.log('🎯 Calculating batch risk scores for', violations.length, 'violations');

      // Get all violations from database
      const violationPromises = violations.map(id => dbService.getViolationById(parseInt(id)));
      const violationResults = await Promise.all(violationPromises);

      // Filter out null results (violations not found)
      const validViolations = violationResults.filter(v => v !== null);
      
      if (validViolations.length === 0) {
        return res.status(404).json({ 
          error: 'No valid violations found',
          message: 'None of the provided violation IDs were found in the database'
        });
      }

      // Calculate risk statistics
      const statistics = riskService.getRiskStatistics(validViolations, parseInt(units));

      console.log('✅ Batch risk calculation completed:', {
        totalViolations: statistics.totalViolations,
        totalEstimatedFine: statistics.totalEstimatedFine,
        averageFine: statistics.averageFine
      });

      res.json({
        message: 'Batch risk calculation completed',
        statistics: statistics,
        processedViolations: validViolations.length,
        requestedViolations: violations.length
      });

    } catch (error) {
      console.error('❌ Batch risk calculation error:', error);
      res.status(500).json({ 
        error: 'Batch risk calculation failed',
        message: error.message 
      });
    }
  });

  /**
   * POST /api/risk/estimate
   * 
   * Estimate fine for a violation without storing in database
   * 
   * Request Body:
   * - violation: Violation object with fine structure
   * - units: Number of units affected
   * 
   * @route POST /api/risk/estimate
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  router.post('/estimate', async (req, res) => {
    try {
      const { violation, units } = req.body;
      
      // Validate required parameters
      if (!violation || !units) {
        return res.status(400).json({ 
          error: 'Missing required parameters',
          message: 'violation and units are required'
        });
      }

      // Validate violation object
      if (!violation.fine || typeof violation.fine !== 'string') {
        return res.status(400).json({ 
          error: 'Invalid violation object',
          message: 'violation must contain a fine field'
        });
      }

      // Validate units
      if (isNaN(parseInt(units)) || parseInt(units) <= 0) {
        return res.status(400).json({ 
          error: 'Invalid units',
          message: 'units must be a positive number'
        });
      }

      console.log('💰 Estimating fine for violation:', violation.fine, 'units:', units);

      // Calculate estimated fine
      const estimatedFine = riskService.calculateEstimatedFine(violation.fine, parseInt(units));
      const riskLevel = riskService.determineRiskLevel(estimatedFine);

      console.log('✅ Fine estimation completed:', {
        estimatedFine: estimatedFine,
        riskLevel: riskLevel
      });

      res.json({
        violation: violation,
        units: parseInt(units),
        estimatedFine: estimatedFine,
        riskLevel: riskLevel,
        calculationDetails: {
          fineText: violation.fine,
          units: parseInt(units)
        }
      });

    } catch (error) {
      console.error('❌ Fine estimation error:', error);
      res.status(500).json({ 
        error: 'Fine estimation failed',
        message: error.message 
      });
    }
  });

  /**
   * GET /api/risk/config
   * 
   * Get risk calculation configuration and thresholds
   * 
   * @route GET /api/risk/config
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {void}
   */
  router.get('/config', (req, res) => {
    const config = riskService.getRiskConfig();
    
    res.json({
      message: 'Risk calculation configuration',
      config: config,
      endpoints: {
        'POST /api/risk/score': 'Calculate risk score for a specific violation',
        'POST /api/risk/batch': 'Calculate risk scores for multiple violations',
        'POST /api/risk/estimate': 'Estimate fine without database lookup',
        'GET /api/risk/config': 'Get risk calculation configuration'
      }
    });
  });

  return router;
}

module.exports = createRiskRouter;
