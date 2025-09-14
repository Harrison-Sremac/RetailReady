/**
 * Database Configuration Module
 * 
 * This module handles all database-related configuration and initialization.
 * It provides a centralized way to manage database connections, table creation,
 * and seed data.
 * 
 * @fileoverview Database configuration and initialization
 * @author RetailReady Team
 * @version 1.0.0
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Database configuration object
 * Contains all database-related settings and connection parameters
 */
const dbConfig = {
  // Database file path
  dbPath: path.join(__dirname, '../compliance.db'),
  
  // Database connection options
  connectionOptions: {
    verbose: true
  },
  
  // Table schemas
  schemas: {
    violations: `
      CREATE TABLE IF NOT EXISTS violations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requirement TEXT NOT NULL,
        violation TEXT NOT NULL,
        fine TEXT NOT NULL,
        category TEXT NOT NULL,
        severity TEXT NOT NULL,
        retailer TEXT DEFAULT 'Unknown',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    workers: `
      CREATE TABLE IF NOT EXISTS workers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        worker_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        department TEXT DEFAULT 'Warehouse',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    worker_scans: `
      CREATE TABLE IF NOT EXISTS worker_scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        worker_id TEXT NOT NULL,
        order_barcode TEXT NOT NULL,
        sku TEXT,
        carton_id TEXT,
        order_type TEXT,
        retailer TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'in_progress',
        violations_prevented TEXT,
        violations_occurred TEXT,
        estimated_fine_saved REAL DEFAULT 0,
        estimated_fine_incurred REAL DEFAULT 0,
        FOREIGN KEY (worker_id) REFERENCES workers(worker_id)
      )
    `,
    order_guidance: `
      CREATE TABLE IF NOT EXISTS order_guidance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_barcode TEXT UNIQUE NOT NULL,
        retailer TEXT NOT NULL,
        order_type TEXT NOT NULL,
        guidance_steps TEXT NOT NULL,
        visual_guides TEXT,
        warnings TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `
  },
  
  // Seed data for initial database population
  seedData: [
    {
      requirement: "UCC-128 labels must be 2 inches from bottom/right edge",
      violation: "Label placement incorrect",
      fine: "$2/carton + $250",
      category: "Labeling",
      severity: "High"
    },
    {
      requirement: "ASN must be sent 24 hours before shipment",
      violation: "Late ASN submission",
      fine: "$500 per occurrence",
      category: "ASN",
      severity: "Medium"
    },
    {
      requirement: "Cartons must be stacked no more than 6 high",
      violation: "Overstacked cartons",
      fine: "$1/carton over limit",
      category: "Packaging",
      severity: "Medium"
    },
    {
      requirement: "All items must have proper UPC codes",
      violation: "Missing or incorrect UPC",
      fine: "$5/item + $100 processing fee",
      category: "Labeling",
      severity: "High"
    },
    {
      requirement: "Shipments must arrive within 2-hour delivery window",
      violation: "Late delivery",
      fine: "$200/hour late + $50 rescheduling fee",
      category: "Delivery",
      severity: "High"
    },
    {
      requirement: "Packaging must meet minimum crush resistance standards",
      violation: "Insufficient packaging protection",
      fine: "$10/carton + $500 inspection fee",
      category: "Packaging",
      severity: "Medium"
    }
  ],
  
  // Seed data for workers
  workerSeedData: [
    {
      worker_id: "maria123",
      name: "Maria Rodriguez",
      department: "Warehouse"
    },
    {
      worker_id: "john456",
      name: "John Smith",
      department: "Warehouse"
    },
    {
      worker_id: "sarah789",
      name: "Sarah Johnson",
      department: "Packaging"
    }
  ]
};

/**
 * Initialize database connection
 * Creates a new SQLite database connection with the configured options
 * 
 * @returns {sqlite3.Database} Database connection instance
 */
function initializeDatabase() {
  const db = new sqlite3.Database(dbConfig.dbPath, dbConfig.connectionOptions);
  
  console.log('Database connection initialized');
  return db;
}

/**
 * Create database tables
 * Executes the table creation SQL for all defined schemas
 * 
 * @param {sqlite3.Database} db - Database connection instance
 * @returns {Promise<void>} Promise that resolves when tables are created
 */
function createTables(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      let tablesCreated = 0;
      const totalTables = Object.keys(dbConfig.schemas).length;
      
      // Create all tables
      Object.entries(dbConfig.schemas).forEach(([tableName, schema]) => {
        db.run(schema, (err) => {
          if (err) {
            console.error(`Error creating ${tableName} table:`, err);
            reject(err);
          } else {
            console.log(`${tableName} table created/verified`);
            tablesCreated++;
            
            if (tablesCreated === totalTables) {
              resolve();
            }
          }
        });
      });
    });
  });
}

/**
 * Seed database with initial data
 * Populates the database with seed data if it's empty
 * 
 * @param {sqlite3.Database} db - Database connection instance
 * @returns {Promise<void>} Promise that resolves when seeding is complete
 */
function seedDatabase(db) {
  return new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) as count FROM violations", (err, row) => {
      if (err) {
        console.error('Error checking database:', err);
        reject(err);
        return;
      }
      
      if (row.count === 0) {
        console.log('Seeding database with Dick\'s Sporting Goods compliance data...');
        
        const violationStmt = db.prepare(`
          INSERT INTO violations (requirement, violation, fine, category, severity, retailer) 
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        dbConfig.seedData.forEach(item => {
          violationStmt.run([
            item.requirement, 
            item.violation, 
            item.fine, 
            item.category, 
            item.severity, 
            "Dick's Sporting Goods"
          ]);
        });
        
        violationStmt.finalize();
        console.log('Violations seeded successfully!');
      } else {
        console.log('Violations already contain data, skipping seed');
      }
      
      // Seed workers
      db.get("SELECT COUNT(*) as count FROM workers", (err, row) => {
        if (err) {
          console.error('Error checking workers table:', err);
          reject(err);
          return;
        }
        
        if (row.count === 0) {
          console.log('Seeding workers...');
          
          const workerStmt = db.prepare(`
            INSERT INTO workers (worker_id, name, department) 
            VALUES (?, ?, ?)
          `);
          
          dbConfig.workerSeedData.forEach(worker => {
            workerStmt.run([worker.worker_id, worker.name, worker.department]);
          });
          
          workerStmt.finalize();
          console.log('Workers seeded successfully!');
        } else {
          console.log('Workers already contain data, skipping seed');
        }
        
        resolve();
      });
    });
  });
}

/**
 * Initialize complete database setup
 * Creates connection, tables, and seeds data in the correct order
 * 
 * @returns {Promise<sqlite3.Database>} Promise that resolves with database instance
 */
async function initializeCompleteDatabase() {
  try {
    const db = initializeDatabase();
    await createTables(db);
    await seedDatabase(db);
    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

/**
 * Gracefully close database connection
 * Properly closes the database connection with error handling
 * 
 * @param {sqlite3.Database} db - Database connection instance
 * @returns {Promise<void>} Promise that resolves when connection is closed
 */
function closeDatabase(db) {
  return new Promise((resolve) => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
      resolve();
    });
  });
}

module.exports = {
  dbConfig,
  initializeDatabase,
  createTables,
  seedDatabase,
  initializeCompleteDatabase,
  closeDatabase
};
