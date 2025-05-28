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

// Helper function to format date to YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Helper function to get historical data from Polygon
async function getHistoricalData(symbol: string) {
  try {
    // Get date 30 days ago
    const toDate = new Date()
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - 30)
    
    const from = formatDate(fromDate)
    const to = formatDate(toDate)

    console.log(`Fetching historical data for ${symbol} from ${from} to ${to}`)

    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}`
    const params = {
      adjusted: 'true',
      sort: 'asc',
      apikey: process.env.NEXT_PUBLIC_POLYGON_API_KEY
    }

    const response = await axios.get(url, { params })

    console.log(`Historical data response status for ${symbol}:`, response.data?.status)
    console.log(`Historical data count for ${symbol}:`, response.data?.resultsCount)

    if (!response.data) {
      throw new Error(`No response data received for ${symbol}`)
    }

    if (response.data.status === 'ERROR') {
      throw new Error(`API error for ${symbol}: ${response.data.error || 'Unknown error'}`)
    }

    if (response.data.status === 'OK' && (!response.data.results || response.data.results.length === 0)) {
      console.warn(`No historical data available for ${symbol} in the specified date range`)
      return []
    }

    if (!response.data.results) {
      return []
    }

    return response.data.results.map((item: any) => ({
      date: new Date(item.t).toISOString().split('T')[0],
      timestamp: item.t,
      open: item.o,
      high: item.h,
      low: item.l,
      close: item.c,
      volume: item.v,
      volumeWeighted: item.vw || null,
      transactions: item.n || null
    }))
  } catch (error: any) {
    console.error(`Error fetching historical data for ${symbol}:`, error.message)
    throw new Error(`Failed to fetch historical data: ${error.message}`)
  }
}

// Helper function to get company details from Polygon
async function getCompanyProfile(symbol: string) {
  try {
    const url = `https://api.polygon.io/v3/reference/tickers/${symbol}`
    const params = {
      apikey: process.env.NEXT_PUBLIC_POLYGON_API_KEY
    }

    const response = await axios.get(url, { params })
    
    if (!response.data || response.data.status !== 'OK') {
      throw new Error(`Company profile not available for ${symbol}`)
    }
    
    return response.data.results
  } catch (error: any) {
    console.error(`Error fetching company profile for ${symbol}:`, error.message)
    throw error
  }
}

// Helper function to get financials from Polygon
async function getFinancials(symbol: string) {
  try {
    const url = `https://api.polygon.io/vX/reference/financials`
    const params = {
      ticker: symbol,
      limit: 4, // Get last 4 quarters for better analysis
      'timeframe.gte': '2023-01-01', // Get recent data
      apikey: process.env.NEXT_PUBLIC_POLYGON_API_KEY
    }

    const response = await axios.get(url, { params })
    
    if (!response.data || response.data.status !== 'OK' || !response.data.results || response.data.results.length === 0) {
      throw new Error(`Financial data not available for ${symbol}`)
    }
    
    return response.data.results
  } catch (error: any) {
    console.error(`Error fetching financials for ${symbol}:`, error.message)
    throw error
  }
}

// Helper function to get previous close data
async function getPreviousClose(symbol: string) {
  try {
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev`
    const params = {
      adjusted: 'true',
      apikey: process.env.NEXT_PUBLIC_POLYGON_API_KEY
    }

    const response = await axios.get(url, { params })
    
    if (!response.data || response.data.status !== 'OK' || !response.data.results || response.data.results.length === 0) {
      throw new Error(`Previous close data not available for ${symbol}`)
    }
    
    return response.data.results[0]
  } catch (error: any) {
    console.error(`Error fetching previous close for ${symbol}:`, error.message)
    throw error
  }
}

// Helper function to get real-time quote from Finnhub
async function getFinnhubQuote(symbol: string) {
  try {
    const url = `https://finnhub.io/api/v1/quote`
    const params = {
      symbol: symbol,
      token: process.env.NEXT_PUBLIC_FINNHUB_API_KEY
    }

    const response = await axios.get(url, { params })
    
    if (response.data && response.data.c) {
      return {
        currentPrice: response.data.c,    // Current price
        change: response.data.d,          // Change
        changePercent: response.data.dp,  // Percent change
        high: response.data.h,            // High price of the day
        low: response.data.l,             // Low price of the day
        open: response.data.o,            // Open price of the day
        previousClose: response.data.pc,  // Previous close price
        timestamp: response.data.t,       // Timestamp
        isRealTime: true
      }
    }
    
    throw new Error('Invalid response from Finnhub')
  } catch (error: any) {
    console.error(`Error fetching Finnhub quote for ${symbol}:`, error.message)
    throw error
  }
}

