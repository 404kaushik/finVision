import { NextResponse } from 'next/server'
import axios from 'axios'

// Helper function to format currency values
function formatCurrency(value: number): string {
  if (!value && value !== 0) return 'N/A'
  
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(value)
}

// Helper function to format percentages
function formatPercentage(value: number): string {
  if (!value && value !== 0) return 'N/A'
  return `${value.toFixed(2)}%`
}

// Generate mock data for free tier limitations
function generateMockData(symbol: string, companyName: string) {
  return {
    symbol,
    companyName,
    stockPrices: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 100 + Math.random() * 50,
      high: 150 + Math.random() * 50,
      low: 50 + Math.random() * 50,
      close: 100 + Math.random() * 50,
      volume: Math.floor(Math.random() * 1000000)
    })),
    ratios: {
      'P/E Ratio': '25.5',
      'EPS': formatCurrency(5.25),
      'ROE': '15.5%',
      'Debt to Equity': '0.8',
      'Dividend Yield': '2.1%',
      'Market Cap': formatCurrency(1000000000000),
      'Profit Margin': '12.5%',
      'Revenue Growth': '8.2%',
      'Operating Margin': '18.3%',
      'Current Ratio': '1.5'
    },
    financials: {
      'Revenue': formatCurrency(50000000000),
      'Net Income': formatCurrency(5000000000),
      'Total Assets': formatCurrency(200000000000),
      'Total Liabilities': formatCurrency(100000000000),
      'Operating Cash Flow': formatCurrency(8000000000),
      'Free Cash Flow': formatCurrency(6000000000)
    },
    marketData: {
      'Current Price': formatCurrency(150),
      'Change': formatCurrency(2.5),
      'Change %': '1.67%',
      'High (Day)': formatCurrency(155),
      'Low (Day)': formatCurrency(145),
      'Open': formatCurrency(148),
      'Prev Close': formatCurrency(147.5),
      'Volume': '1.2M',
      '52 Week High': formatCurrency(200),
      '52 Week Low': formatCurrency(100)
    },
    profile: {
      industry: 'Technology',
      sector: 'Consumer Cyclical',
      exchange: 'NASDAQ',
      ipo: '1997-05-15',
      logo: null,
      weburl: `https://www.${symbol.toLowerCase()}.com`,
      description: `${companyName} is a leading technology company.`
    }
  }
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
const dataCache = new Map<string, { data: any, timestamp: number }>()

