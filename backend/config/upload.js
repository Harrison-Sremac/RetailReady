/**
 * Upload Configuration Module
 * 
 * This module handles file upload configuration using Multer middleware.
 * It defines storage settings, file validation, and upload constraints
 * for PDF compliance documents.
 * 
 * @fileoverview Upload configuration and middleware setup
 * @author RetailReady Team
 * @version 1.0.0
 */

const multer = require('multer');
const path = require('path');

/**
 * Upload configuration object
 * Contains all upload-related settings and constraints
 */
const uploadConfig = {
  // Allowed file types
  allowedMimeTypes: ['application/pdf'],
  
  // Maximum file size (10MB)
  maxFileSize: 10 * 1024 * 1024,
  
  // Upload directory
  uploadDir: path.join(__dirname, '../uploads'),
  
  // File naming strategy
  filenameStrategy: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname;
    cb(null, `${timestamp}-${originalName}`);
  }
};

/**
 * Configure multer disk storage
 * Sets up file storage configuration for uploaded files
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadConfig.uploadDir);
  },
  filename: uploadConfig.filenameStrategy
});

/**
 * File filter function
 * Validates uploaded files to ensure they meet requirements
 * 
 * @param {Object} req - Express request object
 * @param {Object} file - Multer file object
 * @param {Function} cb - Callback function
 */
const fileFilter = (req, file, cb) => {
  // Check if file type is allowed
  if (uploadConfig.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Only PDF files are allowed');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

/**
 * Multer upload middleware configuration
 * Complete configuration for handling file uploads
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSize,
    files: 1 // Only allow one file at a time
  }
});

/**
 * Error handler for upload errors
 * Provides user-friendly error messages for common upload issues
 * 
 * @param {Error} error - Upload error object
 * @returns {Object} Formatted error response
 */
function handleUploadError(error) {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return {
      error: 'File too large',
      message: 'Please upload a file smaller than 10MB'
    };
  }
  
  if (error.code === 'INVALID_FILE_TYPE') {
    return {
      error: 'Invalid file type',
      message: 'Only PDF files are allowed'
    };
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return {
      error: 'Too many files',
      message: 'Please upload only one file at a time'
    };
  }
  
  return {
    error: 'Upload failed',
    message: error.message || 'An unexpected error occurred during upload'
  };
}

/**
 * Clean up uploaded file
 * Removes a file from the uploads directory
 * 
 * @param {string} filePath - Path to the file to delete
 * @returns {Promise<void>} Promise that resolves when file is deleted
 */
function cleanupUploadedFile(filePath) {
  return new Promise((resolve, reject) => {
    const fs = require('fs');
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('❌ Error deleting uploaded file:', err);
        reject(err);
      } else {
        console.log('✅ Uploaded file cleaned up:', filePath);
        resolve();
      }
    });
  });
}

module.exports = {
  uploadConfig,
  upload,
  handleUploadError,
  cleanupUploadedFile
};