// Helper function to get current/real-time price with Finnhub fallback
async function getCurrentPrice(symbol: string) {
  // First try Finnhub for real-time data with change calculations
  if (process.env.NEXT_PUBLIC_FINNHUB_API_KEY) {
    try {
      const finnhubData = await getFinnhubQuote(symbol)
      console.log(`Got real-time data from Finnhub for ${symbol}:`, {
        price: finnhubData.currentPrice,
        change: finnhubData.change,
        changePercent: finnhubData.changePercent        
      })
      return finnhubData
    } catch (error) {
      console.warn(`Finnhub failed for ${symbol}, falling back to Polygon`)
    }
  }

  // Fallback to Polygon data
  try {
    // Try to get real-time last trade from Polygon
    const url = `https://api.polygon.io/v2/last/trade/${symbol}`
    const params = {
      apikey: process.env.NEXT_PUBLIC_POLYGON_API_KEY
    }

    const response = await axios.get(url, { params })
    
    if (response.data && response.data.status === 'OK' && response.data.results) {
      // Get previous close for change calculation
      const prevClose = await getPreviousClose(symbol)
      const currentPrice = response.data.results.p
      const change = currentPrice - prevClose.c
      const changePercent = prevClose.c !== 0 ? (change / prevClose.c) * 100 : 0
      
      return {
        currentPrice: currentPrice,
        change: change,
        changePercent: changePercent,
        high: prevClose.h,
        low: prevClose.l,
        open: prevClose.o,
        previousClose: prevClose.c,
        timestamp: response.data.results.t,
        isRealTime: true
      }
    }
  } catch (error) {
    console.warn(`Could not get real-time price from Polygon for ${symbol}`)
  }
  
  // Final fallback to previous close only
  try {
    const prevClose = await getPreviousClose(symbol)
    return {
      currentPrice: prevClose.c,
      change: 0,
      changePercent: 0,
      high: prevClose.h,
      low: prevClose.l,
      open: prevClose.o,
      previousClose: prevClose.c,
      timestamp: prevClose.t,
      isRealTime: false
    }
  } catch (error) {
    throw new Error(`Could not get any price data for ${symbol}`)
  }
}

