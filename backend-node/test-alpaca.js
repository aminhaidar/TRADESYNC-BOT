require('dotenv').config();
const Alpaca = require('@alpacahq/alpaca-trade-api');

console.log("Testing Alpaca API Connection...");
console.log("APCA_API_KEY_ID:", process.env.APCA_API_KEY_ID ? "✓ Found" : "✗ Missing");
console.log("APCA_API_SECRET_KEY:", process.env.APCA_API_SECRET_KEY ? "✓ Found" : "✗ Missing");

// Initialize Alpaca client
const alpaca = new Alpaca({
  keyId: process.env.APCA_API_KEY_ID || '',
  secretKey: process.env.APCA_API_SECRET_KEY || '',
  paper: true,
  baseUrl: 'https://paper-api.alpaca.markets',
});

async function testConnection() {
  try {
    // Test account info
    console.log("\n1. Testing account info...");
    const account = await alpaca.getAccount();
    console.log("✓ Success! Account connected");
    console.log(`   Account ID: ${account.id}`);
    console.log(`   Cash: $${parseFloat(account.cash).toFixed(2)}`);
    console.log(`   Portfolio Value: $${parseFloat(account.portfolio_value).toFixed(2)}`);
    
    // Test market data
    console.log("\n2. Testing market data...");
    const symbol = 'AAPL';
    const bars = await alpaca.getBars({
      symbol,
      timeframe: '1Min',
      limit: 1
    });
    
    console.log(`✓ Successfully fetched market data for ${symbol}`);
    if (bars[symbol] && bars[symbol].length > 0) {
      console.log(`   Latest price: $${bars[symbol][0].c.toFixed(2)}`);
    }
    
    // Test position fetching
    console.log("\n3. Testing positions...");
    const positions = await alpaca.getPositions();
    console.log(`✓ Successfully fetched ${positions.length} positions`);
    if (positions.length > 0) {
      console.log("   First position:");
      console.log(`   Symbol: ${positions[0].symbol}`);
      console.log(`   Quantity: ${positions[0].qty}`);
      console.log(`   Current Value: $${parseFloat(positions[0].market_value).toFixed(2)}`);
    }
    
    console.log("\n✅ All tests passed! Your Alpaca API connection is working properly");
    
  } catch (error) {
    console.error("\n❌ Error connecting to Alpaca API:", error.message);
    if (error.statusCode) {
      console.error(`   Status code: ${error.statusCode}`);
    }
    console.error("   Please check your API keys and connection settings");
  }
}

testConnection();
