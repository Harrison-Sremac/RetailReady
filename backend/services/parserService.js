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
 * Retailer-specific parsing configurations
 * Contains prompts and patterns for different retailers
 */
const retailerConfigs = {
  "Dick's Sporting Goods": {
    name: "Dick's Sporting Goods",
    keywords: ["Dick's Sporting Goods", "Dick's", "Dicks Sporting Goods", "DSG"],
    violationCodes: ["NL", "EA", "RP", "MC", "CO", "AS", "BL", "CC", "CR", "CS", "DC", "DI", "DM", "DP", "DR", "DS", "DT", "DU", "DV", "DW", "DX", "DY", "DZ"],
    specificPrompts: {
      violationFocus: "Look for Dick's Sporting Goods specific violation codes: NL (UCC128 label), EA (ASN violations), RP (retail price), MC (multiple UPCs), CO (PO cancel date), and ANY OTHER violation codes mentioned. Also look for: carton specifications, weight limits, dimensional requirements, label placement rules, timing requirements, carrier requirements, quality standards, inventory requirements, communication requirements, operational procedures, environmental requirements, security protocols, and any other compliance requirements mentioned anywhere in the document.",
      fineStructure: "Dick's typically uses per-carton fines ($7.50) plus service fees ($250), per-unit fines ($0.50), and flat fees ($50). Look for ANY other fine amounts, penalties, or chargebacks mentioned in the document."
    }
  },
  "Walmart": {
    name: "Walmart",
    keywords: ["Walmart", "Wal-Mart", "Sam's Club"],
    violationCodes: ["ASN", "EDI", "UPC", "LABEL", "PACK", "SHIP"],
    specificPrompts: {
      violationFocus: "Look for Walmart-specific compliance requirements including ASN violations, EDI requirements, UPC accuracy, and packaging standards.",
      fineStructure: "Walmart typically uses chargeback systems with per-item or per-shipment penalties."
    }
  },
  "Target": {
    name: "Target",
    keywords: ["Target", "Target Corporation"],
    violationCodes: ["ASN", "EDI", "UPC", "LABEL", "PACK", "SHIP"],
    specificPrompts: {
      violationFocus: "Look for Target-specific compliance requirements including ASN violations, EDI requirements, UPC accuracy, and packaging standards.",
      fineStructure: "Target typically uses chargeback systems with per-item or per-shipment penalties."
    }
  },
  "Amazon": {
    name: "Amazon",
    keywords: ["Amazon", "Amazon.com", "FBA", "Fulfillment by Amazon"],
    violationCodes: ["ASIN", "FNSKU", "LABEL", "PACK", "SHIP"],
    specificPrompts: {
      violationFocus: "Look for Amazon-specific compliance requirements including ASIN accuracy, FNSKU labeling, packaging standards, and shipping requirements.",
      fineStructure: "Amazon typically uses per-unit penalties and may suspend selling privileges for violations."
    }
  },
  "Generic": {
    name: "Generic Retailer",
    keywords: [],
    violationCodes: [],
    specificPrompts: {
      violationFocus: "Look for any violation codes, compliance requirements, fine structures, and penalty systems mentioned in the document.",
      fineStructure: "Extract any fine amounts, penalty structures, chargeback systems, or violation fees mentioned."
    }
  }
};

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
  systemPrompt: "You are an expert at parsing retailer routing guides and compliance documents. You excel at extracting structured data about requirements, violations, fines, and operational guidelines. You can identify packing methods, violation matrices, specifications, timing requirements, and product-specific rules from ANY retailer's compliance documents.",
  
  // Base user prompt template (will be customized based on retailer detection)
  basePromptTemplate: `
    Parse the following retailer routing guide/compliance document text and extract ALL compliance requirements with ACTUAL fine amounts from the document.
    
    RETAILER DETECTED: {retailerName}
    
    {retailerSpecificInstructions}
    
    COMPREHENSIVE VIOLATION DETECTION - BE THOROUGH AND AGGRESSIVE:
    You MUST find EVERY SINGLE compliance requirement, violation, penalty, fine, chargeback, or non-compliance issue mentioned in this document. Look for:
    
    CORE VIOLATION CATEGORIES:
    - Labeling violations (UCC128, FNSKU, ASIN, UPC, barcode, label placement, label accuracy)
    - ASN/EDI violations (Advanced Shipping Notice, Electronic Data Interchange, timing, accuracy)
    - Packaging violations (carton specifications, weight limits, dimensions, materials, construction)
    - Shipping violations (carrier requirements, routing, timing, delivery, tracking)
    - Product violations (UPC accuracy, retail price, product mixing, SKU accuracy, product codes)
    - Documentation violations (PO accuracy, cancel dates, paperwork, forms, certificates)
    - Quality violations (damaged goods, defective products, quality standards)
    - Inventory violations (quantity discrepancies, stock levels, inventory accuracy)
    - Compliance violations (regulatory requirements, safety standards, certifications)
    - Operational violations (processing time, handling procedures, storage requirements)
    - Communication violations (notification requirements, reporting, updates)
    - Financial violations (billing accuracy, payment terms, invoicing)
    - Environmental violations (packaging materials, sustainability requirements)
    - Security violations (access control, handling procedures, security protocols)
    
    SEARCH STRATEGY:
    1. Look for ANY text that mentions "violation", "fine", "penalty", "chargeback", "fee", "cost"
    2. Find ALL instances of dollar amounts ($X.XX, $X, etc.)
    3. Look for requirement words: "must", "shall", "required", "prohibited", "not allowed", "cannot"
    4. Find conditional statements: "if", "when", "unless", "except"
    5. Look for violation codes, error codes, or reference numbers
    6. Find timing requirements and deadlines
    7. Look for specifications, standards, or guidelines
    8. Find any consequences or penalties mentioned
    9. Look for "failure to", "non-compliance", "incorrect", "inaccurate", "missing"
    10. Find any operational requirements or procedures
    
    Extract data in these comprehensive categories:
    
    1. ORDER TYPE REQUIREMENTS - Different packing methods and their rules
    2. VIOLATION MATRIX - ALL violation codes with ACTUAL fine amounts and triggers
    3. CARTON SPECIFICATIONS - Size, weight, and dimensional requirements
    4. LABEL PLACEMENT RULES - Exact positioning requirements and special cases
    5. TIMING REQUIREMENTS - Critical deadlines for ASN, routing requests, etc.
    6. PRODUCT-SPECIFIC REQUIREMENTS - Category-specific rules (apparel, footwear, etc.)
    7. SHIPPING REQUIREMENTS - Carrier specifications, routing rules, delivery requirements
    8. DOCUMENTATION REQUIREMENTS - EDI, ASN, PO, and paperwork requirements
    
    Return the data in JSON format with this comprehensive structure:
    
    {
      "retailer": "{retailerName}",
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
          "responsible_party": "who is responsible for prevention",
          "violation_code": "specific violation code if mentioned (e.g., NL, EA, RP, etc.)"
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
      ],
      "shipping_requirements": [
        {
          "requirement": "shipping requirement name",
          "carrier": "specific carrier requirements",
          "routing": "routing specifications",
          "violation_fine": "fine for shipping violations"
        }
      ],
      "documentation_requirements": [
        {
          "requirement": "documentation requirement name",
          "edi_requirements": "EDI specifications",
          "asn_requirements": "ASN requirements",
          "violation_fine": "fine for documentation violations"
        }
      ]
    }
    
    EXTRACTION FOCUS - BE EXTREMELY THOROUGH:
    1. Look for "Violation Amount", "Fine", "Penalty", "Chargeback", "Fee", "Cost" sections with actual amounts
    2. Find ALL requirement text that mentions "must", "shall", "required", "prohibited", "not allowed", "cannot", "failure to"
    3. Extract ALL dollar amounts like "$7.50", "$250", "$500", "$0.50", "$1.00", "$10", "$25", "$100", etc.
    4. Look for ALL violation codes, error codes, reference numbers (NL, EA, RP, MC, CO, ASN, EDI, UPC, etc.)
    5. Find ALL timing requirements (ASN within 1 hour, EDI deadlines, processing times, etc.)
    6. Extract ALL carton specifications, dimensional requirements, weight limits, material requirements
    7. Find ALL label placement rules, positioning requirements, label content requirements
    8. Look for carrier-specific requirements, routing rules, delivery requirements, tracking requirements
    9. Extract EDI and documentation requirements, form requirements, certificate requirements
    10. Find product-specific compliance rules, quality standards, inspection requirements
    11. Look for inventory requirements, quantity requirements, stock level requirements
    12. Find communication requirements, notification requirements, reporting requirements
    13. Look for operational requirements, handling procedures, storage requirements
    14. Find environmental requirements, sustainability requirements, packaging material requirements
    15. Look for security requirements, access control, handling procedures
    16. Find any conditional requirements ("if", "when", "unless", "except")
    17. Look for any consequences, penalties, or non-compliance results
    18. Find any specifications, standards, guidelines, or procedures mentioned
    
    CRITICAL INSTRUCTION: You MUST extract EVERY SINGLE compliance requirement, violation, penalty, fine, or non-compliance issue mentioned anywhere in this document. Do not stop at just the obvious ones. Look through the ENTIRE document systematically. If you find fewer than 10 violations, you are not being thorough enough. A comprehensive routing guide typically contains 15-30+ different compliance requirements and violations.
    
    IMPORTANT: Extract EVERY compliance requirement and violation mentioned in the document. Don't limit yourself to just a few categories. Be comprehensive and thorough. Only extract requirements that are ACTUALLY mentioned in the document. Don't make up requirements or fine amounts. Be accurate to what's written in the routing guide.
    
    Text to parse:
    {text}
  `
};

