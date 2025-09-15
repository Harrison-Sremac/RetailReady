/**
 * Worker Management Routes Module
 * 
 * This module handles worker management API endpoints including
 * performance tracking, violation analysis, and intervention recommendations.
 * 
 * @fileoverview Worker management API routes for performance tracking
 * @author RetailReady Team
 * @version 1.0.0
 */

const express = require('express');

/**
 * Create worker management router with database connection
 * 
 * @param {sqlite3.Database} db - Database connection instance
 * @returns {express.Router} Express router instance
 */
function createWorkerManagementRouter(db) {
  const router = express.Router();

  /**
   * GET /api/worker-management/dashboard
   * Get comprehensive worker performance dashboard data
   */
  router.get('/dashboard', async (req, res) => {
    try {
      // Get all workers with their performance data
      const workers = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            w.worker_id,
            w.name,
            w.department,
            COUNT(ws.id) as total_scans,
            SUM(CASE WHEN ws.violations_occurred = '[]' OR ws.violations_occurred IS NULL THEN 1 ELSE 0 END) as successful_scans,
            SUM(ws.estimated_fine_incurred) as total_fines_incurred,
            SUM(ws.estimated_fine_saved) as total_fines_saved,
            MAX(ws.timestamp) as last_scan_date
          FROM workers w
          LEFT JOIN worker_scans ws ON w.worker_id = ws.worker_id 
            AND ws.timestamp >= datetime('now', '-90 days')
          GROUP BY w.worker_id, w.name, w.department
          ORDER BY w.name
        `, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });

      // Get violation details for each worker
      const workersWithViolations = await Promise.all(
        workers.map(async (worker) => {
          const violations = await new Promise((resolve, reject) => {
            db.all(`
              SELECT 
                json_extract(ws.violations_occurred, '$[0]') as violation_type,
                COUNT(*) as violation_count,
                SUM(ws.estimated_fine_incurred) as total_fines
              FROM worker_scans ws
              WHERE ws.worker_id = ? 
                AND ws.violations_occurred IS NOT NULL 
                AND ws.violations_occurred != '[]'
                AND ws.timestamp >= datetime('now', '-90 days')
              GROUP BY violation_type
              HAVING violation_type IS NOT NULL
            `, [worker.worker_id], (err, rows) => {
              if (err) {
                reject(err);
              } else {
                resolve(rows);
              }
            });
          });

          // Calculate accuracy rate
          const accuracyRate = worker.total_scans > 0 
            ? (worker.successful_scans / worker.total_scans) * 100 
            : 100;

          // Determine if intervention is needed
          const totalViolations = violations.reduce((sum, v) => sum + v.violation_count, 0);
          const interventionNeeded = accuracyRate < 70 || totalViolations > 10 || worker.total_fines_incurred > 1000;

          // Determine risk level
          let riskLevel = 'Low';
          if (accuracyRate < 60 || totalViolations > 20 || worker.total_fines_incurred > 2000) {
            riskLevel = 'High';
          } else if (accuracyRate < 80 || totalViolations > 5 || worker.total_fines_incurred > 500) {
            riskLevel = 'Medium';
          }

          return {
            worker_id: worker.worker_id,
            name: worker.name,
            department: worker.department,
            total_scans: worker.total_scans || 0,
            successful_scans: worker.successful_scans || 0,
            accuracy_rate: accuracyRate,
            total_fines_incurred: worker.total_fines_incurred || 0,
            total_fines_saved: worker.total_fines_saved || 0,
            violations: violations,
            last_scan_date: worker.last_scan_date,
            intervention_needed: interventionNeeded,
            risk_level: riskLevel
          };
        })
      );

      res.json({
        success: true,
        data: workersWithViolations
      });

    } catch (error) {
      console.error('Error getting worker dashboard data:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get worker dashboard data'
      });
    }
  });

  /**
   * GET /api/worker-management/worker/:workerId/details
   * Get detailed performance data for a specific worker
   */
  router.get('/worker/:workerId/details', async (req, res) => {
    try {
      const { workerId } = req.params;

      // Get worker basic info
      const worker = await new Promise((resolve, reject) => {
        db.get('SELECT worker_id, name, department FROM workers WHERE worker_id = ?', [workerId], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });

      if (!worker) {
        return res.status(404).json({
          success: false,
          error: 'Worker not found',
          message: `Worker with ID ${workerId} not found`
        });
      }

      // Get detailed scan history
      const scanHistory = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            order_barcode,
            sku,
            carton_id,
            order_type,
            retailer,
            timestamp,
            status,
            violations_prevented,
            violations_occurred,
            estimated_fine_saved,
            estimated_fine_incurred
          FROM worker_scans
          WHERE worker_id = ?
          ORDER BY timestamp DESC
          LIMIT 50
        `, [workerId], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });

      // Get violation trends over time
      const violationTrends = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            DATE(timestamp) as date,
            COUNT(*) as total_scans,
            SUM(CASE WHEN violations_occurred = '[]' OR violations_occurred IS NULL THEN 1 ELSE 0 END) as successful_scans,
            SUM(CASE WHEN violations_occurred != '[]' AND violations_occurred IS NOT NULL THEN 1 ELSE 0 END) as violations
          FROM worker_scans
          WHERE worker_id = ? 
            AND timestamp >= datetime('now', '-30 days')
          GROUP BY DATE(timestamp)
          ORDER BY date DESC
        `, [workerId], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });

      res.json({
        success: true,
        data: {
          worker,
          scanHistory,
          violationTrends
        }
      });

    } catch (error) {
      console.error('Error getting worker details:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get worker details'
      });
    }
  });

  /**
   * POST /api/worker-management/intervention
   * Schedule an intervention for a worker
   */
  router.post('/intervention', async (req, res) => {
    try {
      const { workerId, interventionType, scheduledDate, notes } = req.body;

      if (!workerId || !interventionType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'workerId and interventionType are required'
        });
      }

      // Record intervention
      const intervention = await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO worker_interventions (
            worker_id, intervention_type, scheduled_date, notes, created_at
          ) VALUES (?, ?, ?, ?, datetime('now'))
        `, [workerId, interventionType, scheduledDate, notes], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID });
          }
        });
      });

      res.json({
        success: true,
        data: {
          interventionId: intervention.id,
          workerId,
          interventionType,
          scheduledDate,
          notes
        }
      });

    } catch (error) {
      console.error('Error scheduling intervention:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to schedule intervention'
      });
    }
  });

  /**
   * GET /api/worker-management/interventions
   * Get all scheduled interventions
   */
  router.get('/interventions', async (req, res) => {
    try {
      const interventions = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            wi.id,
            wi.worker_id,
            w.name as worker_name,
            w.department,
            wi.intervention_type,
            wi.scheduled_date,
            wi.notes,
            wi.created_at,
            wi.completed_at
          FROM worker_interventions wi
          JOIN workers w ON wi.worker_id = w.worker_id
          ORDER BY wi.scheduled_date ASC
        `, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });

      res.json({
        success: true,
        data: interventions
      });

    } catch (error) {
      console.error('Error getting interventions:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get interventions'
      });
    }
  });

  /**
   * GET /api/worker-management/analytics
   * Get analytics data for worker management
   */
  router.get('/analytics', async (req, res) => {
    try {
      // Department performance summary
      const departmentStats = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            w.department,
            COUNT(DISTINCT w.worker_id) as total_workers,
            AVG(CASE 
              WHEN ws.total_scans > 0 THEN (ws.successful_scans * 100.0 / ws.total_scans)
              ELSE 100 
            END) as avg_accuracy,
            SUM(ws.total_fines_incurred) as total_fines,
            SUM(ws.total_violations) as total_violations
          FROM workers w
          LEFT JOIN (
            SELECT 
              worker_id,
              COUNT(*) as total_scans,
              SUM(CASE WHEN violations_occurred = '[]' OR violations_occurred IS NULL THEN 1 ELSE 0 END) as successful_scans,
              SUM(estimated_fine_incurred) as total_fines_incurred,
              SUM(CASE WHEN violations_occurred != '[]' AND violations_occurred IS NOT NULL THEN 1 ELSE 0 END) as total_violations
            FROM worker_scans
            WHERE timestamp >= datetime('now', '-90 days')
            GROUP BY worker_id
          ) ws ON w.worker_id = ws.worker_id
          GROUP BY w.department
        `, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });

      // Top performers and worst performers
      const topPerformers = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            w.worker_id,
            w.name,
            w.department,
            COUNT(ws.id) as total_scans,
            SUM(CASE WHEN ws.violations_occurred = '[]' OR ws.violations_occurred IS NULL THEN 1 ELSE 0 END) as successful_scans,
            (SUM(CASE WHEN ws.violations_occurred = '[]' OR ws.violations_occurred IS NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(ws.id)) as accuracy_rate
          FROM workers w
          LEFT JOIN worker_scans ws ON w.worker_id = ws.worker_id 
            AND ws.timestamp >= datetime('now', '-90 days')
          GROUP BY w.worker_id, w.name, w.department
          HAVING total_scans >= 10
          ORDER BY accuracy_rate DESC
          LIMIT 5
        `, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });

      const worstPerformers = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            w.worker_id,
            w.name,
            w.department,
            COUNT(ws.id) as total_scans,
            SUM(CASE WHEN ws.violations_occurred = '[]' OR ws.violations_occurred IS NULL THEN 1 ELSE 0 END) as successful_scans,
            (SUM(CASE WHEN ws.violations_occurred = '[]' OR ws.violations_occurred IS NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(ws.id)) as accuracy_rate
          FROM workers w
          LEFT JOIN worker_scans ws ON w.worker_id = ws.worker_id 
            AND ws.timestamp >= datetime('now', '-90 days')
          GROUP BY w.worker_id, w.name, w.department
          HAVING total_scans >= 10
          ORDER BY accuracy_rate ASC
          LIMIT 5
        `, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });

      res.json({
        success: true,
        data: {
          departmentStats,
          topPerformers,
          worstPerformers
        }
      });

    } catch (error) {
      console.error('Error getting analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to get analytics data'
      });
    }
  });

  /**
   * POST /api/worker-management/seed-scan-data
   * Generate mock historical scan data for workers
   */
  router.post('/seed-scan-data', async (req, res) => {
    try {
      console.log('Seeding worker scan data...');
      
      const scanStmt = db.prepare(`
        INSERT INTO worker_scans (worker_id, order_barcode, sku, carton_id, order_type, retailer, status, violations_prevented, violations_occurred, estimated_fine_saved, estimated_fine_incurred, timestamp) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      // Generate mock scan data for the last 30 days
      const workers = [
        { worker_id: 'johnny123', name: 'Johnny Appleseed' },
        { worker_id: 'john456', name: 'John Smith' },
        { worker_id: 'sarah789', name: 'Sarah Johnson' },
        { worker_id: 'mike001', name: 'Mike Rodriguez' },
        { worker_id: 'lisa002', name: 'Lisa Chen' },
        { worker_id: 'maria008', name: 'Maria Garcia' },
        { worker_id: 'kevin009', name: 'Kevin Brown' },
        { worker_id: 'rachel010', name: 'Rachel Davis' },
        { worker_id: 'tom011', name: 'Tom Wilson' },
        { worker_id: 'alex007', name: 'Alex Johnson' },
        { worker_id: 'amy012', name: 'Amy Taylor' },
        { worker_id: 'carlos005', name: 'Carlos Martinez' },
        { worker_id: 'david003', name: 'David Lee' },
        { worker_id: 'emma014', name: 'Emma White' },
        { worker_id: 'james013', name: 'James Anderson' }
      ];
      
      const orderTypes = ['Standard', 'Express', 'Bulk', 'Fragile'];
      const retailers = ['Target', 'Walmart', 'Amazon', 'Best Buy'];
      const statuses = ['completed', 'completed', 'completed', 'completed', 'completed']; // Mostly successful
      
      let seededCount = 0;
      
      for (let i = 0; i < 200; i++) {
        const worker = workers[Math.floor(Math.random() * workers.length)];
        const daysAgo = Math.floor(Math.random() * 30);
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - daysAgo);
        timestamp.setHours(Math.floor(Math.random() * 12) + 6); // 6 AM to 6 PM
        timestamp.setMinutes(Math.floor(Math.random() * 60));
        
        const hasViolations = Math.random() < 0.15; // 15% chance of violations
        const violationsOccurred = hasViolations ? JSON.stringify(['Label placement', 'Packaging']) : '[]';
        const violationsPrevented = Math.random() < 0.3 ? JSON.stringify(['UPC verification']) : '[]';
        const fineIncurred = hasViolations ? Math.floor(Math.random() * 500) + 50 : 0;
        const fineSaved = Math.random() < 0.3 ? Math.floor(Math.random() * 200) + 25 : 0;
        
        scanStmt.run([
          worker.worker_id,
          `ORD-${String(i + 1).padStart(6, '0')}`,
          `SKU-${Math.floor(Math.random() * 10000)}`,
          `CARTON-${Math.floor(Math.random() * 1000)}`,
          orderTypes[Math.floor(Math.random() * orderTypes.length)],
          retailers[Math.floor(Math.random() * retailers.length)],
          statuses[Math.floor(Math.random() * statuses.length)],
          violationsPrevented,
          violationsOccurred,
          fineSaved,
          fineIncurred,
          timestamp.toISOString()
        ]);
        
        seededCount++;
      }
      
      scanStmt.finalize();
      
      res.json({
        success: true,
        message: `Successfully seeded ${seededCount} worker scan records`,
        seeded_count: seededCount
      });

    } catch (error) {
      console.error('Error seeding worker scan data:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to seed worker scan data'
      });
    }
  });

  return router;
}

module.exports = createWorkerManagementRouter;
