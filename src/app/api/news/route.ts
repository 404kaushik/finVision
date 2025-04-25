import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const company = searchParams.get('company')
  
  if (!company) {
    return NextResponse.json(
      { error: 'Company parameter is required' },
      { status: 400 }
    )
  }
  
  try {
    // Get API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY
    
    if (!apiKey) {
      console.error('NEXT_PUBLIC_FINNHUB_API_KEY is not defined')
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      )
    }
    
    // Get company symbol with improved lookup
    const symbolData = await getCompanySymbol(company)
    
    if (!symbolData.symbol) {
      return NextResponse.json(
        { error: 'Could not find symbol for company' },
        { status: 404 }
      )
    }
    
    // Get current date and date from 30 days ago
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)
    
    const fromDate = thirtyDaysAgo.toISOString().split('T')[0]
    const toDate = today.toISOString().split('T')[0]
    
    // Call Finnhub API
    const response = await fetch(
      `https://finnhub.io/api/v1/company-news?symbol=${symbolData.symbol}&from=${fromDate}&to=${toDate}&token=${apiKey}`
    )
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Finnhub API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to get news from Finnhub' },
        { status: response.status }
      )
    }
    
    const newsData = await response.json()
    
    // Process and filter the news items for relevance
    const processedNews = filterAndProcessNews(newsData, symbolData.companyName, symbolData.symbol)
      .slice(0, 10)
      .map((item: any) => ({
        headline: item.headline,
        summary: item.summary,
        url: item.url,
        datetime: item.datetime * 1000, // Convert Unix timestamp to milliseconds
        source: item.source,
        image: item.image || null,
        relevanceScore: item.relevanceScore,
        sentiment: analyzeSentiment(item.headline)
      }))
    
    return NextResponse.json({ news: processedNews })
  } catch (error) {
    console.error('Error in News API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Improved function to get company symbol
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
  
  // If still no match, return null
  return {
    symbol: null,
    companyName: companyName
  }
}

// Function to filter and process news for relevance
function filterAndProcessNews(newsItems: any[], companyName: string, symbol: string) {
  const companyNameLower = companyName.toLowerCase()
  const symbolLower = symbol.toLowerCase()
  const companyWords = companyName.toLowerCase().split(/\s+/)
  
  // Filter and score news items
  return newsItems
    .map((item: any) => {
      let relevanceScore = 0
      const headlineLower = item.headline?.toLowerCase() || ''
      const summaryLower = item.summary?.toLowerCase() || ''
      
      // Check for exact company name in headline (highest relevance)
      if (headlineLower.includes(companyNameLower)) {
        relevanceScore += 10
      }
      
      // Check for symbol in headline
      if (headlineLower.includes(symbolLower)) {
        relevanceScore += 8
      }
      
      // Check for company name words in headline
      companyWords.forEach(word => {
        if (word.length > 2 && headlineLower.includes(word)) {
          relevanceScore += 5
        }
      })
      
      // Check for company name in summary
      if (summaryLower.includes(companyNameLower)) {
        relevanceScore += 4
      }
      
      // Check for symbol in summary
      if (summaryLower.includes(symbolLower)) {
        relevanceScore += 3
      }
      
      // Check for company name words in summary
      companyWords.forEach(word => {
        if (word.length > 2 && summaryLower.includes(word)) {
          relevanceScore += 2
        }
      })
      
      // Add the score to the item
      return {
        ...item,
        relevanceScore
      }
    })
    // Filter out items with zero relevance
    .filter((item: any) => item.relevanceScore > 0)
    // Sort by relevance score (highest first)
    .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
}

// Function to analyze sentiment and return appropriate emoji
function analyzeSentiment(headline: string): { emoji: string; label: string } {
  const headlineLower = headline.toLowerCase();
  
  // Positive keywords
  const positiveWords = [
    'rise', 'rises', 'rising', 'rose', 'up', 'gain', 'gains', 'gained', 'increase', 'increased',
    'growth', 'grow', 'grew', 'growing', 'positive', 'profit', 'profits', 'profitable',
    'success', 'successful', 'win', 'wins', 'winning', 'beat', 'beats', 'beating',
    'exceed', 'exceeds', 'exceeded', 'outperform', 'outperforms', 'outperformed',
    'strong', 'stronger', 'strongest', 'high', 'higher', 'highest', 'record',
    'opportunity', 'opportunities', 'optimistic', 'bullish', 'rally', 'rallies', 'rallied',
    'soar', 'soars', 'soared', 'soaring', 'jump', 'jumps', 'jumped', 'jumping',
    'boost', 'boosts', 'boosted', 'boosting', 'upgrade', 'upgrades', 'upgraded'
  ];
  
  // Negative keywords
  const negativeWords = [
    'fall', 'falls', 'falling', 'fell', 'down', 'drop', 'drops', 'dropped', 'decrease', 'decreased',
    'decline', 'declines', 'declined', 'declining', 'negative', 'loss', 'losses', 'lost',
    'fail', 'fails', 'failed', 'failure', 'miss', 'misses', 'missed', 'missing',
    'weak', 'weaker', 'weakest', 'low', 'lower', 'lowest', 'poor',
    'risk', 'risks', 'risky', 'warning', 'warn', 'warns', 'warned',
    'concern', 'concerns', 'concerned', 'pessimistic', 'bearish', 'crash', 'crashes', 'crashed',
    'plunge', 'plunges', 'plunged', 'plunging', 'tumble', 'tumbles', 'tumbled',
    'cut', 'cuts', 'cutting', 'downgrade', 'downgrades', 'downgraded', 'layoff', 'layoffs'
  ];
  
  // Neutral keywords
  const neutralWords = [
    'announce', 'announces', 'announced', 'plan', 'plans', 'planned',
    'launch', 'launches', 'launched', 'introduce', 'introduces', 'introduced',
    'report', 'reports', 'reported', 'say', 'says', 'said', 'state', 'states', 'stated',
    'update', 'updates', 'updated', 'release', 'releases', 'released',
    'change', 'changes', 'changed', 'move', 'moves', 'moved', 'shift', 'shifts', 'shifted'
  ];
  
  // Count occurrences of sentiment words
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;
  
  positiveWords.forEach(word => {
    if (headlineLower.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (headlineLower.includes(word)) negativeCount++;
  });
  
  neutralWords.forEach(word => {
    if (headlineLower.includes(word)) neutralCount++;
  });
  
  // Check for negation words that could flip sentiment
  const negationWords = ['not', 'no', "n't", 'never', 'without', 'despite', 'however'];
  let hasNegation = false;
  
  negationWords.forEach(word => {
    if (headlineLower.includes(word)) hasNegation = true;
  });
  
  // Determine sentiment based on counts and negation
  if (hasNegation) {
    // Negation might flip the sentiment
    if (positiveCount > negativeCount) {
      // Positive words with negation might become negative
      return { emoji: '😟', label: 'Negative' };
    } else if (negativeCount > positiveCount) {
      // Negative words with negation might become positive
      return { emoji: '😊', label: 'Positive' };
    }
  } else {
    // No negation, straightforward sentiment analysis
    if (positiveCount > negativeCount && positiveCount > neutralCount) {
      return { emoji: '🚀', label: 'Positive' };
    } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
      return { emoji: '📉', label: 'Negative' };
    }
  }
  
  // Default to neutral
  return { emoji: '📊', label: 'Neutral' };
}