/**
 * Detect retailer from PDF text content
 * Analyzes the text to identify which retailer the document belongs to
 * 
 * @param {string} pdfText - The extracted text from the PDF document
 * @returns {Object} Detected retailer configuration
 */
function detectRetailer(pdfText) {
  const text = pdfText.toLowerCase();
  
  // Check each retailer configuration
  for (const [retailerName, config] of Object.entries(retailerConfigs)) {
    if (retailerName === "Generic") continue; // Skip generic, use as fallback
    
    // Check if any keywords match
    const hasKeyword = config.keywords.some(keyword => 
      text.includes(keyword.toLowerCase())
    );
    
    if (hasKeyword) {
      console.log(`Detected retailer: ${retailerName}`);
      return config;
    }
  }
  
  // Fallback to generic if no specific retailer detected
  console.log('No specific retailer detected, using generic parsing');
  return retailerConfigs.Generic;
}

/**
 * Generate dynamic prompt based on detected retailer
 * Creates a customized prompt for the specific retailer
 * 
 * @param {Object} retailerConfig - The detected retailer configuration
 * @param {string} pdfText - The PDF text to parse
 * @returns {string} Customized prompt for the retailer
 */
function generateDynamicPrompt(retailerConfig, pdfText) {
  const retailerSpecificInstructions = `
    ${retailerConfig.specificPrompts.violationFocus}
    
    ${retailerConfig.specificPrompts.fineStructure}
    
    ${retailerConfig.violationCodes.length > 0 ? 
      `Known violation codes for this retailer: ${retailerConfig.violationCodes.join(', ')}` : 
      'Look for any violation codes mentioned in the document'
    }
  `;
  
  return parserConfig.basePromptTemplate
    .replace('{retailerName}', retailerConfig.name)
    .replace('{retailerSpecificInstructions}', retailerSpecificInstructions)
    .replace('{text}', pdfText);
}

