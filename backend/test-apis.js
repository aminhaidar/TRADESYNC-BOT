require('dotenv').config();
const Alpaca = require('@alpacahq/alpaca-trade-api');
const nodeFetch = require('node-fetch');
const https = require('https');

console.log("TradeSync Bot API Test Tool");
console.log("==========================");

// Check OpenAI API
async function testOpenAI() {
  console.log("\nTesting OpenAI API...");
  try {
    // Update the OpenAI key in the environment
    process.env.OPENAI_API_KEY = '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';
    
    // Using https module instead of fetch
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Test connection with a one-word response: success" }
        ],
        max_tokens: 10,
        temperature: 0.3
      });
      
      const options = {
        hostname: 'api.openai.com',
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Length': data.length
        }
      };
      
      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const result = JSON.parse(responseData);
              console.log("✓ OpenAI API working: ", result.choices[0].message.content);
              resolve(true);
            } catch (error) {
              console.error("✗ OpenAI API error (parsing response):", error.message);
              resolve(false);
            }
          } else {
            console.error(`✗ OpenAI API error: Status ${res.statusCode}`);
            console.error(responseData);
            resolve(false);
          }
        });
      });
      
      req.on('error', (error) => {
        console.error("✗ OpenAI API error (request):", error.message);
        resolve(false);
      });
      
      req.write(data);
      req.end();
    });
  } catch (error) {
    console.error("✗ OpenAI API error:", error.message);
    return false;
  }
}

// Check Alpaca API
async function testAlpaca() {
  console.log("\nTesting Alpaca API...");
  try {
    const alpaca = new Alpaca({
      keyId: process.env.APCA_API_KEY_ID,
      secretKey: process.env.APCA_API_SECRET_KEY,
      paper: true,
      baseUrl: process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets',
    });

    const account = await alpaca.getAccount();
    console.log("✓ Alpaca API working");
    console.log(`  Account ID: ${account.id}`);
    console.log(`  Status: ${account.status}`);
    console.log(`  Cash: $${parseFloat(account.cash).toFixed(2)}`);
    console.log(`  Portfolio Value: $${parseFloat(account.portfolio_value).toFixed(2)}`);
    return true;
  } catch (error) {
    console.error("✗ Alpaca API error:", error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log("API Keys Check:");
  console.log(`APCA_API_KEY_ID: ${process.env.APCA_API_KEY_ID ? "Found ✓" : "Missing ✗"}`);
  console.log(`APCA_API_SECRET_KEY: ${process.env.APCA_API_SECRET_KEY ? "Found ✓" : "Missing ✗"}`);
  console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? "Found ✓" : "Missing ✗"}`);
  
  const openaiResult = await testOpenAI();
  const alpacaResult = await testAlpaca();
  
  console.log("\nTest Results Summary:");
  console.log(`OpenAI API: ${openaiResult ? "✓ WORKING" : "✗ NOT WORKING"}`);
  console.log(`Alpaca API: ${alpacaResult ? "✓ WORKING" : "✗ NOT WORKING"}`);
  
  if (openaiResult && alpacaResult) {
    console.log("\n✅ All APIs are working! Your TradeSync Bot is ready to go.");
  } else {
    console.log("\n⚠️ Some APIs are not working. Please check the error messages above.");
  }
}

runTests();
