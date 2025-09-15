const express = require('express');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const { parseComplianceData, validateRequirements } = require('./services/parserService');

async function testUpload() {
  try {
    console.log('=== TESTING UPLOAD ROUTE LOGIC ===');
    
    // Simulate the upload route logic
    console.log('Reading PDF...');
    const pdfBuffer = fs.readFileSync('../Dicks Routing Guide (1).pdf');
    const pdfData = await pdfParse(pdfBuffer);
    
    if (!pdfData.text || pdfData.text.trim().length === 0) {
      throw new Error('No text content found in PDF');
    }
    
    console.log(`Extracted ${pdfData.text.length} characters from PDF`);
    
    // Parse with AI
    console.log('Parsing compliance data with AI...');
    const structuredData = await parseComplianceData(pdfData.text);
    
    // Validate parsed data
    console.log('Validating parsed data...');
    validateRequirements(structuredData);
    
    // Extract requirements for database storage
    const requirements = Array.isArray(structuredData) ? structuredData : structuredData.requirements;
    console.log(`Successfully parsed ${requirements.length} requirements`);
    
    // Simulate the response
    const response = { 
      success: true, 
      data: structuredData, // Return full structured data
      requirements: requirements, // Backward compatibility
      inserted_count: requirements.length,
      message: `Successfully parsed ${requirements.length} requirements from test.pdf`
    };
    
    console.log('\n=== RESPONSE STRUCTURE ===');
    console.log('Has data field:', !!response.data);
    console.log('Data keys:', response.data ? Object.keys(response.data) : 'none');
    console.log('Requirements count:', response.requirements.length);
    console.log('Order types in data:', response.data?.order_types?.length || 0);
    console.log('Carton specs in data:', Object.keys(response.data?.carton_specs || {}));
    
    console.log('\n=== FULL RESPONSE ===');
    console.log(JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testUpload();
