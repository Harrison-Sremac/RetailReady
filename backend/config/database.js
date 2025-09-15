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
  // Database file path - use Railway persistent volume in production
  dbPath: process.env.NODE_ENV === 'production' 
    ? path.join('/data', 'compliance.db')  // Railway persistent volume
    : path.join(__dirname, '../compliance.db'),  // Local development
  
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
        fine_amount REAL,
        fine_unit TEXT,
        additional_fees TEXT,
        prevention_method TEXT DEFAULT 'Manual verification',
        responsible_party TEXT DEFAULT 'Warehouse Worker',
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
      category: "Post-Packing",
      severity: "High",
      fine_amount: 2,
      fine_unit: "per carton",
      additional_fees: "$250 flat fee",
      prevention_method: "Label placement guides",
      responsible_party: "Warehouse Worker"
    },
    {
      requirement: "ASN must be sent 24 hours before shipment",
      violation: "Late ASN submission",
      fine: "$500 per occurrence",
      category: "EDI/Digital",
      severity: "Medium",
      fine_amount: 500,
      fine_unit: "per occurrence",
      additional_fees: null,
      prevention_method: "Automated alerts",
      responsible_party: "IT System"
    },
    {
      requirement: "Cartons must be stacked no more than 6 high",
      violation: "Overstacked cartons",
      fine: "$1/carton over limit",
      category: "Pre-Packing",
      severity: "Medium",
      fine_amount: 1,
      fine_unit: "per carton over limit",
      additional_fees: null,
      prevention_method: "Visual guides",
      responsible_party: "Warehouse Worker"
    },
    {
      requirement: "All items must have proper UPC codes",
      violation: "Missing or incorrect UPC",
      fine: "$5/item + $100 processing fee",
      category: "Pre-Packing",
      severity: "High",
      fine_amount: 5,
      fine_unit: "per item",
      additional_fees: "$100 processing fee",
      prevention_method: "Order verification",
      responsible_party: "Warehouse Worker"
    },
    {
      requirement: "Shipments must arrive within 2-hour delivery window",
      violation: "Late delivery",
      fine: "$200/hour late + $50 rescheduling fee",
      category: "Carrier/Routing",
      severity: "High",
      fine_amount: 200,
      fine_unit: "per hour late",
      additional_fees: "$50 rescheduling fee",
      prevention_method: "System validation",
      responsible_party: "Logistics Coordinator"
    },
    {
      requirement: "Packaging must meet minimum crush resistance standards",
      violation: "Insufficient packaging protection",
      fine: "$10/carton + $500 inspection fee",
      category: "During Packing",
      severity: "Medium",
      fine_amount: 10,
      fine_unit: "per carton",
      additional_fees: "$500 inspection fee",
      prevention_method: "Quality checklists",
      responsible_party: "Warehouse Worker"
    }
  ],
  
  // Seed data for workers
  workerSeedData: [
    {
      worker_id: "johnny123",
      name: "Johnny Appleseed",
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
    },
    {
      worker_id: "mike001",
      name: "Mike Rodriguez",
      department: "Warehouse"
    },
    {
      worker_id: "lisa002",
      name: "Lisa Chen",
      department: "Quality Control"
    },
    {
      worker_id: "david003",
      name: "David Wilson",
      department: "Packaging"
    },
    {
      worker_id: "emma004",
      name: "Emma Thompson",
      department: "Warehouse"
    },
    {
      worker_id: "carlos005",
      name: "Carlos Martinez",
      department: "Shipping"
    },
    {
      worker_id: "jessica006",
      name: "Jessica Brown",
      department: "Packaging"
    },
    {
      worker_id: "alex007",
      name: "Alex Johnson",
      department: "Warehouse"
    },
    {
      worker_id: "maria008",
      name: "Maria Garcia",
      department: "Quality Control"
    },
    {
      worker_id: "kevin009",
      name: "Kevin Lee",
      department: "Packaging"
    },
    {
      worker_id: "rachel010",
      name: "Rachel Davis",
      department: "Warehouse"
    },
    {
      worker_id: "tom011",
      name: "Tom Anderson",
      department: "Shipping"
    },
    {
      worker_id: "amy012",
      name: "Amy Taylor",
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
              // Run migrations after table creation
              runMigrations(db).then(resolve).catch(reject);
            }
          }
        });
      });
    });
  });
}

/**
 * Run database migrations
 * Adds new columns to existing tables
 * 
 * @param {sqlite3.Database} db - Database connection instance
 * @returns {Promise<void>} Promise that resolves when migrations are complete
 */
function runMigrations(db) {
  return new Promise((resolve, reject) => {
    const migrations = [
      "ALTER TABLE violations ADD COLUMN fine_amount REAL",
      "ALTER TABLE violations ADD COLUMN fine_unit TEXT", 
      "ALTER TABLE violations ADD COLUMN additional_fees TEXT",
      "ALTER TABLE violations ADD COLUMN prevention_method TEXT DEFAULT 'Manual verification'",
      "ALTER TABLE violations ADD COLUMN responsible_party TEXT DEFAULT 'Warehouse Worker'"
    ];
    
    let completed = 0;
    
    migrations.forEach((migration, index) => {
      db.run(migration, (err) => {
        // Ignore errors for columns that already exist
        if (err && !err.message.includes('duplicate column name')) {
          console.error(`Migration ${index + 1} failed:`, err);
        } else if (!err) {
          console.log(`Migration ${index + 1} completed: ${migration}`);
        }
        
        completed++;
        if (completed === migrations.length) {
          resolve();
        }
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
