/**
 * Database Service Module
 * 
 * This module provides a service layer for all database operations.
 * It abstracts database queries and provides a clean interface for
 * CRUD operations on compliance violations and related data.
 * 
 * @fileoverview Database service layer for compliance data management
 * @author RetailReady Team
 * @version 1.0.0
 */

/**
 * Database service class
 * Provides methods for all database operations related to compliance violations
 */
class DatabaseService {
  /**
   * Initialize the database service
   * 
   * @param {sqlite3.Database} db - Database connection instance
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Get all violations with optional filtering
   * 
   * @param {Object} filters - Filter options
   * @param {string} [filters.category] - Filter by category
   * @param {string} [filters.severity] - Filter by severity
   * @param {string} [filters.retailer] - Filter by retailer
   * @returns {Promise<Array>} Array of violation objects
   */
  async getViolations(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = "SELECT * FROM violations WHERE 1=1";
      const params = [];
      
      // Apply filters
      if (filters.category) {
        query += " AND category = ?";
        params.push(filters.category);
      }
      
      if (filters.severity) {
        query += " AND severity = ?";
        params.push(filters.severity);
      }
      
      if (filters.retailer) {
        query += " AND retailer = ?";
        params.push(filters.retailer);
      }
      
      query += " ORDER BY created_at DESC";

      this.db.all(query, params, (err, rows) => {
        if (err) {
          console.error('Database error in getViolations:', err);
          reject(new Error('Database query failed'));
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Get a single violation by ID
   * 
   * @param {number} id - Violation ID
   * @returns {Promise<Object|null>} Violation object or null if not found
   */
  async getViolationById(id) {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM violations WHERE id = ?", [id], (err, row) => {
        if (err) {
          console.error('Database error in getViolationById:', err);
          reject(new Error('Database query failed'));
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Get all unique categories
   * 
   * @returns {Promise<Array>} Array of category strings
   */
  async getCategories() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT DISTINCT category FROM violations ORDER BY category", (err, rows) => {
        if (err) {
          console.error('Database error in getCategories:', err);
          reject(new Error('Database query failed'));
        } else {
          resolve(rows.map(row => row.category));
        }
      });
    });
  }

  /**
   * Get all unique retailers
   * 
   * @returns {Promise<Array>} Array of retailer strings
   */
  async getRetailers() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT DISTINCT retailer FROM violations ORDER BY retailer", (err, rows) => {
        if (err) {
          console.error('Database error in getRetailers:', err);
          reject(new Error('Database query failed'));
        } else {
          resolve(rows.map(row => row.retailer));
        }
      });
    });
  }

  /**
   * Insert a new violation
   * 
   * @param {Object} violation - Violation data
   * @param {string} violation.requirement - Requirement text
   * @param {string} violation.violation - Violation description
   * @param {string} violation.fine - Fine amount/structure
   * @param {string} violation.category - Category
   * @param {string} violation.severity - Severity level
   * @param {string} violation.retailer - Retailer name
   * @returns {Promise<number>} ID of the inserted violation
   */
  async insertViolation(violation) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO violations (requirement, violation, fine, category, severity, retailer) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([
        violation.requirement,
        violation.violation,
        violation.fine,
        violation.category,
        violation.severity,
        violation.retailer
      ], function(err) {
        stmt.finalize();
        
        if (err) {
          console.error('Database error in insertViolation:', err);
          reject(new Error('Failed to insert violation'));
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  /**
   * Insert multiple violations in a batch
   * 
   * @param {Array} violations - Array of violation objects
   * @returns {Promise<Array>} Array of inserted violation IDs
   */
  async insertViolationsBatch(violations) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO violations (requirement, violation, fine, category, severity, retailer, fine_amount, fine_unit, additional_fees, prevention_method, responsible_party) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const insertedIds = [];
      let completed = 0;
      
      if (violations.length === 0) {
        stmt.finalize();
        resolve(insertedIds);
        return;
      }
      
      violations.forEach(violation => {
        stmt.run([
          violation.requirement,
          violation.violation,
          violation.fine,
          violation.category,
          violation.severity,
          violation.retailer,
          violation.fine_amount,
          violation.fine_unit,
          violation.additional_fees,
          violation.prevention_method,
          violation.responsible_party
        ], function(err) {
          if (err) {
            console.error('Database error in insertViolationsBatch:', err);
            stmt.finalize();
            reject(new Error('Failed to insert violations batch'));
            return;
          }
          insertedIds.push(this.lastID);
          completed++;
          
          // Check if all insertions are complete
          if (completed === violations.length) {
            stmt.finalize();
            resolve(insertedIds);
          }
        });
      });
    });
  }

  /**
   * Get database view organized by retailer and category
   * 
   * @returns {Promise<Array>} Array of grouped violation data
   */
  async getDatabaseView() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          retailer,
          category,
          COUNT(*) as total_violations,
          COUNT(CASE WHEN severity = 'High' THEN 1 END) as high_severity,
          COUNT(CASE WHEN severity = 'Medium' THEN 1 END) as medium_severity,
          COUNT(CASE WHEN severity = 'Low' THEN 1 END) as low_severity,
          MIN(created_at) as first_added,
          MAX(created_at) as last_updated
        FROM violations 
        GROUP BY retailer, category
        ORDER BY retailer, category
      `;

      this.db.all(query, [], async (err, rows) => {
        if (err) {
          console.error('Database error in getDatabaseView:', err);
          reject(new Error('Database query failed'));
          return;
        }

        try {
          // Get detailed data for each group
          const formattedData = await Promise.all(rows.map(async (row) => {
            const details = await this.getViolationDetailsByGroup(row.retailer, row.category);
            
            return {
              retailer: row.retailer,
              category: row.category,
              summary: {
                total_violations: row.total_violations,
                severity_breakdown: {
                  high: row.high_severity,
                  medium: row.medium_severity,
                  low: row.low_severity
                }
              },
              details: {
                requirements: details.map(d => d.requirement),
                violations: details.map(d => d.violation),
                fines: details.map(d => d.fine)
              },
              timestamps: {
                first_added: row.first_added,
                last_updated: row.last_updated
              }
            };
          }));

          resolve(formattedData);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Get detailed violations for a specific retailer/category group
   * 
   * @param {string} retailer - Retailer name
   * @param {string} category - Category name
   * @returns {Promise<Array>} Array of violation details
   */
  async getViolationDetailsByGroup(retailer, category) {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT requirement, violation, fine FROM violations WHERE retailer = ? AND category = ?",
        [retailer, category],
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
   * Get violations for a specific retailer and category
   * 
   * @param {string} retailer - Retailer name
   * @param {string} category - Category name
   * @returns {Promise<Array>} Array of violations
   */
  async getViolationsByRetailerAndCategory(retailer, category) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          id,
          requirement,
          violation,
          fine,
          severity,
          created_at
        FROM violations 
        WHERE retailer = ? AND category = ?
        ORDER BY severity DESC, created_at DESC
      `;

      this.db.all(query, [retailer, category], (err, rows) => {
        if (err) {
          console.error('Database error in getViolationsByRetailerAndCategory:', err);
          reject(new Error('Database query failed'));
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Get database statistics
   * 
   * @returns {Promise<Object>} Database statistics
   */
  async getDatabaseStats() {
    return new Promise((resolve, reject) => {
      const queries = {
        totalViolations: "SELECT COUNT(*) as count FROM violations",
        totalRetailers: "SELECT COUNT(DISTINCT retailer) as count FROM violations",
        totalCategories: "SELECT COUNT(DISTINCT category) as count FROM violations",
        severityBreakdown: `
          SELECT 
            severity,
            COUNT(*) as count 
          FROM violations 
          GROUP BY severity
        `
      };

      const stats = {};
      let completedQueries = 0;
      const totalQueries = Object.keys(queries).length;

      Object.entries(queries).forEach(([key, query]) => {
        this.db.all(query, [], (err, rows) => {
          if (err) {
            console.error(`Database error in getDatabaseStats (${key}):`, err);
            reject(new Error('Database query failed'));
            return;
          }

          if (key === 'severityBreakdown') {
            stats[key] = rows;
          } else {
            stats[key] = rows[0].count;
          }

          completedQueries++;
          if (completedQueries === totalQueries) {
            resolve(stats);
          }
        });
      });
    });
  }

  /**
   * Clear all uploaded compliance data
   * Removes all violations that are not seed data (excludes 'Dick's Sporting Goods' seed data)
   * 
   * @returns {Promise<number>} Number of deleted records
   */
  async clearUploadedData() {
    return new Promise((resolve, reject) => {
      this.db.run(
        "DELETE FROM violations WHERE retailer != 'Dick\\'s Sporting Goods' OR retailer IS NULL",
        function(err) {
          if (err) {
            console.error('Database error in clearUploadedData:', err);
            reject(new Error('Failed to clear uploaded data'));
            return;
          }
          
          console.log(`Cleared ${this.changes} uploaded violations`);
          resolve(this.changes);
        }
      );
    });
  }

  /**
   * Clear all worker scan data
   * Removes all worker scan history
   * 
   * @returns {Promise<number>} Number of deleted records
   */
  async clearWorkerScanData() {
    return new Promise((resolve, reject) => {
      this.db.run(
        "DELETE FROM worker_scans",
        function(err) {
          if (err) {
            console.error('Database error in clearWorkerScanData:', err);
            reject(new Error('Failed to clear worker scan data'));
            return;
          }
          
          console.log(`Cleared ${this.changes} worker scan records`);
          resolve(this.changes);
        }
      );
    });
  }

  /**
   * Clear all uploaded data (violations only - preserves worker performance data)
   * Comprehensive clear function for user-uploaded compliance data only
   * 
   * @returns {Promise<Object>} Object with counts of cleared records
   */
  async clearAllUploadedData() {
    try {
      const violationsCleared = await this.clearUploadedData();
      
      return {
        violationsCleared,
        scansCleared: 0, // Worker scans are preserved
        totalCleared: violationsCleared
      };
    } catch (error) {
      console.error('Error clearing all uploaded data:', error);
      throw error;
    }
  }

  /**
   * Clear ALL compliance data
   * Removes all violations from the database
   * 
   * @returns {Promise<number>} Number of deleted records
   */
  async clearAllData() {
    return new Promise((resolve, reject) => {
      this.db.run(
        "DELETE FROM violations",
        function(err) {
          if (err) {
            console.error('Database error in clearAllData:', err);
            reject(new Error('Failed to clear all data'));
            return;
          }
          
          console.log(`Cleared ${this.changes} total violations`);
          resolve(this.changes);
        }
      );
    });
  }
}

module.exports = DatabaseService;
