const { parseComplianceData } = require('./services/parserService');
const fs = require('fs');
const pdfParse = require('pdf-parse');

async function testParser() {
  try {
    console.log('Reading PDF...');
    const pdfBuffer = fs.readFileSync('../assets/Dicks Routing Guide (1).pdf');
    const pdfData = await pdfParse(pdfBuffer);
    console.log('PDF text length:', pdfData.text.length);
    
    console.log('Parsing with AI...');
    const result = await parseComplianceData(pdfData.text);
    
    console.log('\n=== PARSER RESULT ===');
    console.log('Result type:', typeof result);
    console.log('Result keys:', Object.keys(result));
    console.log('Detected retailer:', result.retailer || 'Unknown');
    console.log('Requirements count:', result.requirements?.length || 0);
    console.log('Order types count:', result.order_types?.length || 0);
    console.log('Carton specs keys:', Object.keys(result.carton_specs || {}));
    console.log('Label placement count:', result.label_placement?.length || 0);
    console.log('Timing requirements count:', result.timing_requirements?.length || 0);
    console.log('Product requirements count:', result.product_requirements?.length || 0);
    console.log('Shipping requirements count:', result.shipping_requirements?.length || 0);
    console.log('Documentation requirements count:', result.documentation_requirements?.length || 0);
    
    if (result.order_types?.length > 0) {
      console.log('\n=== ORDER TYPES ===');
      result.order_types.forEach((ot, i) => {
        console.log(`${i + 1}. ${ot.type}: ${ot.description}`);
      });
    }
    
    if (result.carton_specs?.conveyable) {
      console.log('\n=== CARTON SPECS ===');
      console.log('Conveyable specs:', result.carton_specs.conveyable);
    }
    
    if (result.label_placement?.length > 0) {
      console.log('\n=== LABEL PLACEMENT ===');
      result.label_placement.forEach((lp, i) => {
        console.log(`${i + 1}. ${lp.requirement}: ${lp.standard_position}`);
      });
    }
    
    if (result.timing_requirements?.length > 0) {
      console.log('\n=== TIMING REQUIREMENTS ===');
      result.timing_requirements.forEach((tr, i) => {
        console.log(`${i + 1}. ${tr.requirement}: ${tr.deadline}`);
      });
    }
    
    if (result.product_requirements?.length > 0) {
      console.log('\n=== PRODUCT REQUIREMENTS ===');
      result.product_requirements.forEach((pr, i) => {
        console.log(`${i + 1}. ${pr.category}: ${pr.requirements.length} requirements`);
      });
    }
    
    if (result.shipping_requirements?.length > 0) {
      console.log('\n=== SHIPPING REQUIREMENTS ===');
      result.shipping_requirements.forEach((sr, i) => {
        console.log(`${i + 1}. ${sr.requirement}: ${sr.carrier || 'N/A'}`);
      });
    }
    
    if (result.documentation_requirements?.length > 0) {
      console.log('\n=== DOCUMENTATION REQUIREMENTS ===');
      result.documentation_requirements.forEach((dr, i) => {
        console.log(`${i + 1}. ${dr.requirement}: EDI=${!!dr.edi_requirements}, ASN=${!!dr.asn_requirements}`);
      });
    }
    
    console.log('\n=== FULL RESULT ===');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testParser();
