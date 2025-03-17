const fetch = require('node-fetch');

// Get OpenAI API key from environment variable
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

async function analyzePost(post) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set in environment variables');
  }

  try {
    const content = post.content;
    const source = post.source;

    const systemPrompt = `You are a financial market analysis AI for a trading platform. Your job is to analyze social media posts and extract actionable trading insights. 
    
    For stock-related content, identify:
    1. Mentioned stock symbols/tickers
    2. Sentiment (bullish/bearish/neutral)
    3. Key points about the company or sector
    4. Any specific option trade details mentioned (calls/puts, strike prices, expiration dates)
    5. Confidence level based on the information quality (0.0-1.0 scale)
    
    Provide your analysis as structured JSON with insights array. Each insight should include:
    - symbol: the stock ticker
    - recommendation: "Buy", "Sell", or "Hold"
    - summary: a brief explanation of the insight
    - confidence: a number between 0 and 1
    - category: "technical", "fundamental", "news", "sector", or "actionable"
    - option_details: optional string with option details (format: "155C 04/17" for $155 Call expiring April 17th)
    - source: the platform where this was found (twitter, discord, etc.)
    
    Only include insights with sufficient information. If a post doesn't have any actionable trading information, return an empty insights array.`;

    const userPrompt = `Analyze this ${source} post for potential trading insights:
    "${content}"`;

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const result = await response.json();
    try {
      // Parse the response content as JSON
      const analysisResult = JSON.parse(result.choices[0].message.content);
      
      // Ensure the insights include source information
      if (analysisResult.insights) {
        analysisResult.insights = analysisResult.insights.map(insight => ({
          ...insight,
          source: insight.source || source,
          timestamp: new Date().toISOString()
        }));
      }
      
      return analysisResult;
    } catch (parseError) {
      console.error('Error parsing AI response as JSON:', parseError);
      throw new Error('Failed to parse AI analysis result');
    }
  } catch (error) {
    console.error('Error in AI analysis:', error);
    throw error;
  }
}

module.exports = { analyzePost };
