/**
 * Upload Routes Module
 * 
 * This module handles file upload functionality for PDF compliance documents.
 * It manages file validation, AI parsing, and database storage of parsed data.
 * 
 * @fileoverview API routes for PDF upload and parsing
 * @author RetailReady Team
 * @version 1.0.0
 */

const express = require('express');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const { upload, handleUploadError, cleanupUploadedFile } = require('../config/upload');
const { parseComplianceData, validateRequirements } = require('../services/parserService');
const DatabaseService = require('../services/databaseService');

/**
 * Create upload router
 * 
 * @param {sqlite3.Database} db - Database connection instance
 * @returns {express.Router} Express router instance
 */
function createUploadRouter(db) {
  const router = express.Router();
  const dbService = new DatabaseService(db);

  /**
   * POST /api/upload
   * 
   * Upload and parse a PDF compliance document
   * 
   * @route POST /api/upload
   * @param {Object} req - Express request object with file upload
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  router.post('/', upload.single('pdf'), async (req, res) => {
    let uploadedFilePath = null;
    
    try {
      // Validate file upload
      if (!req.file) {
        return res.status(400).json({ 
          error: 'No PDF file uploaded',
          message: 'Please select a PDF file to upload'
        });
      }

      uploadedFilePath = req.file.path;
      console.log('Processing uploaded file:', req.file.originalname);

      // Extract text from PDF
      console.log('Extracting text from PDF...');
      const pdfBuffer = fs.readFileSync(uploadedFilePath);
      const pdfData = await pdfParse(pdfBuffer);
      
      if (!pdfData.text || pdfData.text.trim().length === 0) {
        throw new Error('No text content found in PDF');
      }

      console.log(`Extracted ${pdfData.text.length} characters from PDF`);

      // Parse with AI
      console.log('Parsing compliance data with AI...');
      const structuredData = await parseComplianceData(pdfData.text);
      
      // Validate parsed data (handle both old array format and new structured format)
      validateRequirements(structuredData);

      // Extract requirements for database storage
      const requirements = Array.isArray(structuredData) ? structuredData : structuredData.requirements;
      console.log(`Successfully parsed ${requirements.length} requirements`);

      // Store requirements in database
      console.log('Storing requirements in database...');
      const insertedIds = await dbService.insertViolationsBatch(
        requirements.map(req => ({
          ...req,
          retailer: structuredData.retailer || "Uploaded Document"
        }))
      );

      console.log(`Stored ${insertedIds.length} requirements in database`);

      // Clean up uploaded file
      await cleanupUploadedFile(uploadedFilePath);
      uploadedFilePath = null; // Mark as cleaned up

      // Return success response with full structured data
      console.log('Returning response with structured data:', {
        hasData: !!structuredData,
        dataKeys: structuredData ? Object.keys(structuredData) : 'none',
        requirementsCount: requirements.length
      });
      
      res.json({ 
        success: true, 
        data: structuredData, // Return full structured data
        requirements: requirements, // Backward compatibility
        inserted_count: insertedIds.length,
        message: `Successfully parsed ${requirements.length} requirements from ${req.file.originalname}`
      });

    } catch (error) {
      console.error('Upload processing error:', error);

      // Clean up uploaded file if it exists
      if (uploadedFilePath) {
        try {
          await cleanupUploadedFile(uploadedFilePath);
        } catch (cleanupError) {
          console.error('Error cleaning up uploaded file:', cleanupError);
        }
      }

      // Handle specific error types
      if (error.message.includes('No text content')) {
        return res.status(400).json({ 
          error: 'Invalid PDF',
          message: 'The PDF file does not contain readable text content'
        });
      }

      if (error.message.includes('OpenAI')) {
        return res.status(500).json({ 
          error: 'AI Processing Failed',
          message: 'Failed to parse document with AI. Please check your API configuration.'
        });
      }

      if (error.message.includes('Invalid response structure')) {
        return res.status(500).json({ 
          error: 'Parsing Error',
          message: 'Failed to parse document structure. Please try a different document.'
        });
      }

      // Generic error response
      res.status(500).json({ 
        error: 'Upload Failed',
        message: error.message || 'An unexpected error occurred during upload processing'
      });
    }
  });

  /**
   * POST /api/upload/validate
   * 
   * Validate a PDF file without processing it
   * 
   * @route POST /api/upload/validate
   * @param {Object} req - Express request object with file upload
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  router.post('/validate', upload.single('pdf'), async (req, res) => {
    let uploadedFilePath = null;
    
    try {
      // Validate file upload
      if (!req.file) {
        return res.status(400).json({ 
          error: 'No PDF file uploaded',
          message: 'Please select a PDF file to validate'
        });
      }

      uploadedFilePath = req.file.path;
      console.log('Validating uploaded file:', req.file.originalname);

      // Extract text from PDF
      const pdfBuffer = fs.readFileSync(uploadedFilePath);
      const pdfData = await pdfParse(pdfBuffer);
      
      // Clean up uploaded file
      await cleanupUploadedFile(uploadedFilePath);
      uploadedFilePath = null;

      // Return validation results
      res.json({
        success: true,
        validation: {
          filename: req.file.originalname,
          fileSize: req.file.size,
          hasText: pdfData.text && pdfData.text.trim().length > 0,
          textLength: pdfData.text ? pdfData.text.length : 0,
          pages: pdfData.numpages || 0,
          isValid: pdfData.text && pdfData.text.trim().length > 0
        },
        message: 'File validation completed successfully'
      });

    } catch (error) {
      console.error('File validation error:', error);

      // Clean up uploaded file if it exists
      if (uploadedFilePath) {
        try {
          await cleanupUploadedFile(uploadedFilePath);
        } catch (cleanupError) {
          console.error('Error cleaning up uploaded file:', cleanupError);
        }
      }

      res.status(400).json({ 
        error: 'Validation Failed',
        message: error.message || 'Failed to validate PDF file'
      });
    }
  });

  /**
   * GET /api/upload/info
   * 
   * Get upload configuration and requirements
   * 
   * @route GET /api/upload/info
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {void}
   */
  router.get('/info', (req, res) => {
    res.json({
      message: 'Upload configuration and requirements',
      requirements: {
        fileTypes: ['PDF'],
        maxFileSize: '10MB',
        supportedFormats: ['application/pdf']
      },
      endpoints: {
        'POST /api/upload': 'Upload and parse PDF compliance document',
        'POST /api/upload/validate': 'Validate PDF file without processing',
        'GET /api/upload/info': 'Get upload requirements and configuration'
      }
    });
  });

  return router;
}

module.exports = createUploadRouter;
