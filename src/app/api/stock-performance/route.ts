import { NextRequest, NextResponse } from 'next/server';

// Environment variables
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

// Rate limiting for Perplexity (they allow higher rates than Alpha Vantage)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const company = searchParams.get('company');
    const savedDate = searchParams.get('savedDate');

    if (!company || !savedDate) {
      return NextResponse.json(
        { error: 'Company name and saved date are required' },
        { status: 400 }
      );
    }

    if (!PERPLEXITY_API_KEY) {
      return NextResponse.json(
        { error: 'Perplexity API key not configured' },
        { status: 500 }
      );
    }

    // Validate saved date
    const savedDateObj = new Date(savedDate);
    if (isNaN(savedDateObj.getTime())) {
      return NextResponse.json(
        { error: 'Invalid saved date format' },
        { status: 400 }
      );
    }

    // Get stock performance data and explanation from Perplexity
    const stockAnalysis = await getStockPerformanceFromPerplexity(company, savedDate);
    
    if (!stockAnalysis) {
      return NextResponse.json(
        { error: 'Failed to fetch stock performance data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      company,
      symbol: stockAnalysis.symbol,
      savedDate: savedDate,
      currentDate: new Date().toISOString().split('T')[0],
      savedPrice: stockAnalysis.savedPrice,
      currentPrice: stockAnalysis.currentPrice,
      percentChange: stockAnalysis.percentChange,
      explanation: stockAnalysis.explanation,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in stock performance API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock performance data' },
      { status: 500 }
    );
  }
}

async function getStockPerformanceFromPerplexity(company: string, savedDate: string) {
  try {
    const prompt = `
You are a finance analyst. Please provide the following information for ${company} stock:

1. Current stock symbol
2. Stock price on ${savedDate} (or closest trading day)
3. Current stock price (latest available)
4. Percentage change from ${savedDate} to current price, use correct formula for stock price changes (if you are not sure use the latest available prices to compare)
5. Brief explanation in simple terms of what caused this price change

Format your response as JSON with these exact keys:
{
  "symbol": "STOCK_SYMBOL",
  "savedPrice": 123.45,
  "currentPrice": 134.56,
  "percentChange": 8.99,
  "explanation": "Brief explanation of the price movement"
}

Please ensure all prices are numbers and percentage change is calculated as ((current - saved) / saved) * 100. Keep information as accurate to real time data as possible.
Only return the JSON, no other text.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { 
            role: 'system', 
            content: 'You are a financial data analyst. Always respond with valid JSON only. Ensure all stock prices are accurate and up-to-date. Calculate percentage changes precisely.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    
    if (!content) {
      console.error('No content received from Perplexity');
      return null;
    }

    // Parse the JSON response
    try {
      // Clean the response in case there's extra text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      
      const stockData = JSON.parse(jsonStr);
      
      // Validate the response has required fields
      if (!stockData.symbol || 
          typeof stockData.savedPrice !== 'number' || 
          typeof stockData.currentPrice !== 'number' || 
          typeof stockData.percentChange !== 'number' ||
          !stockData.explanation) {
        console.error('Invalid stock data structure:', stockData);
        return null;
      }

      // Recalculate percentage to ensure accuracy
      const calculatedPercentChange = ((stockData.currentPrice - stockData.savedPrice) / stockData.savedPrice) * 100;
      stockData.percentChange = parseFloat(calculatedPercentChange.toFixed(2));

      return stockData;
    } catch (parseError) {
      console.error('Error parsing Perplexity response:', parseError);
      console.error('Raw content:', content);
      
      // Fallback: try to extract data using regex if JSON parsing fails
      return extractDataFromText(content, company);
    }
  } catch (error) {
    console.error('Error getting stock performance from Perplexity:', error);
    return null;
  }
}

function extractDataFromText(content: string, company: string) {
  try {
    // Try to extract data using regex patterns
    const symbolMatch = content.match(/symbol["\s:]+([A-Z]{1,5})/i);
    const savedPriceMatch = content.match(/saved[^0-9]*([0-9.]+)/i);
    const currentPriceMatch = content.match(/current[^0-9]*([0-9.]+)/i);
    const percentMatch = content.match(/percent[^0-9-]*(-?[0-9.]+)/i);
    
    if (!symbolMatch || !savedPriceMatch || !currentPriceMatch) {
      return null;
    }

    const symbol = symbolMatch[1];
    const savedPrice = parseFloat(savedPriceMatch[1]);
    const currentPrice = parseFloat(currentPriceMatch[1]);
    const percentChange = percentMatch ? parseFloat(percentMatch[1]) : 
                         ((currentPrice - savedPrice) / savedPrice) * 100;

    // Extract explanation (usually the longest sentence)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const explanation = sentences.reduce((longest, current) => 
      current.length > longest.length ? current : longest, ''
    ).trim();

    return {
      symbol,
      savedPrice,
      currentPrice,
      percentChange: parseFloat(percentChange.toFixed(2)),
      explanation: explanation || `${company} stock performance has been tracked since the saved date.`
    };
  } catch (error) {
    console.error('Error extracting data from text:', error);
    return null;
  }
}

// Batch processing function for multiple companies
export async function POST(request: NextRequest) {
  try {
    const { companies } = await request.json();
    
    if (!Array.isArray(companies) || companies.length === 0) {
      return NextResponse.json(
        { error: 'Companies array is required' },
        { status: 400 }
      );
    }

    if (!PERPLEXITY_API_KEY) {
      return NextResponse.json(
        { error: 'Perplexity API key not configured' },
        { status: 500 }
      );
    }

    const results = [];
    
    // Process companies with small delays to avoid rate limiting
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      
      try {
        const stockAnalysis = await getStockPerformanceFromPerplexity(
          company.name, 
          company.savedDate
        );
        
        if (stockAnalysis) {
          results.push({
            company: company.name,
            symbol: stockAnalysis.symbol,
            savedDate: company.savedDate,
            currentDate: new Date().toISOString().split('T')[0],
            savedPrice: stockAnalysis.savedPrice,
            currentPrice: stockAnalysis.currentPrice,
            percentChange: stockAnalysis.percentChange,
            explanation: stockAnalysis.explanation,
            lastUpdated: new Date().toISOString(),
            success: true
          });
        } else {
          results.push({
            company: company.name,
            error: 'Failed to fetch stock data',
            success: false
          });
        }
        
        // Add delay between requests to avoid rate limiting
        if (i < companies.length - 1) {
          await delay(2000); // 2 second delay between requests
        }
      } catch (error) {
        console.error(`Error processing ${company.name}:`, error);
        results.push({
          company: company.name,
          error: 'Processing failed',
          success: false
        });
      }
    }

    return NextResponse.json({
      results,
      totalProcessed: companies.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });
  } catch (error) {
    console.error('Error in batch stock performance API:', error);
    return NextResponse.json(
      { error: 'Failed to process stock performance data' },
      { status: 500 }
    );
  }
}