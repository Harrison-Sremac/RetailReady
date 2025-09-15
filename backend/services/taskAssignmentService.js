/**
 * Task Assignment Service Module
 * 
 * This module handles task-level worker assignment optimization for Dick's Sporting Goods
 * compliance requirements. It breaks down orders into specific compliance-critical tasks
 * and matches workers to tasks based on their proven abilities.
 * 
 * @fileoverview Task-level worker assignment and violation prediction service
 * @author RetailReady Team
 * @version 1.0.0
 */

/**
 * Dick's Sporting Goods compliance task definitions
 * Maps specific violations to actionable tasks
 */
const DICKS_COMPLIANCE_TASKS = {
  LABEL_PLACEMENT: {
    id: 'LABEL_PLACEMENT',
    name: 'Label Placement',
    description: 'UCC-128 labels must be placed 2 inches from bottom-right corner',
    violationType: 'INCORRECT_LABEL_PLACEMENT',
    potentialFine: 250,
    requiredSkills: ['precision', 'label_experience', 'attention_to_detail'],
    estimatedTime: 15, // minutes per 50 items
    complexity: 'medium'
  },
  
  SKU_VERIFICATION: {
    id: 'SKU_VERIFICATION', 
    name: 'SKU Verification',
    description: 'Verify no mixed SKUs in bulk orders, correct quantities',
    violationType: 'MIXED_SKU_VIOLATION',
    potentialFine: 500,
    requiredSkills: ['attention_to_detail', 'bulk_experience', 'sku_knowledge'],
    estimatedTime: 30, // minutes per 100 items
    complexity: 'high'
  },
  
  ASN_PREPARATION: {
    id: 'ASN_PREPARATION',
    name: 'ASN Preparation', 
    description: 'Send Advance Ship Notice within 1 hour of shipment',
    violationType: 'LATE_ASN',
    potentialFine: 500,
    requiredSkills: ['system_knowledge', 'time_management', 'asn_experience'],
    estimatedTime: 5, // minutes
    complexity: 'low'
  },
  
  CARTON_SELECTION: {
    id: 'CARTON_SELECTION',
    name: 'Carton Selection',
    description: 'Select appropriate carton size based on item dimensions',
    violationType: 'INCORRECT_CARTON_SIZE',
    potentialFine: 150,
    requiredSkills: ['spatial_reasoning', 'carton_knowledge', 'measurement'],
    estimatedTime: 10, // minutes per order
    complexity: 'medium'
  },
  
  PACKING_VERIFICATION: {
    id: 'PACKING_VERIFICATION',
    name: 'Packing Verification',
    description: 'Verify proper packing density and protection',
    violationType: 'IMPROPER_PACKING',
    potentialFine: 300,
    requiredSkills: ['packing_experience', 'quality_control', 'protection_knowledge'],
    estimatedTime: 20, // minutes per order
    complexity: 'high'
  },
  
  UPC_VERIFICATION: {
    id: 'UPC_VERIFICATION',
    name: 'UPC Verification',
    description: 'Verify UPC codes match product and are scannable',
    violationType: 'INVALID_UPC',
    potentialFine: 200,
    requiredSkills: ['upc_knowledge', 'scanning_experience', 'product_knowledge'],
    estimatedTime: 12, // minutes per 50 items
    complexity: 'medium'
  }
};

/**
 * Order task breakdown service class
 * Provides methods for breaking down orders into compliance-critical tasks
 */
