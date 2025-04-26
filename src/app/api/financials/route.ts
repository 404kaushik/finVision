import { NextResponse } from 'next/server'

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const company = searchParams.get('company')
  
  if (!company) {
    return NextResponse.json({ error: 'Company parameter is required' }, { status: 400 })
  }
  
  try {
    // First, get the company symbol using the same approach as in the news API
    const symbolData = await getCompanySymbol(company)
    
    if (!symbolData.symbol) {
      return NextResponse.json({ 
        symbol: null,
        companyName: company,
        stockPrices: [],
        ratios: {
          'P/E Ratio': 'N/A',
          'EPS': 'N/A',
          'ROE': 'N/A',
          'Debt to Equity': 'N/A',
          'Dividend Yield': 'N/A',
          'Market Cap': 'N/A'
        },
        financials: {
          'Revenue': 'N/A',
          'Net Income': 'N/A',
          'Total Assets': 'N/A',
          'Total Liabilities': 'N/A',
        },
        marketData: {
          'Current Price': 'N/A',
          'Change': '0',
          'Change %': '0',
          'High (Day)': 'N/A',
          'Low (Day)': 'N/A',
          'Open': 'N/A',
          'Prev Close': 'N/A',
        }
      })
    }
    
    const symbol = symbolData.symbol
    
    // Fetch multiple endpoints in parallel using the free Finnhub API endpoints
    const [quoteResponse, basicFinancialsResponse, companyProfileResponse] = await Promise.all([
      // Current stock price and basic info
      fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`),
      // Basic financials (available in free tier)
      fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`),
      // Company profile for additional info
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`)
    ])
    
    // Process responses
    const quoteData = await quoteResponse.json()
    const basicFinancialsData = await basicFinancialsResponse.json()
    const profileData = await companyProfileResponse.json()
    
    // Fetch historical stock prices for the chart
    const today = new Date()
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(today.getFullYear() - 1)
    
    const fromTimestamp = Math.floor(oneYearAgo.getTime() / 1000)
    const toTimestamp = Math.floor(today.getTime() / 1000)
    
    const stockPricesResponse = await fetch(
      `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${fromTimestamp}&to=${toTimestamp}&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`
    )
    
    const stockPricesData = await stockPricesResponse.json()
    
    // Format the data for the frontend
    const stockPrices = stockPricesData.s === 'ok' ? 
      stockPricesData.t.map((timestamp: number, index: number) => ({
        date: new Date(timestamp * 1000).toISOString(),
        open: stockPricesData.o[index],
        high: stockPricesData.h[index],
        low: stockPricesData.l[index],
        close: stockPricesData.c[index],
        volume: stockPricesData.v[index]
      })) : []
    
    // Extract key financial ratios from the metrics endpoint
    const metrics = basicFinancialsData.metric || {}
    const ratios = {
      'P/E Ratio': metrics.peBasicExclExtraTTM?.toFixed(2) || 'N/A',
      'EPS': metrics.epsBasicExclExtraItemsTTM?.toFixed(2) || 'N/A',
      'ROE': metrics.roeRfy ? (metrics.roeRfy * 100).toFixed(2) + '%' : 'N/A',
      'Debt to Equity': metrics.totalDebtToEquityQuarterly?.toFixed(2) || 'N/A',
      'Dividend Yield': metrics.dividendYieldIndicatedAnnual ? 
        (metrics.dividendYieldIndicatedAnnual * 100).toFixed(2) + '%' : 'N/A',
      'Market Cap': metrics.marketCapitalization ? 
        formatCurrency(metrics.marketCapitalization * 1000000) : 'N/A'
    }
    
    // Create financial data from available metrics
    const financials = {
      'Revenue': metrics.revenuePerShareTTM ? 
        formatCurrency(metrics.revenuePerShareTTM * (profileData.shareOutstanding || 0)) : 'N/A',
      'Net Income': metrics.netIncomePerShareTTM ? 
        formatCurrency(metrics.netIncomePerShareTTM * (profileData.shareOutstanding || 0)) : 'N/A',
      'Total Assets': metrics.totalAssets ? 
        formatCurrency(metrics.totalAssets) : 'N/A',
      'Total Liabilities': metrics.totalDebt ? 
        formatCurrency(metrics.totalDebt) : 'N/A',
    }
    
    // Format market data
    const marketData = {
      'Current Price': formatCurrency(quoteData.c) || 'N/A',
      'Change': quoteData.d?.toFixed(2) || '0',
      'Change %': quoteData.dp?.toFixed(2) + '%' || '0%',
      'High (Day)': formatCurrency(quoteData.h) || 'N/A',
      'Low (Day)': formatCurrency(quoteData.l) || 'N/A',
      'Open': formatCurrency(quoteData.o) || 'N/A',
      'Prev Close': formatCurrency(quoteData.pc) || 'N/A',
    }
    
    // Create industry average data (mock data since this requires premium API access)
    const industryAverage = stockPrices.length > 0 ? 
      stockPrices.map((item: {date: string; close: number}) => ({
        date: item.date,
        value: item.close * (0.85 + Math.random() * 0.3) // Random value around the stock price
      })) : []
    
    return NextResponse.json({
      symbol,
      companyName: symbolData.companyName,
      stockPrices,
      industryAverage,
      ratios,
      financials,
      marketData,
      profile: {
        industry: profileData.finnhubIndustry || 'N/A',
        exchange: profileData.exchange || 'N/A',
        ipo: profileData.ipo || 'N/A',
        logo: profileData.logo || null,
        weburl: profileData.weburl || null
      }
    })
    
  } catch (error) {
    console.error('Error fetching financial data:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch financial data',
      symbol: null,
      companyName: company,
      stockPrices: [],
      ratios: {
        'P/E Ratio': 'N/A',
        'EPS': 'N/A',
        'ROE': 'N/A',
        'Debt to Equity': 'N/A',
        'Dividend Yield': 'N/A',
        'Market Cap': 'N/A'
      },
      financials: {
        'Revenue': 'N/A',
        'Net Income': 'N/A',
        'Total Assets': 'N/A',
        'Total Liabilities': 'N/A',
      },
      marketData: {
        'Current Price': 'N/A',
        'Change': '0',
        'Change %': '0%',
        'High (Day)': 'N/A',
        'Low (Day)': 'N/A',
        'Open': 'N/A',
        'Prev Close': 'N/A',
      }
    }, { status: 500 })
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