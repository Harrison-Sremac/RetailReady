/**
 * Worker Routes Module
 * 
 * This module handles all worker-related API endpoints including
 * scanning operations, performance tracking, and real-time guidance.
 * 
 * @fileoverview Worker API routes for real-time compliance guidance
 * @author RetailReady Team
 * @version 1.0.0
 */

const express = require('express');
const WorkerService = require('../services/workerService');

/**
 * Create worker router with database connection
 * 
 * @param {sqlite3.Database} db - Database connection instance
 * @returns {express.Router} Express router instance
 */
function createWorkerRouter(db) {
  const router = express.Router();
  const workerService = new WorkerService(db);

  /**
   * POST /api/worker/scan
   * Create a new worker scan and return contextual guidance
   */
  router.post('/scan', async (req, res) => {
    try {
      const { workerId, orderBarcode, sku, cartonId, orderType, retailer } = req.body;

      // Validate required fields
      if (!workerId || !orderBarcode) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'workerId and orderBarcode are required'
        });
      }

      // Verify worker exists
      const worker = await workerService.getWorker(workerId);
      if (!worker) {
        return res.status(404).json({
          success: false,
          error: 'Worker not found',
          message: `Worker with ID ${workerId} not found`
        });
      }

      // Create scan record
      const scanId = await workerService.createScan({
        workerId,
        orderBarcode,
        sku,
        cartonId,
        orderType,
        retailer
      });

      // Generate contextual guidance
      const guidance = await workerService.generateGuidance(
        orderBarcode,
        retailer || "Dick's Sporting Goods",
        orderType || "Standard"
      );

      // Get worker's today's performance
      const performance = await workerService.getWorkerPerformance(workerId, 'today');

      res.json({
        success: true,
        data: {
          scanId,
          worker: {
            id: worker.worker_id,
            name: worker.name,
            department: worker.department
          },
          order: {
            barcode: orderBarcode,
            type: orderType || "Standard",
            retailer: retailer || "Dick's Sporting Goods"
          },
          guidance: {
            currentStep: 1,
            totalSteps: guidance.steps.length,
            steps: guidance.steps,
            warnings: guidance.warnings,
            visualGuides: guidance.visualGuides
          },
          performance: {
            scansToday: performance.totalScans,
            accuracyRate: performance.accuracyRate,
            finesSaved: performance.totalFineSaved,
            streak: performance.completedScans - performance.violationsOccurred
          }
        }
      });

    } catch (error) {
      console.error('Error in worker scan:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to process worker scan'
      });
    }
  });

  /**
   * POST /api/worker/scan/:scanId/complete
   * Complete a scan with results
   */
  router.post('/scan/:scanId/complete', async (req, res) => {
    try {
      const { scanId } = req.params;
      const { 
        status = 'completed',
        violationsPrevented = [],
        violationsOccurred = [],
        estimatedFineSaved = 0,
        estimatedFineIncurred = 0
      } = req.body;

      await workerService.updateScan(parseInt(scanId), {
        status,
        violationsPrevented: JSON.stringify(violationsPrevented),
        violationsOccurred: JSON.stringify(violationsOccurred),
        estimatedFineSaved,
        estimatedFineIncurred
      });

      res.json({
        success: true,
        message: 'Scan completed successfully',
        data: {
          scanId: parseInt(scanId),
          status,
          violationsPrevented,
          violationsOccurred,
          estimatedFineSaved,
          estimatedFineIncurred
        }
      });

    } catch (error) {
      console.error('Error completing scan:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to complete scan'
      });
    }
  });

  /**
   * GET /api/worker/:workerId/performance
   * Get worker performance metrics
   */
  router.get('/:workerId/performance', async (req, res) => {
    try {
      const { workerId } = req.params;
      const { timeframe = 'today' } = req.query;

      const worker = await workerService.getWorker(workerId);
      if (!worker) {
        return res.status(404).json({
          success: false,
          error: 'Worker not found',
          message: `Worker with ID ${workerId} not found`
        });
      }

      const performance = await workerService.getWorkerPerformance(workerId, timeframe);

      res.json({
        success: true,
        data: {
          worker: {
            id: worker.worker_id,
            name: worker.name,
            department: worker.department
          },
          timeframe,
          performance
        }
      });

    } catch (error) {
      console.error('Error getting worker performance:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get worker performance'
      });
    }
  });

  /**
   * GET /api/worker/leaderboard
   * Get worker leaderboard with performance metrics
   */
  router.get('/leaderboard', async (req, res) => {
    try {
      const { timeframe = 'today' } = req.query;

      const workers = await workerService.getAllWorkersWithPerformance(timeframe);

      // Sort by accuracy rate and fines saved
      const leaderboard = workers
        .sort((a, b) => {
          // Primary sort: accuracy rate
          if (b.performance.accuracyRate !== a.performance.accuracyRate) {
            return b.performance.accuracyRate - a.performance.accuracyRate;
          }
          // Secondary sort: fines saved
          return b.performance.totalFineSaved - a.performance.totalFineSaved;
        })
        .map((worker, index) => ({
          rank: index + 1,
          worker: {
            id: worker.worker_id,
            name: worker.name,
            department: worker.department
          },
          performance: worker.performance
        }));

      res.json({
        success: true,
        data: {
          timeframe,
          leaderboard
        }
      });

    } catch (error) {
      console.error('Error getting leaderboard:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get leaderboard'
      });
    }
  });

  /**
   * GET /api/worker/:workerId/guidance/:orderBarcode
   * Get guidance for a specific order
   */
  router.get('/:workerId/guidance/:orderBarcode', async (req, res) => {
    try {
      const { workerId, orderBarcode } = req.params;

      const worker = await workerService.getWorker(workerId);
      if (!worker) {
        return res.status(404).json({
          success: false,
          error: 'Worker not found',
          message: `Worker with ID ${workerId} not found`
        });
      }

      // Generate fresh guidance
      const guidance = await workerService.generateGuidance(
        orderBarcode,
        "Dick's Sporting Goods",
        "Standard"
      );

      res.json({
        success: true,
        data: {
          worker: {
            id: worker.worker_id,
            name: worker.name
          },
          order: {
            barcode: orderBarcode
          },
          guidance
        }
      });

    } catch (error) {
      console.error('Error getting guidance:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get guidance'
      });
    }
  });

  /**
   * GET /api/worker
   * Get all workers
   */
  router.get('/', async (req, res) => {
    try {
      const workers = await workerService.getAllWorkers();

      res.json({
        success: true,
        data: workers
      });

    } catch (error) {
      console.error('Error getting workers:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get workers'
      });
    }
  });

  return router;
}

module.exports = createWorkerRouter;