class TaskAssignmentService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Break down an order into specific compliance tasks
   * 
   * @param {Object} order - Order object with details
   * @returns {Object} Order breakdown with tasks
   */
  breakdownOrderIntoTasks(order) {
    const {
      orderId,
      itemCount,
      orderType = 'Standard',
      retailer = "Dick's Sporting Goods",
      specialRequirements = []
    } = order;

    const tasks = [];

    // Always required tasks for Dick's orders
    tasks.push({
      id: `${orderId}-LABEL`,
      type: 'LABEL_PLACEMENT',
      quantity: Math.ceil(itemCount / 50), // Labels per 50 items
      requirement: DICKS_COMPLIANCE_TASKS.LABEL_PLACEMENT.description,
      potentialFine: DICKS_COMPLIANCE_TASKS.LABEL_PLACEMENT.potentialFine,
      requiredSkills: DICKS_COMPLIANCE_TASKS.LABEL_PLACEMENT.requiredSkills,
      estimatedTime: Math.ceil(itemCount / 50) * DICKS_COMPLIANCE_TASKS.LABEL_PLACEMENT.estimatedTime,
      complexity: DICKS_COMPLIANCE_TASKS.LABEL_PLACEMENT.complexity
    });

    // SKU verification for bulk orders
    if (itemCount > 10) {
      tasks.push({
        id: `${orderId}-SKU`,
        type: 'SKU_VERIFICATION',
        quantity: itemCount,
        requirement: DICKS_COMPLIANCE_TASKS.SKU_VERIFICATION.description,
        potentialFine: DICKS_COMPLIANCE_TASKS.SKU_VERIFICATION.potentialFine,
        requiredSkills: DICKS_COMPLIANCE_TASKS.SKU_VERIFICATION.requiredSkills,
        estimatedTime: Math.ceil(itemCount / 100) * DICKS_COMPLIANCE_TASKS.SKU_VERIFICATION.estimatedTime,
        complexity: DICKS_COMPLIANCE_TASKS.SKU_VERIFICATION.complexity
      });
    }

    // ASN preparation (always required)
    tasks.push({
      id: `${orderId}-ASN`,
      type: 'ASN_PREPARATION',
      quantity: 1,
      requirement: DICKS_COMPLIANCE_TASKS.ASN_PREPARATION.description,
      potentialFine: DICKS_COMPLIANCE_TASKS.ASN_PREPARATION.potentialFine,
      requiredSkills: DICKS_COMPLIANCE_TASKS.ASN_PREPARATION.requiredSkills,
      estimatedTime: DICKS_COMPLIANCE_TASKS.ASN_PREPARATION.estimatedTime,
      complexity: DICKS_COMPLIANCE_TASKS.ASN_PREPARATION.complexity
    });

    // Carton selection
    tasks.push({
      id: `${orderId}-CARTON`,
      type: 'CARTON_SELECTION',
      quantity: 1,
      requirement: DICKS_COMPLIANCE_TASKS.CARTON_SELECTION.description,
      potentialFine: DICKS_COMPLIANCE_TASKS.CARTON_SELECTION.potentialFine,
      requiredSkills: DICKS_COMPLIANCE_TASKS.CARTON_SELECTION.requiredSkills,
      estimatedTime: DICKS_COMPLIANCE_TASKS.CARTON_SELECTION.estimatedTime,
      complexity: DICKS_COMPLIANCE_TASKS.CARTON_SELECTION.complexity
    });

    // Packing verification for fragile items
    if (specialRequirements.includes('fragile') || itemCount > 50) {
      tasks.push({
        id: `${orderId}-PACK`,
        type: 'PACKING_VERIFICATION',
        quantity: 1,
        requirement: DICKS_COMPLIANCE_TASKS.PACKING_VERIFICATION.description,
        potentialFine: DICKS_COMPLIANCE_TASKS.PACKING_VERIFICATION.potentialFine,
        requiredSkills: DICKS_COMPLIANCE_TASKS.PACKING_VERIFICATION.requiredSkills,
        estimatedTime: DICKS_COMPLIANCE_TASKS.PACKING_VERIFICATION.estimatedTime,
        complexity: DICKS_COMPLIANCE_TASKS.PACKING_VERIFICATION.complexity
      });
    }

    // UPC verification for retail items
    if (specialRequirements.includes('retail') || orderType === 'Retail') {
      tasks.push({
        id: `${orderId}-UPC`,
        type: 'UPC_VERIFICATION',
        quantity: itemCount,
        requirement: DICKS_COMPLIANCE_TASKS.UPC_VERIFICATION.description,
        potentialFine: DICKS_COMPLIANCE_TASKS.UPC_VERIFICATION.potentialFine,
        requiredSkills: DICKS_COMPLIANCE_TASKS.UPC_VERIFICATION.requiredSkills,
        estimatedTime: Math.ceil(itemCount / 50) * DICKS_COMPLIANCE_TASKS.UPC_VERIFICATION.estimatedTime,
        complexity: DICKS_COMPLIANCE_TASKS.UPC_VERIFICATION.complexity
      });
    }

    return {
      orderId,
      retailer,
      orderType,
      itemCount,
      tasks,
      totalEstimatedTime: tasks.reduce((sum, task) => sum + task.estimatedTime, 0),
      maxPossibleFines: tasks.reduce((sum, task) => sum + task.potentialFine, 0)
    };
  }

  /**
   * Get worker skill profile based on violation history
   * 
   * @param {string} workerId - Worker identifier
   * @returns {Object} Worker skill profile
   */
  getWorkerSkillProfile(workerId) {
    return new Promise((resolve, reject) => {
      // Get worker's violation history from the last 90 days
      this.db.all(`
        SELECT 
          violation_type,
          COUNT(*) as violation_count,
          SUM(estimated_fine_incurred) as total_fines
        FROM worker_scans 
        WHERE worker_id = ? 
          AND violations_occurred IS NOT NULL 
          AND violations_occurred != '[]'
          AND timestamp >= datetime('now', '-90 days')
        GROUP BY violation_type
      `, [workerId], (err, violations) => {
        if (err) {
          console.error('Error getting violations:', err);
          violations = [];
        }

        // Get worker's successful task completions
        this.db.all(`
          SELECT 
            COUNT(*) as total_scans,
            SUM(CASE WHEN violations_occurred = '[]' OR violations_occurred IS NULL THEN 1 ELSE 0 END) as successful_scans
          FROM worker_scans 
          WHERE worker_id = ? 
            AND timestamp >= datetime('now', '-90 days')
        `, [workerId], (err2, successes) => {
          if (err2) {
            console.error('Error getting successes:', err2);
            successes = [{ total_scans: 0, successful_scans: 0 }];
          }

          // Get worker's department
          this.db.get('SELECT department FROM workers WHERE worker_id = ?', [workerId], (err3, workerInfo) => {
            if (err3) {
              console.error('Error getting worker info:', err3);
              workerInfo = { department: 'Warehouse' };
            }

            const totalScans = successes[0]?.total_scans || 0;
            const successfulScans = successes[0]?.successful_scans || 0;
            const baseAccuracy = totalScans > 0 ? successfulScans / totalScans : 0.8; // Default 80% accuracy

            // Create realistic skill profiles with department-based strengths
            const departmentStrengths = {
              'Warehouse': {
                label_placement: 1.0,    // Strong at labeling
                sku_verification: 1.0,   // Strong at SKU verification
                asn_preparation: 0.8,    // Moderate at ASN
                carton_selection: 1.0,   // Strong at carton selection
                packing_verification: 0.9, // Good at packing
                upc_verification: 1.0    // Strong at UPC verification
              },
              'Packaging': {
                label_placement: 0.7,    // Moderate at labeling
                sku_verification: 0.7,   // Moderate at SKU verification
                asn_preparation: 0.6,    // Weak at ASN
                carton_selection: 1.0,   // Strong at carton selection
                packing_verification: 1.0, // Excellent at packing
                upc_verification: 0.8    // Good at UPC verification
              },
              'Quality Control': {
                label_placement: 1.0,    // Strong at labeling
                sku_verification: 1.0,   // Strong at SKU verification
                asn_preparation: 0.9,    // Good at ASN
                carton_selection: 1.0,   // Strong at carton selection
                packing_verification: 1.0, // Excellent at packing
                upc_verification: 1.0    // Strong at UPC verification
              },
              'Shipping': {
                label_placement: 0.6,    // Weak at labeling
                sku_verification: 0.6,   // Weak at SKU verification
                asn_preparation: 1.0,    // Strong at ASN
                carton_selection: 0.7,   // Moderate at carton selection
                packing_verification: 0.7, // Moderate at packing
                upc_verification: 0.6    // Weak at UPC verification
              }
            };

            const department = workerInfo?.department || 'Warehouse';
            const deptStrengths = departmentStrengths[department] || departmentStrengths['Warehouse'];

            // Create unique skill profiles for each worker with realistic variations
            const workerSkillVariations = {
              'johnny123': { label_placement: 0.05, sku_verification: -0.02, asn_preparation: -0.08, carton_selection: 0.03, packing_verification: -0.01, upc_verification: 0.04 },
              'john456': { label_placement: 0.08, sku_verification: 0.05, asn_preparation: -0.05, carton_selection: 0.06, packing_verification: 0.02, upc_verification: 0.07 },
              'sarah789': { label_placement: -0.15, sku_verification: -0.12, asn_preparation: -0.20, carton_selection: 0.08, packing_verification: 0.12, upc_verification: -0.08 },
              'mike001': { label_placement: -0.05, sku_verification: 0.02, asn_preparation: -0.10, carton_selection: 0.04, packing_verification: -0.03, upc_verification: 0.03 },
              'lisa002': { label_placement: 0.06, sku_verification: 0.08, asn_preparation: -0.02, carton_selection: 0.05, packing_verification: 0.10, upc_verification: 0.07 },
              'david003': { label_placement: -0.12, sku_verification: -0.08, asn_preparation: -0.18, carton_selection: 0.06, packing_verification: 0.09, upc_verification: -0.05 },
              'emma004': { label_placement: 0.02, sku_verification: 0.04, asn_preparation: -0.06, carton_selection: 0.07, packing_verification: -0.02, upc_verification: 0.05 },
              'carlos005': { label_placement: -0.20, sku_verification: -0.18, asn_preparation: 0.12, carton_selection: -0.08, packing_verification: -0.10, upc_verification: -0.15 },
              'jessica006': { label_placement: -0.10, sku_verification: -0.06, asn_preparation: -0.16, carton_selection: 0.07, packing_verification: 0.11, upc_verification: -0.03 },
              'alex007': { label_placement: 0.01, sku_verification: 0.03, asn_preparation: -0.07, carton_selection: 0.05, packing_verification: -0.01, upc_verification: 0.04 },
              'maria008': { label_placement: 0.07, sku_verification: 0.09, asn_preparation: -0.01, carton_selection: 0.06, packing_verification: 0.11, upc_verification: 0.08 },
              'kevin009': { label_placement: -0.08, sku_verification: -0.04, asn_preparation: -0.14, carton_selection: 0.05, packing_verification: 0.08, upc_verification: -0.02 },
              'rachel010': { label_placement: 0.03, sku_verification: 0.05, asn_preparation: -0.05, carton_selection: 0.08, packing_verification: -0.01, upc_verification: 0.06 },
              'tom011': { label_placement: -0.18, sku_verification: -0.16, asn_preparation: 0.10, carton_selection: -0.06, packing_verification: -0.08, upc_verification: -0.13 },
              'amy012': { label_placement: -0.11, sku_verification: -0.07, asn_preparation: -0.17, carton_selection: 0.04, packing_verification: 0.07, upc_verification: -0.04 }
            };

            const variations = workerSkillVariations[workerId] || { label_placement: 0, sku_verification: 0, asn_preparation: 0, carton_selection: 0, packing_verification: 0, upc_verification: 0 };

            // Build skill profile with department-based strengths and individual variations
            const skills = {};
            Object.keys(deptStrengths).forEach(skillKey => {
              const deptStrength = deptStrengths[skillKey];
              const individualVariation = variations[skillKey] || 0;
              const baseSkillAccuracy = Math.max(0.1, Math.min(1.0, baseAccuracy * deptStrength + individualVariation));
              
              skills[skillKey] = {
                accuracy: baseSkillAccuracy,
                speed: Math.max(0.5, 1.0 + (Math.random() - 0.5) * 0.4), // 0.8-1.2 speed variation
                violations: 0
              };
            });

            // Adjust skills based on specific violation history
            violations.forEach(violation => {
              const violationType = violation.violation_type;
              const violationCount = violation.violation_count;
              
              // Map violation types to skills
              const skillMap = {
                'INCORRECT_LABEL_PLACEMENT': 'label_placement',
                'MIXED_SKU_VIOLATION': 'sku_verification', 
                'LATE_ASN': 'asn_preparation',
                'INCORRECT_CARTON_SIZE': 'carton_selection',
                'IMPROPER_PACKING': 'packing_verification',
                'INVALID_UPC': 'upc_verification'
              };

              const skillKey = skillMap[violationType];
              if (skillKey && skills[skillKey]) {
                // Reduce accuracy based on violation frequency
                const violationPenalty = Math.min(violationCount * 0.1, 0.5); // Max 50% penalty
                skills[skillKey].accuracy = Math.max(0.1, skills[skillKey].accuracy - violationPenalty);
                skills[skillKey].violations = violationCount;
                
                // Adjust speed based on violations (more careful = slower)
                skills[skillKey].speed = Math.max(0.5, skills[skillKey].speed - (violationCount * 0.05));
              }
            });

            resolve({
              workerId,
              skills,
              totalScans,
              successfulScans,
              overallAccuracy: baseAccuracy,
              violationHistory: violations.reduce((acc, v) => {
                acc[v.violation_type] = v.violation_count;
                return acc;
              }, {})
            });
          });
        });
      });
    });
  }

  /**
   * Calculate task-worker fit score
   * 
   * @param {Object} task - Task object
   * @param {Object} workerProfile - Worker skill profile
   * @returns {Object} Fit score and risk assessment
   */
  calculateTaskFit(task, workerProfile) {
    const skillKey = task.type.toLowerCase();
    const workerSkill = workerProfile.skills[skillKey] || { accuracy: 0.5, speed: 0.5, violations: 0 };
    
    // Base score from accuracy
    let score = workerSkill.accuracy;
    
    // Adjust for speed (faster workers get slight bonus)
    score += (workerSkill.speed - 1.0) * 0.1;
    
    // Penalty for recent violations in this skill
    if (workerSkill.violations > 0) {
      score -= Math.min(workerSkill.violations * 0.15, 0.4); // Max 40% penalty
    }
    
    // Complexity adjustment
    const complexityMultipliers = { low: 1.0, medium: 0.9, high: 0.8 };
    score *= complexityMultipliers[task.complexity] || 1.0;
    
    // Calculate expected fine
    const failureRate = 1 - Math.max(score, 0.1); // Minimum 10% success rate
    const expectedFine = task.potentialFine * failureRate;
    
    return {
      score: Math.max(score, 0.1), // Minimum 10% score
      expectedFine,
      riskReduction: task.potentialFine - expectedFine,
      successRate: Math.max(score, 0.1) * 100,
      warning: workerSkill.violations > 2 ? `High violation history (${workerSkill.violations})` : null
    };
  }

  /**
   * Optimize task assignments for an order
   * 
   * @param {Object} orderBreakdown - Order breakdown with tasks
   * @param {Array} workers - Available workers
   * @returns {Object} Optimized assignments and predictions
   */
  async optimizeTaskAssignments(orderBreakdown, workers) {
    const assignments = {};
    const predictions = [];
    
    // Get skill profiles for all workers
    const workerProfiles = await Promise.all(
      workers.map(worker => this.getWorkerSkillProfile(worker.worker_id))
    );
    
    // For each task, find the best worker
    for (const task of orderBreakdown.tasks) {
      const rankings = workerProfiles.map((profile, index) => {
        const fit = this.calculateTaskFit(task, profile);
        return {
          worker: workers[index],
          profile,
          fit,
          task
        };
      }).sort((a, b) => b.fit.score - a.fit.score);
      
      const bestMatch = rankings[0];
      const backupMatch = rankings[1];
      
      assignments[task.id] = {
        primary: {
          worker: bestMatch.worker,
          score: bestMatch.fit.score,
          expectedFine: bestMatch.fit.expectedFine,
          riskReduction: bestMatch.fit.riskReduction
        },
        backup: {
          worker: backupMatch.worker,
          score: backupMatch.fit.score,
          expectedFine: backupMatch.fit.expectedFine,
          riskReduction: backupMatch.fit.riskReduction
        }
      };
      
      predictions.push({
        taskId: task.id,
        taskName: DICKS_COMPLIANCE_TASKS[task.type]?.name || task.type,
        taskType: task.type,
        assignedWorker: bestMatch.worker.name,
        successRate: bestMatch.fit.successRate,
        expectedFine: bestMatch.fit.expectedFine,
        riskLevel: bestMatch.fit.expectedFine > 200 ? 'High' : 
                   bestMatch.fit.expectedFine > 100 ? 'Medium' : 'Low',
        warning: bestMatch.fit.warning,
        potentialFine: task.potentialFine
      });
    }
    
    const totalExpectedFines = predictions.reduce((sum, p) => sum + p.expectedFine, 0);
    
    return {
      orderId: orderBreakdown.orderId,
      assignments,
      predictions,
      totalExpectedFines,
      maxPossibleFines: orderBreakdown.maxPossibleFines,
      riskReduction: orderBreakdown.maxPossibleFines - totalExpectedFines,
      riskReductionPercentage: Math.round(
        ((orderBreakdown.maxPossibleFines - totalExpectedFines) / orderBreakdown.maxPossibleFines) * 100
      )
    };
  }

  /**
   * Get all available workers
   * 
   * @returns {Array} List of workers
   */
  getAllWorkers() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT worker_id, name, department FROM workers ORDER BY name', (err, rows) => {
        if (err) {
          console.error('Error getting workers:', err);
          resolve([]);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Get task assignment statistics
   * 
   * @returns {Object} Assignment statistics
   */
  getTaskAssignmentStats() {
    return {
      availableTasks: Object.keys(DICKS_COMPLIANCE_TASKS).length,
      taskTypes: Object.values(DICKS_COMPLIANCE_TASKS).map(task => ({
        id: task.id,
        name: task.name,
        potentialFine: task.potentialFine,
        complexity: task.complexity
      }))
    };
  }
}

module.exports = TaskAssignmentService;
