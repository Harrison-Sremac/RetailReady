/**
 * RetailReady Backend Server
 * 
 * This is the main server file for the RetailReady compliance management system.
 * It initializes the Express application, sets up middleware, routes, and
 * manages the application lifecycle.
 * 
 * @fileoverview Main server application for RetailReady backend
 * @author RetailReady Team
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import configuration and services
const { initializeCompleteDatabase, closeDatabase } = require('./config/database');

// Import route handlers
const createViolationsRouter = require('./routes/violations');
const createUploadRouter = require('./routes/upload');
const createRiskRouter = require('./routes/risk');
const createRiskOverviewRouter = require('./routes/riskOverview');
const createWorkerRouter = require('./routes/worker');

/**
 * Application configuration
 */
const config = {
  port: process.env.PORT || 3001,
  environment: process.env.NODE_ENV || 'development',
  corsOptions: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
};

/**
 * Application class
 * Manages the Express application lifecycle and configuration
 */
class RetailReadyServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.db = null;
  }

  /**
   * Initialize the Express application
   * Sets up middleware, routes, and error handling
   * 
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      console.log('Initializing RetailReady server...');
      
      // Initialize database
      console.log('Initializing database...');
      this.db = await initializeCompleteDatabase();
      
      // Setup middleware
      this.setupMiddleware();
      
      // Setup routes
      this.setupRoutes();
      
      // Setup error handling
      this.setupErrorHandling();
      
      console.log('Server initialization completed');
    } catch (error) {
      console.error('Server initialization failed:', error);
      throw error;
    }
  }

  /**
   * Setup Express middleware
   * Configures CORS, JSON parsing, and static file serving
   */
  setupMiddleware() {
    console.log('Setting up middleware...');
    
    // CORS configuration
    this.app.use(cors(config.corsOptions));
    
    // JSON body parsing
    this.app.use(express.json({ limit: '10mb' }));
    
    // URL-encoded body parsing
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Static file serving for uploads
    this.app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    
    // Request logging middleware
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
    
    console.log('Middleware setup completed');
  }

  /**
   * Setup application routes
   * Configures all API endpoints and route handlers
   */
  setupRoutes() {
    console.log('Setting up routes...');
    
    // Health check endpoint
    this.app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: config.environment,
        version: '1.0.0'
      });
    });

    // API information endpoint
    this.app.get('/api', (req, res) => {
      res.json({
        message: 'RetailReady API',
        version: '1.0.0',
        environment: config.environment,
        endpoints: {
          'GET /api/health': 'Health check',
          'GET /api': 'API information',
          'GET /api/violations': 'Get all compliance violations',
          'GET /api/violations/:id': 'Get specific violation by ID',
          'GET /api/violations/categories': 'Get available categories',
          'GET /api/violations/retailers': 'Get available retailers',
          'GET /api/violations/database-view': 'Get organized database view',
          'GET /api/violations/database-view/:retailer/:category': 'Get detailed view for specific retailer/category',
          'GET /api/violations/stats': 'Get database statistics',
          'POST /api/upload': 'Upload and parse PDF compliance guide',
          'POST /api/upload/validate': 'Validate PDF file without processing',
          'GET /api/upload/info': 'Get upload requirements',
          'POST /api/risk/score': 'Calculate risk score for violation',
          'POST /api/risk/batch': 'Calculate risk scores for multiple violations',
          'POST /api/risk/estimate': 'Estimate fine without database lookup',
          'GET /api/risk/config': 'Get risk calculation configuration',
          'POST /api/risk/overview': 'Get risk overview for order/worker combination',
          'GET /api/risk/overview/mock-data': 'Get available mock data for demo',
          'GET /api/risk/overview/config': 'Get risk overview service configuration',
          'POST /api/worker/scan': 'Create worker scan and get contextual guidance',
          'POST /api/worker/scan/:scanId/complete': 'Complete worker scan with results',
          'GET /api/worker/:workerId/performance': 'Get worker performance metrics',
          'GET /api/worker/leaderboard': 'Get worker leaderboard',
          'GET /api/worker/:workerId/guidance/:orderBarcode': 'Get guidance for specific order',
          'GET /api/worker': 'Get all workers'
        },
        status: 'OK',
        timestamp: new Date().toISOString()
      });
    });

    // Setup route handlers with database connection
    this.app.use('/api/violations', createViolationsRouter(this.db));
    this.app.use('/api/upload', createUploadRouter(this.db));
    this.app.use('/api/risk', createRiskRouter(this.db));
    this.app.use('/api/risk/overview', createRiskOverviewRouter());
    this.app.use('/api/worker', createWorkerRouter(this.db));

    // 404 handler for undefined routes
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        message: `The requested route ${req.method} ${req.originalUrl} was not found`,
        availableRoutes: '/api'
      });
    });
    
    console.log('Routes setup completed');
  }

  /**
   * Setup error handling middleware
   * Configures global error handling for the application
   */
  setupErrorHandling() {
    console.log('Setting up error handling...');
    
    // Global error handler
    this.app.use((error, req, res, next) => {
      console.error('Unhandled error:', error);
      
      // Handle specific error types
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: 'File too large',
          message: 'The uploaded file exceeds the maximum allowed size'
        });
      }
      
      if (error.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
          error: 'Invalid file type',
          message: 'Only PDF files are allowed'
        });
      }
      
      // Generic error response
      res.status(500).json({
        error: 'Internal server error',
        message: config.environment === 'development' ? error.message : 'An unexpected error occurred'
      });
    });
    
    console.log('Error handling setup completed');
  }

  /**
   * Start the server
   * Begins listening for incoming connections
   * 
   * @returns {Promise<void>}
   */
  async start() {
    try {
      await this.initialize();
      
      this.server = this.app.listen(config.port, () => {
        console.log('RetailReady backend server running on port', config.port);
        console.log('API endpoints available at http://localhost:' + config.port + '/api');
        console.log('Environment:', config.environment);
        console.log('Health check: http://localhost:' + config.port + '/api/health');
      });
      
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Stop the server gracefully
   * Closes database connections and stops the server
   * 
   * @returns {Promise<void>}
   */
  async stop() {
    console.log('Shutting down server...');
    
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(async () => {
          console.log('HTTP server closed');
          
          if (this.db) {
            await closeDatabase(this.db);
          }
          
          console.log('Server shutdown completed');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

/**
 * Create and start the server instance
 */
const server = new RetailReadyServer();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  await server.stop();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
server.start().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

module.exports = RetailReadyServer;
