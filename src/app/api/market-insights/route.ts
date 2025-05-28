import { NextResponse } from 'next/server';

// Using polygon.io API for market data
// You'll need to sign up for a free API key at https://polygon.io/
const API_KEY = process.env.POLYGON_API_KEY || 'f4lUUVFMRylpg8iL5cHuf6pH_yZz2fRY';

export async function GET() {
  try {
    // Fetch market indices
    const indicesResponse = await fetch(
      `https://api.polygon.io/v2/snapshot/locale/us/markets/indices/tickers?apiKey=${API_KEY}`
    );
    
    if (!indicesResponse.ok) {
      throw new Error('Failed to fetch indices data');
    }
    
    const indicesData = await indicesResponse.json();
    
    const indices = indicesData.tickers
      .filter((ticker: any) => ['^SPX', '^DJI', '^IXIC', '^RUT'].includes(ticker.ticker))
      .map((ticker: any) => ({
        symbol: ticker.ticker.replace('^', ''),
        name: getIndexName(ticker.ticker),
        price: ticker.day.c,
        change: ticker.day.c - ticker.prevDay.c,
        changePercent: ((ticker.day.c - ticker.prevDay.c) / ticker.prevDay.c) * 100,
      }));
    
    // Fetch most active stocks
    const stocksResponse = await fetch(
      `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?apiKey=${API_KEY}`
    );
    
    if (!stocksResponse.ok) {
      throw new Error('Failed to fetch stocks data');
    }
    
    const stocksData = await stocksResponse.json();
    
    // Get top stocks by volume
    const stocks = stocksData.tickers
      .sort((a: any, b: any) => b.day.v - a.day.v)
      .slice(0, 20)
      .map((ticker: any) => ({
        symbol: ticker.ticker,
        companyName: ticker.ticker, // We'd need another API call for company names
        price: ticker.day.c,
        change: ticker.day.c - ticker.prevDay.c,
        changePercent: ((ticker.day.c - ticker.prevDay.c) / ticker.prevDay.c) * 100,
        volume: formatVolume(ticker.day.v),
        marketCap: formatMarketCap(ticker.day.c * ticker.day.v), // This is just an approximation
        industry: getIndustry(ticker.ticker), // We'd need another data source for industries
      }));
    
    // Fetch sector performance (this would need a premium API or alternate data source)
    // For now, generating based on stocks data
    const sectors = generateSectorData(stocks);
    
    // Generate market trends
    const trends = generateMarketTrends(stocks, indices);
    
    return NextResponse.json({
      indices,
      stocks,
      sectors,
      trends
    });
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}

// Helper functions
function getIndexName(ticker: string): string {
  const names: Record<string, string> = {
    '^SPX': 'S&P 500',
    '^DJI': 'Dow Jones',
    '^IXIC': 'NASDAQ',
    '^RUT': 'Russell 2000'
  };
  return names[ticker] || ticker;
}

function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return (volume / 1_000_000_000).toFixed(1) + 'B';
  }
  if (volume >= 1_000_000) {
    return (volume / 1_000_000).toFixed(1) + 'M';
  }
  if (volume >= 1_000) {
    return (volume / 1_000).toFixed(1) + 'K';
  }
  return volume.toString();
}

function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1_000_000_000_000) {
    return (marketCap / 1_000_000_000_000).toFixed(1) + 'T';
  }
  if (marketCap >= 1_000_000_000) {
    return (marketCap / 1_000_000_000).toFixed(1) + 'B';
  }
  if (marketCap >= 1_000_000) {
    return (marketCap / 1_000_000).toFixed(1) + 'M';
  }
  return marketCap.toString();
}

// Simplified industry mapping - in a real app, you'd use a more comprehensive database
function getIndustry(ticker: string): string {
  const industries: Record<string, string> = {
    'AAPL': 'Technology',
    'MSFT': 'Technology',
    'AMZN': 'Consumer Cyclical',
    'GOOGL': 'Technology',
    'META': 'Technology',
    'TSLA': 'Automotive',
    'NVDA': 'Technology',
    'JPM': 'Financial Services',
  };
  return industries[ticker] || 'Other';
}

// Generate sector data based on stock performance
function generateSectorData(stocks: any[]) {
  const sectorMap: Record<string, { count: number, totalChange: number }> = {};
  
  // Calculate average change by sector
  stocks.forEach(stock => {
    if (!sectorMap[stock.industry]) {
      sectorMap[stock.industry] = { count: 0, totalChange: 0 };
    }
    sectorMap[stock.industry].count += 1;
    sectorMap[stock.industry].totalChange += stock.changePercent;
  });
  
  // Convert to array format needed by the UI
  return Object.entries(sectorMap)
    .map(([sector, data]) => ({
      name: sector,
      changePercent: data.totalChange / data.count,
    }))
    .filter(sector => sector.name !== 'Other')
    .sort((a, b) => b.changePercent - a.changePercent);
}

// Generate market trends based on stock and index data
function generateMarketTrends(stocks: any[], indices: any[]) {
  const trends = [];
  
  // Calculate overall market trend
  const spxIndex = indices.find(index => index.symbol === 'SPX');
  if (spxIndex) {
    const trend = {
      trend: spxIndex.changePercent > 0 
        ? 'Markets trending higher' 
        : 'Markets trending lower',
      description: `with the S&P 500 ${spxIndex.changePercent > 0 ? 'up' : 'down'} ${Math.abs(spxIndex.changePercent).toFixed(2)}% today.`,
      icon: spxIndex.changePercent > 0 ? 'up' : 'down'
    };
    trends.push(trend);
  }
  
  // Find top performing sector
  const topSectors = generateSectorData(stocks).slice(0, 1);
  if (topSectors.length > 0 && topSectors[0].changePercent > 0) {
    trends.push({
      trend: `${topSectors[0].name} sector leads gains`,
      description: `showing strength with average gains of ${topSectors[0].changePercent.toFixed(2)}% today.`,
      icon: 'up'
    });
  }
  
  // Find bottom performing sector
  const bottomSectors = generateSectorData(stocks).slice(-1);
  if (bottomSectors.length > 0 && bottomSectors[0].changePercent < 0) {
    trends.push({
      trend: `${bottomSectors[0].name} sector under pressure`,
      description: `with average declines of ${Math.abs(bottomSectors[0].changePercent).toFixed(2)}% today.`,
      icon: 'down'
    });
  }
  
  // Add a generic trend based on market volatility
  const volatility = calculateVolatility(stocks);
  if (volatility > 2) {
    trends.push({
      trend: 'Market volatility elevated',
      description: 'with larger than average price swings across major stocks today.',
      icon: 'info'
    });
  } else {
    trends.push({
      trend: 'Trading activity',
      description: 'remains within normal ranges with moderate volume across major exchanges.',
      icon: 'money'
    });
  }
  
  return trends;
}

// Simple volatility calculation
function calculateVolatility(stocks: any[]): number {
  const changes = stocks.map(stock => Math.abs(stock.changePercent));
  return changes.reduce((sum, change) => sum + change, 0) / changes.length;
}