// This is a simplified list of S&P 500 stocks
// In a production app, you would fetch this from a financial API
export interface Stock {
    symbol: string
    name: string
    sector: string
    price?: number
    change?: number
    changePercent?: number
  }
  
  export const fetchStocks = async (): Promise<Stock[]> => {
    // In a real app, you would fetch this data from a financial API
    // For demo purposes, we're returning a static list of major S&P 500 stocks
    return [
      { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
      { symbol: "MSFT", name: "Microsoft Corporation", sector: "Technology" },
      { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Cyclical" },
      { symbol: "NVDA", name: "NVIDIA Corporation", sector: "Technology" },
      { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Communication Services" },
      { symbol: "META", name: "Meta Platforms Inc.", sector: "Communication Services" },
      { symbol: "TSLA", name: "Tesla Inc.", sector: "Consumer Cyclical" },
      { symbol: "BRK.B", name: "Berkshire Hathaway Inc.", sector: "Financial Services" },
      { symbol: "UNH", name: "UnitedHealth Group Inc.", sector: "Healthcare" },
      { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
      { symbol: "JPM", name: "JPMorgan Chase & Co.", sector: "Financial Services" },
      { symbol: "V", name: "Visa Inc.", sector: "Financial Services" },
      { symbol: "PG", name: "Procter & Gamble Co.", sector: "Consumer Defensive" },
      { symbol: "MA", name: "Mastercard Inc.", sector: "Financial Services" },
      { symbol: "HD", name: "Home Depot Inc.", sector: "Consumer Cyclical" },
      { symbol: "CVX", name: "Chevron Corporation", sector: "Energy" },
      { symbol: "MRK", name: "Merck & Co. Inc.", sector: "Healthcare" },
      { symbol: "ABBV", name: "AbbVie Inc.", sector: "Healthcare" },
      { symbol: "PFE", name: "Pfizer Inc.", sector: "Healthcare" },
      { symbol: "KO", name: "Coca-Cola Co.", sector: "Consumer Defensive" },
      { symbol: "PEP", name: "PepsiCo Inc.", sector: "Consumer Defensive" },
      { symbol: "AVGO", name: "Broadcom Inc.", sector: "Technology" },
      { symbol: "COST", name: "Costco Wholesale Corp.", sector: "Consumer Defensive" },
      { symbol: "BAC", name: "Bank of America Corp.", sector: "Financial Services" },
      { symbol: "TMO", name: "Thermo Fisher Scientific Inc.", sector: "Healthcare" },
      { symbol: "CSCO", name: "Cisco Systems Inc.", sector: "Technology" },
      { symbol: "ABT", name: "Abbott Laboratories", sector: "Healthcare" },
      { symbol: "WMT", name: "Walmart Inc.", sector: "Consumer Defensive" },
      { symbol: "CRM", name: "Salesforce Inc.", sector: "Technology" },
      { symbol: "ACN", name: "Accenture Plc", sector: "Technology" },
      // Add more stocks as needed
    ]
  }
  
  // Mock function to simulate fetching stock prices
  export const fetchStockPrices = async (
    symbols: string[],
  ): Promise<Record<string, { price: number; change: number; changePercent: number }>> => {
    // In a real app, you would fetch this data from a financial API
    const result: Record<string, { price: number; change: number; changePercent: number }> = {}
  
    symbols.forEach((symbol) => {
      // Generate random price between $50 and $500
      const price = Math.round((Math.random() * 450 + 50) * 100) / 100
  
      // Generate random change between -5% and +5%
      const changePercent = Math.round((Math.random() * 10 - 5) * 100) / 100
      const change = Math.round(((price * changePercent) / 100) * 100) / 100
  
      result[symbol] = { price, change, changePercent }
    })
  
    return result
  }
  