// Helper function to get market status
async function getMarketStatus() {
  try {
    const url = `https://api.polygon.io/v1/marketstatus/now`
    const params = {
      apikey: process.env.NEXT_PUBLIC_POLYGON_API_KEY
    }

    const response = await axios.get(url, { params })
    
    if (response.data && response.data.market) {
      return response.data
    }
    
    return null
  } catch (error) {
    console.warn('Could not get market status')
    return null
  }
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
const dataCache = new Map<string, { data: any, timestamp: number }>()

export async function GET(request: Request) {
  if (!process.env.NEXT_PUBLIC_POLYGON_API_KEY) {
    console.error('Polygon API key is not configured')
    return NextResponse.json({ 
      error: 'API configuration error',
      details: 'Polygon API key is not configured'
    }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const company = searchParams.get('company')
  
  if (!company) {
    return NextResponse.json({ error: 'Company parameter is required' }, { status: 400 })
  }
  
  try {
    // Check cache first
    const cacheKey = company.toLowerCase()
    const cachedData = dataCache.get(cacheKey)
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log(`Returning cached data for ${company}`)
      return NextResponse.json(cachedData.data)
    }
    
    // Get company symbol
    const symbolData = await getCompanySymbol(company)
    if (!symbolData.symbol) {
      console.error('Company symbol not found:', company)
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }
    
    const symbol = symbolData.symbol
    console.log(`Processing request for company: ${company}, symbol: ${symbol}`)
    
    // Get market status first
    const marketStatus = await getMarketStatus()
    
    // Get current price with change data (from Finnhub or Polygon)
    const priceData = await getCurrentPrice(symbol)
    
    console.log(`Price data for ${symbol}:`, {
      price: priceData.currentPrice,
      change: priceData.change,
      changePercent: priceData.changePercent,
      isRealTime: priceData.isRealTime
    })
    
    // Fetch remaining data in parallel - handle errors individually
    const results = await Promise.allSettled([
      getHistoricalData(symbol),
      getCompanyProfile(symbol),
      getFinancials(symbol)
    ])
    
    // Handle results
    let historicalData: any[] = []
    let companyProfile: any = {}
    let financials: any[] = []
    
    // Handle historical data result
    if (results[0].status === 'fulfilled') {
      historicalData = results[0].value
      console.log(`Historical data points for ${symbol}: ${historicalData.length}`)
    } else {
      console.error('Historical data error:', results[0].reason.message)
    }
    
    // Handle company profile result
    if (results[1].status === 'fulfilled') {
      companyProfile = results[1].value
    } else {
      console.error('Company profile error:', results[1].reason.message)
      companyProfile = { name: symbolData.companyName }
    }
    
    // Handle financials result
    if (results[2].status === 'fulfilled') {
      financials = results[2].value
    } else {
      console.error('Financials error:', results[2].reason.message)
      financials = []
    }
    
    // Get the latest financial data (most recent quarter)
    const latestFinancials = financials.length > 0 ? financials[0] : {}
    const income_statement = latestFinancials.financials?.income_statement || {}
    const balance_sheet = latestFinancials.financials?.balance_sheet || {}
    const cash_flow_statement = latestFinancials.financials?.cash_flow_statement || {}
    
    // Extract financial metrics
    const revenue = income_statement.revenues?.value || 0
    const netIncome = income_statement.net_income_loss?.value || 0
    const totalAssets = balance_sheet.assets?.value || 0
    const totalLiabilities = balance_sheet.liabilities?.value || 0
    const equity = balance_sheet.equity?.value || 0
    const operatingCashFlow = cash_flow_statement.net_cash_flow_from_operating_activities?.value || 0
    const capex = cash_flow_statement.net_cash_flow_from_investing_activities?.value || 0
    
    // Calculate market cap and other metrics
    const sharesOutstanding = companyProfile.share_class_shares_outstanding || companyProfile.weighted_shares_outstanding || 0
    const marketCap = priceData.currentPrice * sharesOutstanding
    
    // Calculate additional metrics
    const eps = sharesOutstanding && netIncome ? netIncome / sharesOutstanding : 0
    const peRatio = eps && eps !== 0 ? priceData.currentPrice / eps : 0
    const freeCashFlow = operatingCashFlow - Math.abs(capex)
    
    // Format the response data
    const formattedData = {
      symbol,
      companyName: companyProfile.name || symbolData.companyName,
      lastUpdated: new Date().toISOString(),
      marketStatus: marketStatus,
      stockPrices: historicalData,
      ratios: {
        'P/E Ratio': peRatio > 0 ? peRatio.toFixed(2) : 'N/A',
        'EPS': eps ? formatCurrency(eps) : 'N/A',
        'ROE': equity && netIncome && equity !== 0 ? formatPercentage((netIncome / equity) * 100) : 'N/A',
        'Debt to Equity': totalLiabilities && equity && equity !== 0 ? (totalLiabilities / equity).toFixed(2) : 'N/A',
        'Market Cap': marketCap ? formatCurrency(marketCap) : 'N/A',
        'Profit Margin': revenue && netIncome && revenue !== 0 ? formatPercentage((netIncome / revenue) * 100) : 'N/A',
        'Book Value per Share': equity && sharesOutstanding && sharesOutstanding !== 0 ? formatCurrency(equity / sharesOutstanding) : 'N/A',
        'Price to Book': equity && sharesOutstanding && equity !== 0 ? (priceData.currentPrice / (equity / sharesOutstanding)).toFixed(2) : 'N/A'
      },
      financials: {
        'Revenue': revenue ? formatCurrency(revenue) : 'N/A',
        'Net Income': netIncome ? formatCurrency(netIncome) : 'N/A',
        'Total Assets': totalAssets ? formatCurrency(totalAssets) : 'N/A',
        'Total Liabilities': totalLiabilities ? formatCurrency(totalLiabilities) : 'N/A',
        'Total Equity': equity ? formatCurrency(equity) : 'N/A',
        'Operating Cash Flow': operatingCashFlow ? formatCurrency(operatingCashFlow) : 'N/A',
        'Free Cash Flow': freeCashFlow ? formatCurrency(freeCashFlow) : 'N/A',
        'Shares Outstanding': sharesOutstanding ? new Intl.NumberFormat('en-US').format(sharesOutstanding) : 'N/A'
      },
      marketData: {
        'Current Price': formatCurrency(priceData.currentPrice),
        'Change': formatCurrency(priceData.change),
        'Change %': formatPercentage(priceData.changePercent),
        'High (Day)': formatCurrency(priceData.high),
        'Low (Day)': formatCurrency(priceData.low),
        'Open': formatCurrency(priceData.open),
        'Prev Close': formatCurrency(priceData.previousClose),
        'Is Real-time': priceData.isRealTime ? 'Yes' : 'No (Previous Close)',
        'Last Trade Time': new Date(priceData.timestamp).toLocaleString(),
        'Data Source': priceData.isRealTime && process.env.NEXT_PUBLIC_FINNHUB_API_KEY ? 'Finnhub (Real-time)' : 'Polygon'
      },
      profile: {
        industry: companyProfile.sic_description || 'N/A',
        sector: companyProfile.type || 'N/A',
        exchange: companyProfile.primary_exchange || 'N/A',
        ipo: companyProfile.list_date || 'N/A',
        logo: companyProfile.branding?.logo_url ? `${companyProfile.branding.logo_url}?apikey=${process.env.NEXT_PUBLIC_POLYGON_API_KEY}` : null,
        weburl: companyProfile.homepage_url || null,
        description: companyProfile.description || `${companyProfile.name || symbolData.companyName} financial data.`,
        address: companyProfile.address ? `${companyProfile.address.address1 || ''} ${companyProfile.address.city || ''} ${companyProfile.address.state || ''}`.trim() : 'N/A',
        phone: companyProfile.phone_number || 'N/A',
        employees: companyProfile.total_employees ? new Intl.NumberFormat('en-US').format(companyProfile.total_employees) : 'N/A'
      },
      debug: {
        hasHistoricalData: historicalData.length > 0,
        historicalDataPoints: historicalData.length,
        hasFinancials: financials.length > 0,
        financialPeriods: financials.length,
        symbol: symbol,
        requestedCompany: company,
        currentPrice: priceData.currentPrice,
        change: priceData.change,
        changePercent: priceData.changePercent,
        isRealTimePrice: priceData.isRealTime,
        priceDataSource: priceData.isRealTime && process.env.NEXT_PUBLIC_FINNHUB_API_KEY ? 'Finnhub' : 'Polygon',
        hasFinnhubKey: !!process.env.NEXT_PUBLIC_FINNHUB_API_KEY,
        apiCallsSuccessful: {
          historicalData: results[0].status === 'fulfilled',
          companyProfile: results[1].status === 'fulfilled',
          financials: results[2].status === 'fulfilled'
        }
      }
    }
    
    // Cache the result
    dataCache.set(cacheKey, {
      data: formattedData,
      timestamp: Date.now()
    })
    
    return NextResponse.json(formattedData)
    
  } catch (error: any) {
    console.error('Error in financial data fetch:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch financial data',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 })
  }
}

// Helper function to get company symbol - enhanced with better matching
async function getCompanySymbol(companyName: string): Promise<{symbol: string | null, companyName: string}> {
  const commonSymbols: Record<string, {symbol: string, fullName: string}> = {
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
  
  const normalizedName = companyName.toLowerCase().trim()
  
  // Try exact match first
  if (commonSymbols[normalizedName]) {
    return {
      symbol: commonSymbols[normalizedName].symbol,
      companyName: commonSymbols[normalizedName].fullName
    }
  }
  
  // Try partial match
  for (const [company, data] of Object.entries(commonSymbols)) {
    if (normalizedName.includes(company) || company.includes(normalizedName)) {
      return {
        symbol: data.symbol,
        companyName: data.fullName
      }
    }
  }
  
  // If input looks like a stock symbol, use it directly
  if (/^[A-Z]{1,5}$/.test(companyName.toUpperCase())) {
    return {
      symbol: companyName.toUpperCase(),
      companyName: companyName.toUpperCase()
    }
  }
  
  // Try to search using Polygon API
  try {
    const url = `https://api.polygon.io/v3/reference/tickers`
    const params = {
      search: companyName,
      active: 'true',
      limit: 10,
      apikey: process.env.NEXT_PUBLIC_POLYGON_API_KEY
    }

    const response = await axios.get(url, { params })
    
    if (response.data && response.data.status === 'OK' && response.data.results && response.data.results.length > 0) {
      // Find the best match
      const results = response.data.results
      
      // First try to find exact name match
      let bestMatch = results.find((result: any) => 
        result.name?.toLowerCase() === normalizedName ||
        result.name?.toLowerCase().includes(normalizedName)
      )
      
      // If no exact match, use the first result
      if (!bestMatch) {
        bestMatch = results[0]
      }
      
      return {
        symbol: bestMatch.ticker,
        companyName: bestMatch.name || companyName
      }
    }
  } catch (error) {
    console.error('Error searching for company symbol:', error)
  }
  
  // If still no match, return null
  return {
    symbol: null,
    companyName: companyName
  }
}