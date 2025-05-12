import { NextResponse } from "next/server"

export async function GET() {
  try {
    const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY

    if (!API_KEY) {
      return NextResponse.json({ error: "API key is not configured" }, { status: 500 })
    }

    // Top cryptocurrencies to track
    const symbols = [
      "BINANCE:BTCUSDT",
      "BINANCE:ETHUSDT",
      "BINANCE:BNBUSDT",
      "BINANCE:XRPUSDT",
      "BINANCE:ADAUSDT",
      "BINANCE:DOGEUSDT",
      "BINANCE:SOLUSDT",
      "BINANCE:DOTUSDT",
      "BINANCE:AVAXUSDT",
      "BINANCE:LINKUSDT",
      "BINANCE:MATICUSDT",
      "BINANCE:UNIUSDT",
    ]

    const cryptoPromises = symbols.map(async (symbol) => {
      const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`

      try {
        const quoteRes = await fetch(quoteUrl)

        if (!quoteRes.ok) {
          throw new Error(`Failed to fetch data for ${symbol}`)
        }

        const quoteData = await quoteRes.json()

        // Extract the actual symbol from the Binance format
        const actualSymbol = symbol.split(":")[1].replace("USDT", "")

        return {
          symbol: actualSymbol,
          name: getCryptoName(actualSymbol),
          price: quoteData.c || 0,
          change: quoteData.d || 0,
          changePercent: quoteData.dp || 0,
          marketCap: formatMarketCap(actualSymbol),
          volume: formatVolume(quoteData.c * (Math.random() * 1000000 + 500000)),
          high24h: quoteData.h || quoteData.c * 1.05,
          low24h: quoteData.l || quoteData.c * 0.95,
        }
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error)
        return null
      }
    })

    const results = await Promise.allSettled(cryptoPromises)

    // Filter successful results
    const cryptoData = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled" && result.value !== null)
      .map((result) => result.value)

    return NextResponse.json({ cryptoData })
  } catch (error) {
    console.error("Error in crypto API route:", error)
    return NextResponse.json({ error: "Failed to fetch cryptocurrency data" }, { status: 500 })
  }
}

// Helper functions
function getCryptoName(symbol: string): string {
  const names: { [key: string]: string } = {
    BTC: "Bitcoin",
    ETH: "Ethereum",
    BNB: "Binance Coin",
    XRP: "Ripple",
    ADA: "Cardano",
    DOGE: "Dogecoin",
    SOL: "Solana",
    DOT: "Polkadot",
    AVAX: "Avalanche",
    LINK: "Chainlink",
    MATIC: "Polygon",
    UNI: "Uniswap",
  }
  return names[symbol] || symbol
}

function formatMarketCap(symbol: string): string {
  // Simulated market caps
  const marketCaps: { [key: string]: number } = {
    BTC: 1000000000000, // $1T
    ETH: 350000000000, // $350B
    BNB: 50000000000, // $50B
    XRP: 25000000000, // $25B
    ADA: 15000000000, // $15B
    DOGE: 12000000000, // $12B
    SOL: 30000000000, // $30B
    DOT: 8000000000, // $8B
    AVAX: 7000000000, // $7B
    LINK: 6000000000, // $6B
    MATIC: 5000000000, // $5B
    UNI: 4000000000, // $4B
  }

  const cap = marketCaps[symbol] || Math.random() * 10000000000

  if (cap >= 1000000000000) {
    return `$${(cap / 1000000000000).toFixed(2)}T`
  } else if (cap >= 1000000000) {
    return `$${(cap / 1000000000).toFixed(2)}B`
  } else if (cap >= 1000000) {
    return `$${(cap / 1000000).toFixed(2)}M`
  } else {
    return `$${cap.toFixed(2)}`
  }
}

function formatVolume(volume: number): string {
  if (volume >= 1000000000) {
    return `$${(volume / 1000000000).toFixed(2)}B`
  } else if (volume >= 1000000) {
    return `$${(volume / 1000000).toFixed(2)}M`
  } else if (volume >= 1000) {
    return `$${(volume / 1000).toFixed(2)}K`
  } else {
    return `$${volume.toFixed(2)}`
  }
}
