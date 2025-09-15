/**
 * Task Assignment Routes Module
 * 
 * This module handles task-level worker assignment API endpoints for
 * Dick's Sporting Goods compliance optimization.
 * 
 * @fileoverview Task assignment API routes for compliance optimization
 * @author RetailReady Team
 * @version 1.0.0
 */

const express = require('express');
const TaskAssignmentService = require('../services/taskAssignmentService');

/**
 * Create task assignment router with database connection
 * 
 * @param {sqlite3.Database} db - Database connection instance
 * @returns {express.Router} Express router instance
 */
function createTaskAssignmentRouter(db) {
  const router = express.Router();
  const taskAssignmentService = new TaskAssignmentService(db);

  /**
   * POST /api/task-assignment/breakdown
   * Break down an order into compliance-critical tasks
   */
  router.post('/breakdown', async (req, res) => {
    try {
      const { 
        orderId, 
        itemCount, 
        orderType = 'Standard',
        retailer = "Dick's Sporting Goods",
        specialRequirements = []
      } = req.body;

      // Validate required fields
      if (!orderId || !itemCount) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'orderId and itemCount are required'
        });
      }

      // Break down order into tasks
      const orderBreakdown = taskAssignmentService.breakdownOrderIntoTasks({
        orderId,
        itemCount,
        orderType,
        retailer,
        specialRequirements
      });

      res.json({
        success: true,
        data: orderBreakdown
      });

    } catch (error) {
      console.error('Error breaking down order:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to break down order into tasks'
      });
    }
  });

  /**
   * POST /api/task-assignment/optimize
   * Optimize task assignments for an order
   */
  router.post('/optimize', async (req, res) => {
    try {
      const { orderBreakdown } = req.body;

      if (!orderBreakdown || !orderBreakdown.tasks) {
        return res.status(400).json({
          success: false,
          error: 'Missing order breakdown',
          message: 'orderBreakdown with tasks is required'
        });
      }

      // Get available workers
      const workers = await taskAssignmentService.getAllWorkers();
      
      if (workers.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No workers available',
          message: 'No workers found in the system'
        });
      }

      // Optimize task assignments
      const optimization = await taskAssignmentService.optimizeTaskAssignments(
        orderBreakdown, 
        workers
      );

      res.json({
        success: true,
        data: optimization
      });

    } catch (error) {
      console.error('Error optimizing task assignments:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to optimize task assignments'
      });
    }
  });

  /**
   * GET /api/task-assignment/worker/:workerId/profile
   * Get worker skill profile
   */
  router.get('/worker/:workerId/profile', async (req, res) => {
    try {
      const { workerId } = req.params;

      const profile = await taskAssignmentService.getWorkerSkillProfile(workerId);

      res.json({
        success: true,
        data: profile
      });

    } catch (error) {
      console.error('Error getting worker profile:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get worker profile'
      });
    }
  });

  /**
   * GET /api/task-assignment/workers
   * Get all workers with their skill profiles
   */
  router.get('/workers', async (req, res) => {
    try {
      const workers = await taskAssignmentService.getAllWorkers();
      
      // Get skill profiles for all workers
      const workersWithProfiles = await Promise.all(
        workers.map(async (worker) => {
          const profile = await taskAssignmentService.getWorkerSkillProfile(worker.worker_id);
          return {
            ...worker,
            profile
          };
        })
      );

      res.json({
        success: true,
        data: workersWithProfiles
      });

    } catch (error) {
      console.error('Error getting workers with profiles:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get workers with profiles'
      });
    }
  });

  /**
   * POST /api/task-assignment/simulate
   * Simulate different assignment strategies
   */
  router.post('/simulate', async (req, res) => {
    try {
      const { orderBreakdown, assignmentStrategy = 'optimized' } = req.body;

      if (!orderBreakdown || !orderBreakdown.tasks) {
        return res.status(400).json({
          success: false,
          error: 'Missing order breakdown',
          message: 'orderBreakdown with tasks is required'
        });
      }

      const workers = await taskAssignmentService.getAllWorkers();
      
      if (workers.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No workers available',
          message: 'No workers found in the system'
        });
      }

      let optimization;
      
      if (assignmentStrategy === 'optimized') {
        // Use optimized assignment
        optimization = await taskAssignmentService.optimizeTaskAssignments(
          orderBreakdown, 
          workers
        );
      } else if (assignmentStrategy === 'random') {
        // Random assignment for comparison
        const randomWorkers = [...workers].sort(() => Math.random() - 0.5);
        optimization = await taskAssignmentService.optimizeTaskAssignments(
          orderBreakdown, 
          randomWorkers
        );
      } else if (assignmentStrategy === 'worst') {
        // Worst-case assignment for comparison
        const worstWorkers = [...workers].reverse();
        optimization = await taskAssignmentService.optimizeTaskAssignments(
          orderBreakdown, 
          worstWorkers
        );
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid assignment strategy',
          message: 'Strategy must be: optimized, random, or worst'
        });
      }

      res.json({
        success: true,
        data: {
          ...optimization,
          strategy: assignmentStrategy
        }
      });

    } catch (error) {
      console.error('Error simulating assignments:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to simulate assignments'
      });
    }
  });

  /**
   * GET /api/task-assignment/stats
   * Get task assignment statistics
   */
  router.get('/stats', async (req, res) => {
    try {
      const stats = taskAssignmentService.getTaskAssignmentStats();
      const workers = await taskAssignmentService.getAllWorkers();

      res.json({
        success: true,
        data: {
          ...stats,
          totalWorkers: workers.length,
          availableWorkers: workers.map(w => ({
            id: w.worker_id,
            name: w.name,
            department: w.department
          }))
        }
      });

    } catch (error) {
      console.error('Error getting task assignment stats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get task assignment statistics'
      });
    }
  });

  /**
   * POST /api/task-assignment/complete-task
   * Complete a specific task assignment
   */
  router.post('/complete-task', async (req, res) => {
    try {
      const { 
        taskId, 
        workerId, 
        orderId, 
        status = 'completed',
        violationsOccurred = [],
        violationsPrevented = [],
        actualTime = null,
        notes = ''
      } = req.body;

      // Validate required fields
      if (!taskId || !workerId || !orderId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'taskId, workerId, and orderId are required'
        });
      }

      // Record task completion
      const taskCompletion = await db.run(`
        INSERT INTO task_completions (
          task_id, worker_id, order_id, status, 
          violations_occurred, violations_prevented, 
          actual_time, notes, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `, [
        taskId, workerId, orderId, status,
        JSON.stringify(violationsOccurred),
        JSON.stringify(violationsPrevented),
        actualTime, notes
      ]);

      res.json({
        success: true,
        data: {
          completionId: taskCompletion.lastID,
          taskId,
          workerId,
          orderId,
          status,
          violationsOccurred,
          violationsPrevented,
          actualTime,
          notes
        }
      });

    } catch (error) {
      console.error('Error completing task:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to complete task'
      });
    }
  });

  return router;
}

module.exports = createTaskAssignmentRouter;
