/**
 * Worker Management Data Seeding Service
 * 
 * This module handles seeding worker data and scan history for both
 * local development and Railway deployment environments.
 * 
 * @fileoverview Worker management data seeding service
 * @author RetailReady Team
 * @version 1.0.0
 */

const sqlite3 = require('sqlite3').verbose();

// Database configuration - adapts to environment
const dbPath = process.env.NODE_ENV === 'production' ? '/tmp/railway.db' : './compliance.db';

// Worker seed data (same as local)
const workerSeedData = [
  { worker_id: "johnny123", name: "Johnny Appleseed", department: "Warehouse" },
  { worker_id: "john456", name: "John Smith", department: "Warehouse" },
  { worker_id: "sarah789", name: "Sarah Johnson", department: "Packaging" },
  { worker_id: "mike001", name: "Mike Rodriguez", department: "Warehouse" },
  { worker_id: "lisa002", name: "Lisa Chen", department: "Quality Control" },
  { worker_id: "david003", name: "David Wilson", department: "Packaging" },
  { worker_id: "emma004", name: "Emma Thompson", department: "Warehouse" },
  { worker_id: "carlos005", name: "Carlos Martinez", department: "Shipping" },
  { worker_id: "jessica006", name: "Jessica Brown", department: "Packaging" },
  { worker_id: "alex007", name: "Alex Johnson", department: "Warehouse" },
  { worker_id: "maria008", name: "Maria Garcia", department: "Quality Control" },
  { worker_id: "kevin009", name: "Kevin Lee", department: "Packaging" },
  { worker_id: "rachel010", name: "Rachel Davis", department: "Warehouse" },
  { worker_id: "tom011", name: "Tom Anderson", department: "Shipping" },
  { worker_id: "amy012", name: "Amy Taylor", department: "Packaging" }
];

/**
 * Seed worker management database with worker data and scan history
 * Works for both local development and Railway production environments
 * 
 * @returns {Promise<void>} Resolves when seeding is complete
 */
async function seedWorkerManagementDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log(`Connected to ${process.env.NODE_ENV === 'production' ? 'Railway' : 'local'} database`);
    });

    // Clear existing worker scan data
    db.run("DELETE FROM worker_scans", (err) => {
      if (err) {
        console.error('Error clearing worker scans:', err);
        reject(err);
        return;
      }
      console.log('Cleared existing worker scan data');
      
      // Seed workers if they don't exist
      db.get("SELECT COUNT(*) as count FROM workers", (err, row) => {
        if (err) {
          console.error('Error checking workers table:', err);
          reject(err);
          return;
        }
        
        if (row.count === 0) {
          console.log('Seeding workers...');
          const workerStmt = db.prepare(`
            INSERT INTO workers (worker_id, name, department, hire_date, status) 
            VALUES (?, ?, ?, ?, ?)
          `);
          
          workerSeedData.forEach(worker => {
            workerStmt.run([
              worker.worker_id,
              worker.name,
              worker.department,
              new Date().toISOString(),
              'active'
            ]);
          });
          
          workerStmt.finalize();
          console.log('Workers seeded successfully!');
        } else {
          console.log('Workers already exist, skipping seed');
        }
        
        // Seed worker scan data (same as local version)
        console.log('Seeding worker scan data...');
        
        const scanStmt = db.prepare(`
          INSERT INTO worker_scans (worker_id, order_barcode, sku, carton_id, order_type, retailer, status, violations_prevented, violations_occurred, estimated_fine_saved, estimated_fine_incurred, timestamp) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        // Generate mock scan data for the last 30 days (same as local)
        const orderTypes = ['Standard', 'Express', 'Bulk', 'Fragile'];
        const retailers = ['Target', 'Walmart', 'Amazon', 'Best Buy'];
        const statuses = ['completed', 'completed', 'completed', 'completed', 'completed']; // Mostly successful
        
        for (let i = 0; i < 200; i++) {
          const worker = workerSeedData[Math.floor(Math.random() * workerSeedData.length)];
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
        }
        
        scanStmt.finalize();
        console.log('Worker scan data seeded successfully!');
        
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
            reject(err);
          } else {
            console.log('Database connection closed');
            resolve();
          }
        });
      });
    });
  });
}

// Export the seeding function for use in other modules
module.exports = {
  seedWorkerManagementDatabase,
  workerSeedData
};

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedWorkerManagementDatabase()
    .then(() => {
      console.log('Worker management database seeded successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding worker management database:', error);
      process.exit(1);
    });
}
