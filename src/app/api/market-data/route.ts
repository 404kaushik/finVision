import { NextResponse } from 'next/server';

// Define types
type StockQuote = {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Timestamp
};

type StockProfile = {
  name: string;
  logo: string;
  marketCapitalization: number;
  shareOutstanding: number;
  currency: string;
  exchange: string;
  industry: string;
};

export async function GET() {
  const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
  
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
  }
  
  // Popular stock symbols to fetch
  const symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "JPM", "V", "WMT", "DIS", "KO", "PEP"];
  
  try {
    const stockPromises = symbols.map(async (symbol) => {
      const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;
      const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`;
      
      try {
        const [quoteRes, profileRes] = await Promise.all([
          fetch(quoteUrl, { next: { revalidate: 60 } }), // Cache for 60 seconds
          fetch(profileUrl, { next: { revalidate: 3600 } }) // Cache for 1 hour
        ]);
        
        if (!quoteRes.ok || !profileRes.ok) {
          console.error(`Failed to fetch data for ${symbol}`);
          return null;
        }
        
        const quoteData: StockQuote = await quoteRes.json();
        const profileData: StockProfile = await profileRes.json();
        
        // Format market cap (B for billions, T for trillions)
        let marketCap = '';
        if (profileData.marketCapitalization) {
          if (profileData.marketCapitalization >= 1000) {
            marketCap = `${(profileData.marketCapitalization / 1000).toFixed(1)}T`;
          } else {
            marketCap = `${profileData.marketCapitalization.toFixed(1)}B`;
          }
        }
        
        // Format volume (M for millions, B for billions)
        const volume = quoteData.h * profileData.shareOutstanding;
        let volumeFormatted = '';
        if (volume >= 1000000000) {
          volumeFormatted = `${(volume / 1000000000).toFixed(1)}B`;
        } else if (volume >= 1000000) {
          volumeFormatted = `${(volume / 1000000).toFixed(1)}M`;
        } else {
          volumeFormatted = volume.toString();
        }
        
        return {
          symbol,
          companyName: profileData.name || symbol,
          price: quoteData.c || 0,
          change: quoteData.d || 0,
          changePercent: quoteData.dp || 0,
          volume: volumeFormatted,
          marketCap,
          logo: profileData.logo,
          industry: profileData.industry
        };
      } catch (error) {
        console.error(`Error processing ${symbol}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(stockPromises);
    const validResults = results.filter(result => result !== null);
    
    // Also fetch market indices
    const indices = [
      { symbol: "^GSPC", name: "S&P 500" },
      { symbol: "^IXIC", name: "Nasdaq" },
      { symbol: "^DJI", name: "Dow Jones" },
      { symbol: "^RUT", name: "Russell 2000" }
    ];
    
    const indicesPromises = indices.map(async (index) => {
      const url = `https://finnhub.io/api/v1/quote?symbol=${index.symbol}&token=${API_KEY}`;
      
      try {
        const response = await fetch(url, { next: { revalidate: 60 } });
        if (!response.ok) return null;
        
        const data: StockQuote = await response.json();
        return {
          symbol: index.symbol,
          name: index.name,
          price: data.c || 0,
          change: data.d || 0,
          changePercent: data.dp || 0
        };
      } catch (error) {
        console.error(`Error fetching index ${index.symbol}:`, error);
        return null;
      }
    });
    
    const indicesResults = await Promise.all(indicesPromises);
    const validIndices = indicesResults.filter(result => result !== null);
    
    return NextResponse.json({
      stocks: validResults,
      indices: validIndices,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}