/**
 * Parse compliance data from PDF text using OpenAI
 * 
 * This function takes raw PDF text and uses AI to extract structured
 * compliance requirements, violations, and fine information.
 * Now supports dynamic retailer detection and comprehensive parsing.
 * 
 * @param {string} pdfText - The extracted text from the PDF document
 * @returns {Promise<Object>} Structured compliance data with retailer info
 * @throws {Error} Throws error if parsing fails
 * 
 * @example
 * const data = await parseComplianceData("PDF text content...");
 * console.log(data.requirements); // [{ requirement: "...", violation: "...", ... }]
 * console.log(data.retailer); // "Dick's Sporting Goods"
 */
async function parseComplianceData(pdfText) {
  try {
    // Validate input
    if (!pdfText || typeof pdfText !== 'string') {
      throw new Error('Invalid PDF text provided');
    }
    
    // Detect retailer from PDF content
    const detectedRetailer = detectRetailer(pdfText);
    
    // Truncate text to avoid token limits
    const truncatedText = pdfText.substring(0, parserConfig.maxTextLength);
    
    // Generate dynamic prompt based on detected retailer
    const userPrompt = generateDynamicPrompt(detectedRetailer, truncatedText);
    
    console.log(`Sending request to OpenAI for ${detectedRetailer.name} compliance parsing...`);
    
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
      req.violation_code = req.violation_code || null;
      
      return req;
    });
    
    // Validate and structure additional data sections with new comprehensive structure
    const structuredData = {
      retailer: detectedRetailer.name,
      requirements: validatedRequirements,
      order_types: parsedData.order_types || [],
      carton_specs: parsedData.carton_specs || {},
      label_placement: parsedData.label_placement || [],
      timing_requirements: parsedData.timing_requirements || [],
      product_requirements: parsedData.product_requirements || [],
      shipping_requirements: parsedData.shipping_requirements || [],
      documentation_requirements: parsedData.documentation_requirements || []
    };
    
    console.log(`Successfully parsed ${validatedRequirements.length} compliance requirements for ${detectedRetailer.name}`);
    console.log(`Additional data: ${structuredData.order_types.length} order types, ${structuredData.label_placement.length} label rules, ${structuredData.timing_requirements.length} timing requirements, ${structuredData.shipping_requirements.length} shipping requirements, ${structuredData.documentation_requirements.length} documentation requirements`);
    
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
 * Now supports the new comprehensive structure with retailer detection
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
  if (!Array.isArray(data)) {
    // Validate retailer field
    if (!data.retailer || typeof data.retailer !== 'string') {
      throw new Error('Retailer field is required in structured data');
    }
    
    // Validate all array sections
    const arraySections = [
      'order_types', 'label_placement', 'timing_requirements', 
      'product_requirements', 'shipping_requirements', 'documentation_requirements'
    ];
    
    arraySections.forEach(section => {
      if (data[section] && !Array.isArray(data[section])) {
        throw new Error(`${section} must be an array`);
      }
    });
    
    // Validate carton_specs object
    if (data.carton_specs && typeof data.carton_specs !== 'object') {
      throw new Error('carton_specs must be an object');
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
  detectRetailer,
  generateDynamicPrompt,
  retailerConfigs,
  parserConfig
};
