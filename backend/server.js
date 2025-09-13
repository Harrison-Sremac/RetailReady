const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize SQLite database
const db = new sqlite3.Database('./compliance.db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Initialize database tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS violations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requirement TEXT NOT NULL,
    violation TEXT NOT NULL,
    fine TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL,
    retailer TEXT DEFAULT 'Unknown',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Seed data for Dick's Sporting Goods
const seedData = [
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
];

// Seed the database if empty
db.get("SELECT COUNT(*) as count FROM violations", (err, row) => {
  if (err) {
    console.error('Error checking database:', err);
  } else if (row.count === 0) {
    console.log('Seeding database with Dick\'s Sporting Goods compliance data...');
    const stmt = db.prepare("INSERT INTO violations (requirement, violation, fine, category, severity, retailer) VALUES (?, ?, ?, ?, ?, ?)");
    seedData.forEach(item => {
      stmt.run([item.requirement, item.violation, item.fine, item.category, item.severity, "Dick's Sporting Goods"]);
    });
    stmt.finalize();
    console.log('Database seeded successfully!');
  }
});

// AI parsing function
async function parseComplianceData(pdfText) {
  try {
    const prompt = `
    Parse the following retailer compliance guide text and extract compliance requirements, violations, and fine structures. 
    Return the data in JSON format with this structure:
    
    {
      "requirements": [
        {
          "requirement": "specific requirement text",
          "violation": "what constitutes a violation",
          "fine": "fine amount and structure",
          "category": "category like Labeling, ASN, Packaging, Delivery",
          "severity": "High, Medium, or Low"
        }
      ]
    }
    
    Text to parse:
    ${pdfText.substring(0, 4000)} // Limit to avoid token limits
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at parsing retailer compliance documents and extracting structured data about requirements, violations, and fines."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
    });

    const parsedData = JSON.parse(response.choices[0].message.content);
    return parsedData.requirements || [];
  } catch (error) {
    console.error('Error parsing with OpenAI:', error);
    throw new Error('Failed to parse compliance data');
  }
}

// API Routes

// Upload and parse PDF
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    // Extract text from PDF
    const pdfBuffer = require('fs').readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);
    
    // Parse with AI
    const requirements = await parseComplianceData(pdfData.text);
    
    // Store in database
    const stmt = db.prepare("INSERT INTO violations (requirement, violation, fine, category, severity, retailer) VALUES (?, ?, ?, ?, ?, ?)");
    requirements.forEach(req => {
      stmt.run([req.requirement, req.violation, req.fine, req.category, req.severity, "Uploaded Document"]);
    });
    stmt.finalize();

    // Clean up uploaded file
    require('fs').unlinkSync(req.file.path);

    res.json({ 
      success: true, 
      requirements: requirements,
      message: `Successfully parsed ${requirements.length} requirements`
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all violations
app.get('/api/violations', (req, res) => {
  const { category, severity, retailer } = req.query;
  
  let query = "SELECT * FROM violations WHERE 1=1";
  const params = [];
  
  if (category) {
    query += " AND category = ?";
    params.push(category);
  }
  
  if (severity) {
    query += " AND severity = ?";
    params.push(severity);
  }
  
  if (retailer) {
    query += " AND retailer = ?";
    params.push(retailer);
  }
  
  query += " ORDER BY created_at DESC";

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get categories for filtering
app.get('/api/categories', (req, res) => {
  db.all("SELECT DISTINCT category FROM violations ORDER BY category", (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows.map(row => row.category));
  });
});

// Calculate risk score
app.post('/api/risk-score', (req, res) => {
  const { violationId, units } = req.body;
  
  if (!violationId || !units) {
    return res.status(400).json({ error: 'violationId and units are required' });
  }

  db.get("SELECT * FROM violations WHERE id = ?", [violationId], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Violation not found' });
    }

    // Simple risk calculation based on fine structure
    let estimatedFine = 0;
    const fineText = row.fine.toLowerCase();
    
    if (fineText.includes('per carton') || fineText.includes('/carton')) {
      const perCartonMatch = fineText.match(/\$(\d+)\/carton/);
      if (perCartonMatch) {
        estimatedFine += parseInt(perCartonMatch[1]) * units;
      }
    }
    
    if (fineText.includes('per item') || fineText.includes('/item')) {
      const perItemMatch = fineText.match(/\$(\d+)\/item/);
      if (perItemMatch) {
        estimatedFine += parseInt(perItemMatch[1]) * units;
      }
    }
    
    if (fineText.includes('per occurrence') || fineText.includes('per hour')) {
      const perOccurrenceMatch = fineText.match(/\$(\d+)/);
      if (perOccurrenceMatch) {
        estimatedFine += parseInt(perOccurrenceMatch[1]);
      }
    }
    
    // Add base fees
    if (fineText.includes('processing fee') || fineText.includes('inspection fee')) {
      const feeMatch = fineText.match(/\$(\d+)\s+(?:processing|inspection)\s+fee/);
      if (feeMatch) {
        estimatedFine += parseInt(feeMatch[1]);
      }
    }

    res.json({
      violation: row,
      units: units,
      estimatedFine: estimatedFine,
      severity: row.severity,
      riskLevel: estimatedFine > 1000 ? 'High' : estimatedFine > 500 ? 'Medium' : 'Low'
    });
  });
});

// API root endpoint - shows available routes
app.get('/api', (req, res) => {
  res.json({
    message: 'RetailReady API',
    version: '1.0.0',
    endpoints: {
      'GET /api/violations': 'Get all compliance violations',
      'GET /api/categories': 'Get available categories',
      'POST /api/upload': 'Upload and parse PDF compliance guide',
      'POST /api/risk-score': 'Calculate risk score for violation',
      'GET /api/health': 'Health check'
    },
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 RetailReady backend server running on port ${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
});

