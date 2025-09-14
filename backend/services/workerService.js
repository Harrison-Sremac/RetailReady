/**
 * Worker Service Module
 * 
 * This module provides services for worker management, scanning operations,
 * and real-time guidance generation for warehouse workers.
 * 
 * @fileoverview Worker service layer for real-time compliance guidance
 * @author RetailReady Team
 * @version 1.0.0
 */

/**
 * Worker service class
 * Provides methods for worker operations and real-time guidance
 */
class WorkerService {
  /**
   * Initialize the worker service
   * 
   * @param {sqlite3.Database} db - Database connection instance
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Get worker by ID
   * 
   * @param {string} workerId - Worker ID
   * @returns {Promise<Object|null>} Worker object or null if not found
   */
  async getWorker(workerId) {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM workers WHERE worker_id = ?", [workerId], (err, row) => {
        if (err) {
          console.error('Database error in getWorker:', err);
          reject(new Error('Database query failed'));
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Get all workers
   * 
   * @returns {Promise<Array>} Array of worker objects
   */
  async getAllWorkers() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM workers ORDER BY name", (err, rows) => {
        if (err) {
          console.error('Database error in getAllWorkers:', err);
          reject(new Error('Database query failed'));
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Create a new worker scan record
   * 
   * @param {Object} scanData - Scan data
   * @param {string} scanData.workerId - Worker ID
   * @param {string} scanData.orderBarcode - Order barcode
   * @param {string} [scanData.sku] - SKU
   * @param {string} [scanData.cartonId] - Carton ID
   * @param {string} [scanData.orderType] - Order type
   * @param {string} [scanData.retailer] - Retailer
   * @returns {Promise<number>} ID of the created scan record
   */
  async createScan(scanData) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO worker_scans (worker_id, order_barcode, sku, carton_id, order_type, retailer) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([
        scanData.workerId,
        scanData.orderBarcode,
        scanData.sku || null,
        scanData.cartonId || null,
        scanData.orderType || null,
        scanData.retailer || null
      ], function(err) {
        stmt.finalize();
        
        if (err) {
          console.error('Database error in createScan:', err);
          reject(new Error('Failed to create scan record'));
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  /**
   * Update scan with completion data
   * 
   * @param {number} scanId - Scan ID
   * @param {Object} completionData - Completion data
   * @param {string} [completionData.status] - Scan status
   * @param {string} [completionData.violationsPrevented] - JSON string of prevented violations
   * @param {string} [completionData.violationsOccurred] - JSON string of occurred violations
   * @param {number} [completionData.estimatedFineSaved] - Estimated fine saved
   * @param {number} [completionData.estimatedFineIncurred] - Estimated fine incurred
   * @returns {Promise<void>}
   */
  async updateScan(scanId, completionData) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];
      
      if (completionData.status) {
        fields.push('status = ?');
        values.push(completionData.status);
      }
      
      if (completionData.violationsPrevented) {
        fields.push('violations_prevented = ?');
        values.push(completionData.violationsPrevented);
      }
      
      if (completionData.violationsOccurred) {
        fields.push('violations_occurred = ?');
        values.push(completionData.violationsOccurred);
      }
      
      if (completionData.estimatedFineSaved !== undefined) {
        fields.push('estimated_fine_saved = ?');
        values.push(completionData.estimatedFineSaved);
      }
      
      if (completionData.estimatedFineIncurred !== undefined) {
        fields.push('estimated_fine_incurred = ?');
        values.push(completionData.estimatedFineIncurred);
      }
      
      if (fields.length === 0) {
        resolve();
        return;
      }
      
      values.push(scanId);
      
      const query = `UPDATE worker_scans SET ${fields.join(', ')} WHERE id = ?`;
      
      this.db.run(query, values, function(err) {
        if (err) {
          console.error('Database error in updateScan:', err);
          reject(new Error('Failed to update scan record'));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get worker performance metrics
   * 
   * @param {string} workerId - Worker ID
   * @param {string} [timeframe] - Timeframe ('today', 'week', 'month')
   * @returns {Promise<Object>} Performance metrics
   */
  async getWorkerPerformance(workerId, timeframe = 'today') {
    return new Promise((resolve, reject) => {
      let dateFilter = '';
      const params = [workerId];
      
      switch (timeframe) {
        case 'today':
          dateFilter = "AND DATE(timestamp) = DATE('now')";
          break;
        case 'week':
          dateFilter = "AND timestamp >= datetime('now', '-7 days')";
          break;
        case 'month':
          dateFilter = "AND timestamp >= datetime('now', '-30 days')";
          break;
      }
      
      const query = `
        SELECT 
          COUNT(*) as total_scans,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_scans,
          COUNT(CASE WHEN violations_prevented IS NOT NULL AND violations_prevented != '' THEN 1 END) as violations_prevented_count,
          COUNT(CASE WHEN violations_occurred IS NOT NULL AND violations_occurred != '' THEN 1 END) as violations_occurred_count,
          COALESCE(SUM(estimated_fine_saved), 0) as total_fine_saved,
          COALESCE(SUM(estimated_fine_incurred), 0) as total_fine_incurred
        FROM worker_scans 
        WHERE worker_id = ? ${dateFilter}
      `;
      
      this.db.get(query, params, (err, row) => {
        if (err) {
          console.error('Database error in getWorkerPerformance:', err);
          reject(new Error('Database query failed'));
        } else {
          const metrics = {
            totalScans: row.total_scans,
            completedScans: row.completed_scans,
            violationsPrevented: row.violations_prevented_count,
            violationsOccurred: row.violations_occurred_count,
            totalFineSaved: row.total_fine_saved,
            totalFineIncurred: row.total_fine_incurred,
            accuracyRate: row.completed_scans > 0 ? 
              Math.round((row.completed_scans - row.violations_occurred_count) / row.completed_scans * 100) : 0
          };
          resolve(metrics);
        }
      });
    });
  }

  /**
   * Get all workers with their performance metrics
   * 
   * @param {string} [timeframe] - Timeframe ('today', 'week', 'month')
   * @returns {Promise<Array>} Array of workers with performance data
   */
  async getAllWorkersWithPerformance(timeframe = 'today') {
    return new Promise(async (resolve, reject) => {
      try {
        const workers = await this.getAllWorkers();
        const workersWithPerformance = await Promise.all(
          workers.map(async (worker) => {
            const performance = await this.getWorkerPerformance(worker.worker_id, timeframe);
            return {
              ...worker,
              performance
            };
          })
        );
        resolve(workersWithPerformance);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate contextual guidance for an order
   * 
   * @param {string} orderBarcode - Order barcode
   * @param {string} retailer - Retailer name
   * @param {string} orderType - Order type
   * @returns {Promise<Object>} Guidance object with steps and warnings
   */
  async generateGuidance(orderBarcode, retailer, orderType) {
    // Get relevant violations for this retailer
    const violations = await this.getViolationsForRetailer(retailer);
    
    // Generate step-by-step guidance based on violations
    const guidance = {
      orderBarcode,
      retailer,
      orderType,
      steps: this.generateSteps(violations, orderType),
      warnings: this.generateWarnings(violations),
      visualGuides: this.generateVisualGuides(violations)
    };
    
    // Store guidance for future reference
    await this.storeGuidance(guidance);
    
    return guidance;
  }

  /**
   * Get violations for a specific retailer
   * 
   * @param {string} retailer - Retailer name
   * @returns {Promise<Array>} Array of violations
   */
  async getViolationsForRetailer(retailer) {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT * FROM violations WHERE retailer = ? ORDER BY severity DESC",
        [retailer],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  /**
   * Generate step-by-step guidance based on violations
   * 
   * @param {Array} violations - Array of violations
   * @param {string} orderType - Order type
   * @returns {Array} Array of guidance steps
   */
  generateSteps(violations, orderType) {
    const steps = [];
    
    // Step 1: Pre-scan validation
    steps.push({
      step: 1,
      instruction: "Verify order details match the barcode",
      visual: "order-verification-guide.png",
      warning: "❌ Wrong order = $500+ processing fee",
      nextAction: "Confirm order number, retailer, and items"
    });
    
    // Step 2: Box selection with specific guidance
    const packagingViolations = violations.filter(v => v.category === 'Packaging');
    if (packagingViolations.length > 0) {
      const highRiskPackaging = packagingViolations.find(v => v.severity === 'High');
      steps.push({
        step: 2,
        instruction: this.getBoxSelectionInstruction(orderType),
        visual: "box-size-guide.png",
        warning: highRiskPackaging ? 
          `❌ Wrong box = ${highRiskPackaging.fine}` : null,
        nextAction: "Measure items and select appropriate box",
        specificGuidance: this.getSpecificBoxGuidance(orderType)
      });
    }
    
    // Step 3: Labeling with precise placement
    const labelingViolations = violations.filter(v => v.category === 'Labeling');
    if (labelingViolations.length > 0) {
      const highRiskLabeling = labelingViolations.find(v => v.severity === 'High');
      steps.push({
        step: 3,
        instruction: "Place UCC-128 label exactly 2 inches from bottom-right corner",
        visual: "label-placement-guide.png",
        warning: highRiskLabeling ? 
          `❌ Wrong placement = ${highRiskLabeling.fine}` : null,
        nextAction: "Measure 2 inches from bottom-right corner and apply label",
        specificGuidance: "Use ruler to measure exactly 2 inches from bottom edge and 2 inches from right edge"
      });
    }
    
    // Step 4: UPC verification
    const upcViolations = violations.filter(v => v.violation.includes('UPC'));
    if (upcViolations.length > 0) {
      const upcViolation = upcViolations[0];
      steps.push({
        step: steps.length + 1,
        instruction: "Verify all items have correct UPC codes",
        visual: "upc-verification-guide.png",
        warning: `❌ Missing UPC = ${upcViolation.fine}`,
        nextAction: "Scan each item and verify UPC matches order",
        specificGuidance: "Check that UPC codes are readable and match the order manifest"
      });
    }
    
    // Step 5: Packing with protection
    steps.push({
      step: steps.length + 1,
      instruction: "Pack items securely with proper protection",
      visual: "packing-guide.png",
      warning: packagingViolations.find(v => v.violation.includes('protection')) ? 
        "❌ Insufficient protection = $10/carton + $500 inspection fee" : null,
      nextAction: "Add bubble wrap, foam, or other protection as needed",
      specificGuidance: "Ensure items cannot move inside the box"
    });
    
    // Step 6: Final verification
    steps.push({
      step: steps.length + 1,
      instruction: "Final verification before sealing",
      visual: "final-check-guide.png",
      warning: null,
      nextAction: "Double-check all requirements before sealing box",
      specificGuidance: "Verify: correct box size, label placement, UPC codes, protection"
    });
    
    return steps;
  }

  /**
   * Get specific box selection instruction based on order type
   * 
   * @param {string} orderType - Order type
   * @returns {string} Specific instruction
   */
  getBoxSelectionInstruction(orderType) {
    const instructions = {
      'Electronics': 'Use MEDIUM box with extra protection for electronics',
      'Clothing': 'Use SMALL box - clothing compresses well',
      'Sports': 'Use LARGE box - sports equipment needs space',
      'Standard': 'Choose box size based on item dimensions'
    };
    
    return instructions[orderType] || instructions['Standard'];
  }

  /**
   * Get specific box guidance based on order type
   * 
   * @param {string} orderType - Order type
   * @returns {string} Specific guidance
   */
  getSpecificBoxGuidance(orderType) {
    const guidance = {
      'Electronics': 'Items must not touch box walls - use padding',
      'Clothing': 'Can pack tightly but avoid crushing',
      'Sports': 'Allow room for protective packaging',
      'Standard': 'Leave 2 inches clearance on all sides'
    };
    
    return guidance[orderType] || guidance['Standard'];
  }

  /**
   * Generate warnings based on violations
   * 
   * @param {Array} violations - Array of violations
   * @returns {Array} Array of warnings
   */
  generateWarnings(violations) {
    return violations
      .filter(v => v.severity === 'High')
      .map(v => ({
        type: 'high_risk',
        message: `⚠️ ${v.violation}: ${v.fine}`,
        category: v.category
      }));
  }

  /**
   * Generate visual guide references
   * 
   * @param {Array} violations - Array of violations
   * @returns {Array} Array of visual guide references
   */
  generateVisualGuides(violations) {
    const guides = [];
    
    violations.forEach(violation => {
      switch (violation.category) {
        case 'Labeling':
          guides.push('label-placement-guide.png');
          break;
        case 'Packaging':
          guides.push('box-size-guide.png');
          guides.push('packing-guide.png');
          break;
      }
    });
    
    return [...new Set(guides)]; // Remove duplicates
  }

  /**
   * Store guidance for future reference
   * 
   * @param {Object} guidance - Guidance object
   * @returns {Promise<void>}
   */
  async storeGuidance(guidance) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO order_guidance (order_barcode, retailer, order_type, guidance_steps, visual_guides, warnings) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([
        guidance.orderBarcode,
        guidance.retailer,
        guidance.orderType,
        JSON.stringify(guidance.steps),
        JSON.stringify(guidance.visualGuides),
        JSON.stringify(guidance.warnings)
      ], function(err) {
        stmt.finalize();
        
        if (err) {
          console.error('Database error in storeGuidance:', err);
          reject(new Error('Failed to store guidance'));
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = WorkerService;