export async function GET(request: Request) {
  if (!process.env.NEXT_PUBLIC_FINNHUB_API_KEY) {
    console.error('Finnhub API key is not configured')
    return NextResponse.json({ 
      error: 'API configuration error',
      details: 'Finnhub API key is not configured'
    }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const company = searchParams.get('company')
  
  if (!company) {
    return NextResponse.json({ error: 'Company parameter is required' }, { status: 400 })
  }
  
  try {
    // Get company symbol
    const symbolData = await getCompanySymbol(company)
    if (!symbolData.symbol) {
      console.error('Company symbol not found:', company)
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    
    const symbol = symbolData.symbol
    
    try {
      // Try to fetch real data first
      const quoteResponse = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`
      )
      
      if (quoteResponse.data) {
        const mockData = generateMockData(symbol, symbolData.companyName)
        const formattedData = {
          ...mockData,
          marketData: {
            'Current Price': formatCurrency(quoteResponse.data.c),
            'Change': formatCurrency(quoteResponse.data.d),
            'Change %': formatPercentage(quoteResponse.data.dp),
            'High (Day)': formatCurrency(quoteResponse.data.h),
            'Low (Day)': formatCurrency(quoteResponse.data.l),
            'Open': formatCurrency(quoteResponse.data.o),
            'Prev Close': formatCurrency(quoteResponse.data.pc),
            'Volume': new Intl.NumberFormat('en-US').format(quoteResponse.data.v),
            '52 Week High': formatCurrency(quoteResponse.data.h52),
            '52 Week Low': formatCurrency(quoteResponse.data.l52)
          }
        }
        
        return NextResponse.json(formattedData)
      }
    } catch (error) {
      console.log('Using mock data due to API limitations')
    }
    
    // If we can't get real data, return mock data
    const mockData = generateMockData(symbol, symbolData.companyName)
    return NextResponse.json({
      ...mockData,
      isMockData: true,
      message: 'Using mock data due to API limitations'
    })
    
  } catch (error: any) {
    console.error('Error in financial data fetch:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch financial data',
      details: 'Using mock data due to API limitations',
      isMockData: true,
      ...generateMockData('UNKNOWN', company)
    }, { status: 200 })
  }
}

// Helper function to get company symbol (reused from news API)
async function getCompanySymbol(companyName: string): Promise<{symbol: string | null, companyName: string}> {
  const mockSymbols: Record<string, {symbol: string, fullName: string}> = {
    'apple': {symbol: 'AAPL', fullName: 'Apple Inc.'},
    'microsoft': {symbol: 'MSFT', fullName: 'Microsoft Corporation'},
    'google': {symbol: 'GOOGL', fullName: 'Alphabet Inc.'},
    'alphabet': {symbol: 'GOOGL', fullName: 'Alphabet Inc.'},
    'amazon': {symbol: 'AMZN', fullName: 'Amazon.com Inc.'},
    'tesla': {symbol: 'TSLA', fullName: 'Tesla, Inc.'},
    'facebook': {symbol: 'META', fullName: 'Meta Platforms, Inc.'},
    'meta': {symbol: 'META', fullName: 'Meta Platforms, Inc.'},
    'netflix': {symbol: 'NFLX', fullName: 'Netflix, Inc.'},
    'nvidia': {symbol: 'NVDA', fullName: 'NVIDIA Corporation'},
    'amd': {symbol: 'AMD', fullName: 'Advanced Micro Devices, Inc.'},
    'intel': {symbol: 'INTC', fullName: 'Intel Corporation'},
    'ibm': {symbol: 'IBM', fullName: 'International Business Machines Corporation'},
    'oracle': {symbol: 'ORCL', fullName: 'Oracle Corporation'},
    'salesforce': {symbol: 'CRM', fullName: 'Salesforce, Inc.'},
    'adobe': {symbol: 'ADBE', fullName: 'Adobe Inc.'},
    'paypal': {symbol: 'PYPL', fullName: 'PayPal Holdings, Inc.'},
    'disney': {symbol: 'DIS', fullName: 'The Walt Disney Company'},
    'walmart': {symbol: 'WMT', fullName: 'Walmart Inc.'},
    'coca-cola': {symbol: 'KO', fullName: 'The Coca-Cola Company'},
    'coke': {symbol: 'KO', fullName: 'The Coca-Cola Company'},
    'pepsi': {symbol: 'PEP', fullName: 'PepsiCo, Inc.'},
    'pepsico': {symbol: 'PEP', fullName: 'PepsiCo, Inc.'},
    'johnson': {symbol: 'JNJ', fullName: 'Johnson & Johnson'},
    'jpmorgan': {symbol: 'JPM', fullName: 'JPMorgan Chase & Co.'},
    'visa': {symbol: 'V', fullName: 'Visa Inc.'},
    'mastercard': {symbol: 'MA', fullName: 'Mastercard Incorporated'},
  }
  
  const normalizedName = companyName.toLowerCase()
  
  // Try exact match
  if (mockSymbols[normalizedName]) {
    return {
      symbol: mockSymbols[normalizedName].symbol,
      companyName: mockSymbols[normalizedName].fullName
    }
  }
  
  // Try partial match
  for (const [company, data] of Object.entries(mockSymbols)) {
    if (normalizedName.includes(company) || company.includes(normalizedName)) {
      return {
        symbol: data.symbol,
        companyName: data.fullName
      }
    }
  }
  
  // If no match found, try to use the input as a symbol directly
  if (/^[A-Z]{1,5}$/.test(companyName.toUpperCase())) {
    return {
      symbol: companyName.toUpperCase(),
      companyName: companyName.toUpperCase()
    }
  }
  
  // If still no match, try to search using Finnhub API
  try {
    const response = await fetch(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(companyName)}&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`)
    
    if (response.ok) {
      const data = await response.json()
      if (data.result && data.result.length > 0) {
        return {
          symbol: data.result[0].symbol,
          companyName: data.result[0].description || companyName
        }
      }
    }
  } catch (error) {
    console.error('Error searching for symbol:', error)
  }
  
  // If still no match, return null
  return {
    symbol: null,
    companyName: companyName
  }
}