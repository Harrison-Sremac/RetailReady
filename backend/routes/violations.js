/**
 * Violations Routes Module
 * 
 * This module handles all HTTP routes related to compliance violations.
 * It provides endpoints for retrieving, filtering, and managing violation data.
 * 
 * @fileoverview API routes for compliance violations management
 * @author RetailReady Team
 * @version 1.0.0
 */

const express = require('express');
const DatabaseService = require('../services/databaseService');

/**
 * Create violations router
 * 
 * @param {sqlite3.Database} db - Database connection instance
 * @returns {express.Router} Express router instance
 */
function createViolationsRouter(db) {
  const router = express.Router();
  const dbService = new DatabaseService(db);

  /**
   * GET /api/violations
   * 
   * Retrieve all violations with optional filtering
   * 
   * Query Parameters:
   * - category: Filter by category (optional)
   * - severity: Filter by severity (optional)
   * - retailer: Filter by retailer (optional)
   * 
   * @route GET /api/violations
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  router.get('/', async (req, res) => {
    try {
      const { category, severity, retailer } = req.query;
      
      // Build filters object
      const filters = {};
      if (category) filters.category = category;
      if (severity) filters.severity = severity;
      if (retailer) filters.retailer = retailer;
      
      console.log('Fetching violations with filters:', filters);
      
      const violations = await dbService.getViolations(filters);
      
      res.json(violations);
    } catch (error) {
      console.error('Error fetching violations:', error);
      res.status(500).json({ 
        error: 'Failed to fetch violations',
        message: error.message 
      });
    }
  });

  /**
   * GET /api/violations/categories
   * 
   * Retrieve all unique categories
   * 
   * @route GET /api/violations/categories
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  router.get('/categories', async (req, res) => {
    try {
      console.log('Fetching categories');
      
      const categories = await dbService.getCategories();
      
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ 
        error: 'Failed to fetch categories',
        message: error.message 
      });
    }
  });

  /**
   * GET /api/violations/retailers
   * 
   * Retrieve all unique retailers
   * 
   * @route GET /api/violations/retailers
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  router.get('/retailers', async (req, res) => {
    try {
      console.log('Fetching retailers');
      
      const retailers = await dbService.getRetailers();
      
      res.json(retailers);
    } catch (error) {
      console.error('Error fetching retailers:', error);
      res.status(500).json({ 
        error: 'Failed to fetch retailers',
        message: error.message 
      });
    }
  });

  /**
   * GET /api/violations/database-view
   * 
   * Retrieve organized database view by retailer and category
   * 
   * @route GET /api/violations/database-view
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  router.get('/database-view', async (req, res) => {
    try {
      console.log('Fetching database view');
      
      const databaseView = await dbService.getDatabaseView();
      
      res.json({
        message: 'Database view organized by retailer and category',
        total_components: databaseView.length,
        data: databaseView
      });
    } catch (error) {
      console.error('Error fetching database view:', error);
      res.status(500).json({ 
        error: 'Failed to fetch database view',
        message: error.message 
      });
    }
  });

  /**
   * GET /api/violations/:id
   * 
   * Retrieve a specific violation by ID
   * 
   * @route GET /api/violations/:id
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate ID parameter
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ 
          error: 'Invalid violation ID',
          message: 'Violation ID must be a valid number'
        });
      }
      
      console.log('Fetching violation with ID:', id);
      
      const violation = await dbService.getViolationById(parseInt(id));
      
      if (!violation) {
        return res.status(404).json({ 
          error: 'Violation not found',
          message: `No violation found with ID ${id}`
        });
      }
      
      res.json(violation);
    } catch (error) {
      console.error('Error fetching violation:', error);
      res.status(500).json({ 
        error: 'Failed to fetch violation',
        message: error.message 
      });
    }
  });

  /**
   * GET /api/violations/database-view/:retailer/:category
   * 
   * Retrieve detailed view for specific retailer/category combination
   * 
   * @route GET /api/violations/database-view/:retailer/:category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  router.get('/database-view/:retailer/:category', async (req, res) => {
    try {
      const { retailer, category } = req.params;
      
      // Validate parameters
      if (!retailer || !category) {
        return res.status(400).json({ 
          error: 'Missing parameters',
          message: 'Both retailer and category parameters are required'
        });
      }
      
      console.log('Fetching detailed view for:', { retailer, category });
      
      const violations = await dbService.getViolationsByRetailerAndCategory(retailer, category);
      
      if (violations.length === 0) {
        return res.status(404).json({ 
          error: 'No data found',
          message: `No violations found for retailer: ${retailer}, category: ${category}`
        });
      }
      
      res.json({
        retailer: retailer,
        category: category,
        total_items: violations.length,
        violations: violations
      });
    } catch (error) {
      console.error('Error fetching detailed view:', error);
      res.status(500).json({ 
        error: 'Failed to fetch detailed view',
        message: error.message 
      });
    }
  });

  /**
   * GET /api/violations/stats
   * 
   * Retrieve database statistics
   * 
   * @route GET /api/violations/stats
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  router.get('/stats', async (req, res) => {
    try {
      console.log('Fetching database statistics');
      
      const stats = await dbService.getDatabaseStats();
      
      res.json({
        message: 'Database statistics',
        stats: stats
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ 
        error: 'Failed to fetch statistics',
        message: error.message 
      });
    }
  });

  /**
   * DELETE /api/violations/clear-uploaded
   * 
   * Clear all uploaded compliance data
   * 
   * @route DELETE /api/violations/clear-uploaded
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  router.delete('/clear-uploaded', async (req, res) => {
    try {
      console.log('Clearing uploaded compliance data...');
      
      const deletedCount = await dbService.clearUploadedData();
      
      console.log(`Cleared ${deletedCount} uploaded violations`);
      
      res.json({
        success: true,
        message: `Successfully cleared ${deletedCount} uploaded compliance requirements`,
        deleted_count: deletedCount
      });
    } catch (error) {
      console.error('Error clearing uploaded data:', error);
      res.status(500).json({ 
        error: 'Failed to clear uploaded data',
        message: error.message 
      });
    }
  });

  return router;
}

module.exports = createViolationsRouter;
