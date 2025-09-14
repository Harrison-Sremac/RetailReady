/**
 * Parser Service Module
 * 
 * This module handles AI-powered parsing of compliance documents.
 * It uses OpenAI's GPT models to extract structured compliance data
 * from PDF text content.
 * 
 * @fileoverview AI-powered compliance document parsing service
 * @author RetailReady Team
 * @version 1.0.0
 */

const OpenAI = require('openai');
require('dotenv').config();

/**
 * OpenAI client configuration
 * Initializes the OpenAI client with API key from environment variables
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Parser configuration object
 * Contains settings for AI parsing operations
 */
const parserConfig = {
  // OpenAI model to use for parsing
  model: "gpt-3.5-turbo",
  
  // Temperature setting for consistent results
  temperature: 0.1,
  
  // Maximum text length to process (to avoid token limits)
  maxTextLength: 4000,
  
  // System prompt for the AI assistant
  systemPrompt: "You are an expert at parsing retailer compliance documents and extracting structured data about requirements, violations, and fines.",
  
  // User prompt template
  userPromptTemplate: `
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
    {text}
  `
};

/**
 * Parse compliance data from PDF text using OpenAI
 * 
 * This function takes raw PDF text and uses AI to extract structured
 * compliance requirements, violations, and fine information.
 * 
 * @param {string} pdfText - The extracted text from the PDF document
 * @returns {Promise<Array>} Array of parsed compliance requirements
 * @throws {Error} Throws error if parsing fails
 * 
 * @example
 * const requirements = await parseComplianceData("PDF text content...");
 * console.log(requirements); // [{ requirement: "...", violation: "...", ... }]
 */
async function parseComplianceData(pdfText) {
  try {
    // Validate input
    if (!pdfText || typeof pdfText !== 'string') {
      throw new Error('Invalid PDF text provided');
    }
    
    // Truncate text to avoid token limits
    const truncatedText = pdfText.substring(0, parserConfig.maxTextLength);
    
    // Create the user prompt with the PDF text
    const userPrompt = parserConfig.userPromptTemplate.replace('{text}', truncatedText);
    
    console.log('Sending request to OpenAI for compliance parsing...');
    
    // Make request to OpenAI
    const response = await openai.chat.completions.create({
      model: parserConfig.model,
      messages: [
        {
          role: "system",
          content: parserConfig.systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: parserConfig.temperature,
    });

    // Extract and clean the response content
    const content = response.choices[0].message.content;
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    
    console.log('OpenAI parsing completed successfully');
    
    // Parse the JSON response
    const parsedData = JSON.parse(cleanContent);
    
    // Validate the response structure
    if (!parsedData.requirements || !Array.isArray(parsedData.requirements)) {
      throw new Error('Invalid response structure from AI parser');
    }
    
    // Validate each requirement object
    const validatedRequirements = parsedData.requirements.map((req, index) => {
      if (!req.requirement || !req.violation || !req.fine || !req.category || !req.severity) {
        throw new Error(`Invalid requirement structure at index ${index}`);
      }
      
      // Ensure severity is valid
      if (!['High', 'Medium', 'Low'].includes(req.severity)) {
        req.severity = 'Medium'; // Default to Medium if invalid
      }
      
      return req;
    });
    
    console.log(`Successfully parsed ${validatedRequirements.length} compliance requirements`);
    
    return validatedRequirements;
    
  } catch (error) {
    console.error('Error parsing with OpenAI:', error);
    
    // Provide more specific error messages
    if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded. Please check your billing.');
    }
    
    if (error.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key. Please check your configuration.');
    }
    
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse AI response as JSON');
    }
    
    throw new Error(`Failed to parse compliance data: ${error.message}`);
  }
}

/**
 * Validate parsed compliance requirements
 * Ensures all required fields are present and properly formatted
 * 
 * @param {Array} requirements - Array of parsed requirements
 * @returns {boolean} True if all requirements are valid
 * @throws {Error} Throws error if validation fails
 */
function validateRequirements(requirements) {
  if (!Array.isArray(requirements)) {
    throw new Error('Requirements must be an array');
  }
  
  if (requirements.length === 0) {
    throw new Error('No requirements found in parsed data');
  }
  
  requirements.forEach((req, index) => {
    const requiredFields = ['requirement', 'violation', 'fine', 'category', 'severity'];
    
    requiredFields.forEach(field => {
      if (!req[field] || typeof req[field] !== 'string') {
        throw new Error(`Missing or invalid ${field} at requirement index ${index}`);
      }
    });
    
    // Validate severity
    if (!['High', 'Medium', 'Low'].includes(req.severity)) {
      throw new Error(`Invalid severity '${req.severity}' at requirement index ${index}`);
    }
  });
  
  return true;
}

/**
 * Get parser statistics
 * Returns information about the parser configuration and capabilities
 * 
 * @returns {Object} Parser statistics and configuration
 */
function getParserStats() {
  return {
    model: parserConfig.model,
    maxTextLength: parserConfig.maxTextLength,
    temperature: parserConfig.temperature,
    supportedFormats: ['PDF'],
    supportedLanguages: ['English']
  };
}

module.exports = {
  parseComplianceData,
  validateRequirements,
  getParserStats,
  parserConfig
};
