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
  model: "gpt-4o-mini",
  
  // Temperature setting for consistent results
  temperature: 0.1,
  
  // Maximum text length to process (to avoid token limits)
  maxTextLength: 50000,
  
  // System prompt for the AI assistant
  systemPrompt: "You are an expert at parsing retailer routing guides and compliance documents. You excel at extracting structured data about requirements, violations, fines, and operational guidelines. You can identify packing methods, violation matrices, specifications, timing requirements, and product-specific rules.",
  
  // User prompt template
  userPromptTemplate: `
    Parse the following Dick's Sporting Goods routing guide text and extract REAL compliance requirements with ACTUAL fine amounts from the document.
    
    CRITICAL: Look for these SPECIFIC violation codes and fine amounts that are mentioned in the document:
    
    VIOLATION CODES TO FIND:
    - NL: UCC128 label not on carton ($7.50 per carton + $250 service fee)
    - EA: ASN violations ($250-$500 per shipment)
    - RP: Retail price missing/inaccurate ($0.50 per unit + $250 service fee)
    - MC: Multiple UPCs mixed in one carton ($50 per occurrence)
    - CO: PO received after cancel date ($50)
    - And other violation codes mentioned in the document
    
    Extract data in these specific categories:
    
    1. ORDER TYPE REQUIREMENTS - Different packing methods and their rules
    2. VIOLATION MATRIX - All violation codes with ACTUAL fine amounts and triggers
    3. CARTON SPECIFICATIONS - Size, weight, and dimensional requirements
    4. LABEL PLACEMENT RULES - Exact positioning requirements and special cases
    5. TIMING REQUIREMENTS - Critical deadlines for ASN, routing requests, etc.
    6. PRODUCT-SPECIFIC REQUIREMENTS - Category-specific rules (apparel, footwear, etc.)
    
    Return the data in JSON format with this comprehensive structure:
    
    {
      "requirements": [
        {
          "requirement": "specific requirement text from the document",
          "violation": "what constitutes a violation",
          "fine": "exact fine amount and structure from the document",
          "category": "workflow category (Pre-Packing, During Packing, Post-Packing, Pre-Shipment, EDI/Digital, Carrier/Routing)",
          "severity": "High, Medium, or Low",
          "fine_amount": "numeric value if available",
          "fine_unit": "unit of measurement (per carton, per item, per violation, flat fee)",
          "additional_fees": "any additional fees or penalties",
          "prevention_method": "how to prevent this violation",
          "responsible_party": "who is responsible for prevention"
        }
      ],
      "order_types": [
        {
          "type": "order type name (e.g., 'Bulk Orders', 'Pack by Store', 'Direct to Store')",
          "description": "description of this order type",
          "rules": ["specific rule 1", "specific rule 2"],
          "packing_method": "packing method description",
          "skus_per_carton": "SKU mixing rules",
          "special_requirements": ["any special requirements"]
        }
      ],
      "carton_specs": {
        "conveyable": {
          "length_min": "minimum length in inches",
          "length_max": "maximum length in inches", 
          "width_min": "minimum width in inches",
          "width_max": "maximum width in inches",
          "height_min": "minimum height in inches",
          "height_max": "maximum height in inches",
          "weight_min": "minimum weight in pounds",
          "weight_max": "maximum weight in pounds"
        },
        "non_conveyable": "description of non-conveyable requirements"
      },
      "label_placement": [
        {
          "requirement": "label placement requirement",
          "standard_position": "standard positioning (e.g., '2 inches from bottom, 2 inches from right')",
          "special_cases": ["special case 1", "special case 2"],
          "violation_fine": "fine for incorrect placement"
        }
      ],
      "timing_requirements": [
        {
          "requirement": "timing requirement name (e.g., 'ASN Submission', 'Routing Request')",
          "deadline": "deadline description (e.g., 'within 1 hour of shipment')",
          "timeframe": "specific timeframe",
          "violation_fine": "fine for missing deadline"
        }
      ],
      "product_requirements": [
        {
          "category": "product category (e.g., 'Apparel', 'Footwear', 'Electronics')",
          "requirements": ["requirement 1", "requirement 2"],
          "special_rules": ["special rule 1", "special rule 2"],
          "violations": ["violation description 1", "violation description 2"]
        }
      ]
    }
    
    EXTRACTION FOCUS:
    1. Look for "Violation Amount" sections with actual fine amounts
    2. Find specific requirement text that mentions "must", "shall", "required"
    3. Extract actual dollar amounts like "$7.50", "$250", "$500", etc.
    4. Look for violation codes (NL, EA, RP, MC, CO, etc.)
    5. Find timing requirements (ASN within 1 hour, etc.)
    6. Extract carton specifications and dimensional requirements
    7. Find label placement rules and positioning requirements
    
    IMPORTANT: Only extract requirements that are ACTUALLY mentioned in the document. Don't make up requirements or fine amounts. Be accurate to what's written in the Dick's Sporting Goods routing guide.
    
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
      
      // Add new fields with defaults if not present
      req.fine_amount = req.fine_amount || null;
      req.fine_unit = req.fine_unit || null;
      req.additional_fees = req.additional_fees || null;
      req.prevention_method = req.prevention_method || 'Manual verification';
      req.responsible_party = req.responsible_party || 'Warehouse Worker';
      
      return req;
    });
    
    // Validate and structure additional data sections
    const structuredData = {
      requirements: validatedRequirements,
      order_types: parsedData.order_types || [],
      carton_specs: parsedData.carton_specs || {},
      label_placement: parsedData.label_placement || [],
      timing_requirements: parsedData.timing_requirements || [],
      product_requirements: parsedData.product_requirements || []
    };
    
    console.log(`Successfully parsed ${validatedRequirements.length} compliance requirements`);
    console.log(`Additional data: ${structuredData.order_types.length} order types, ${structuredData.label_placement.length} label rules, ${structuredData.timing_requirements.length} timing requirements`);
    
    return structuredData;
    
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
 * Validate parsed compliance requirements and structured data
 * Ensures all required fields are present and properly formatted
 * 
 * @param {Object|Array} data - Parsed data structure or array of requirements
 * @returns {boolean} True if all requirements are valid
 * @throws {Error} Throws error if validation fails
 */
function validateRequirements(data) {
  // Handle both old array format and new structured format
  const requirements = Array.isArray(data) ? data : data.requirements;
  
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
  
  // If structured data, validate additional sections
  if (!Array.isArray(data) && data.order_types) {
    if (!Array.isArray(data.order_types)) {
      throw new Error('Order types must be an array');
    }
    
    if (!Array.isArray(data.label_placement)) {
      throw new Error('Label placement must be an array');
    }
    
    if (!Array.isArray(data.timing_requirements)) {
      throw new Error('Timing requirements must be an array');
    }
    
    if (!Array.isArray(data.product_requirements)) {
      throw new Error('Product requirements must be an array');
    }
  }
  
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
