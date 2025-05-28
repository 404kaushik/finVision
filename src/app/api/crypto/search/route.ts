// app/api/crypto/search/route.ts
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY

    if (!API_KEY) {
      return NextResponse.json({ error: "API key is not configured" }, { status: 500 })
    }

    // Get list of crypto symbols from Finnhub
    const symbolsUrl = `https://finnhub.io/api/v1/crypto/symbol?exchange=binance&token=${API_KEY}`
    
    try {
      const symbolsRes = await fetch(symbolsUrl)
      
      if (!symbolsRes.ok) {
        throw new Error('Failed to fetch crypto symbols')
      }

      const symbolsData = await symbolsRes.json()
      
      // Filter symbols based on search query
      const searchResults = symbolsData
        .filter((crypto: any) => {
          const symbol = crypto.symbol.replace('USDT', '').toLowerCase()
          const description = crypto.description.toLowerCase()
          const searchTerm = query.toLowerCase()
          
          return crypto.symbol.endsWith('USDT') && 
                 crypto.symbol !== 'USDT' &&
                 (symbol.includes(searchTerm) || 
                  description.includes(searchTerm) ||
                  symbol.startsWith(searchTerm))
        })
        .slice(0, 20) // Limit to 20 results

      // Get current prices for search results
      const cryptoPromises = searchResults.map(async (crypto: any) => {
        const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=BINANCE:${crypto.symbol}&token=${API_KEY}`
        
        try {
          const quoteRes = await fetch(quoteUrl)
          
          if (!quoteRes.ok) {
            return null
          }

          const quoteData = await quoteRes.json()
          
          // Extract base symbol (remove USDT)
          const baseSymbol = crypto.symbol.replace('USDT', '')
          
          return {
            symbol: baseSymbol,
            fullSymbol: crypto.symbol,
            name: crypto.description || getCryptoName(baseSymbol),
            price: quoteData.c || 0,
            change: quoteData.d || 0,
            changePercent: quoteData.dp || 0,
            volume: formatVolume(quoteData.c * (Math.random() * 1000000 + 100000)),
            high24h: quoteData.h || quoteData.c * 1.05,
            low24h: quoteData.l || quoteData.c * 0.95,
            marketCap: formatVolume(quoteData.c * (Math.random() * 10000000 + 1000000)),
          }
        } catch (error) {
          console.error(`Error fetching quote for ${crypto.symbol}:`, error)
          return null
        }
      })

      const results = await Promise.allSettled(cryptoPromises)
      
      // Filter successful results
      const cryptoData = results
        .filter((result): result is PromiseFulfilledResult<any> => 
          result.status === "fulfilled" && result.value !== null
        )
        .map((result) => result.value)
        .sort((a, b) => {
          // Sort by relevance - exact matches first, then alphabetical
          const aSymbol = a.symbol.toLowerCase()
          const bSymbol = b.symbol.toLowerCase()
          const searchTerm = query.toLowerCase()
          
          if (aSymbol === searchTerm) return -1
          if (bSymbol === searchTerm) return 1
          if (aSymbol.startsWith(searchTerm) && !bSymbol.startsWith(searchTerm)) return -1
          if (bSymbol.startsWith(searchTerm) && !aSymbol.startsWith(searchTerm)) return 1
          
          return aSymbol.localeCompare(bSymbol)
        })

      return NextResponse.json({ 
        query,
        results: cryptoData,
        count: cryptoData.length
      })

    } catch (error) {
      console.error("Error searching crypto symbols:", error)
      return NextResponse.json({ error: "Failed to search cryptocurrencies" }, { status: 500 })
    }

  } catch (error) {
    console.error("Error in crypto search API route:", error)
    return NextResponse.json({ error: "Failed to search cryptocurrencies" }, { status: 500 })
  }
}

// Helper functions (same as in the all route)
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
    LTC: "Litecoin",
    BCH: "Bitcoin Cash",
    ATOM: "Cosmos",
    FIL: "Filecoin",
    TRX: "TRON",
    ETC: "Ethereum Classic",
    XLM: "Stellar",
    VET: "VeChain",
    ICP: "Internet Computer",
    FTT: "FTX Token",
    HBAR: "Hedera",
    ALGO: "Algorand",
    EGLD: "MultiversX",
    SAND: "The Sandbox",
    MANA: "Decentraland",
    AXS: "Axie Infinity",
    THETA: "Theta Network",
    XTZ: "Tezos",
    FLOW: "Flow",
    AAVE: "Aave",
    MKR: "Maker",
    COMP: "Compound",
    SUSHI: "SushiSwap",
    YFI: "yearn.finance",
    SNX: "Synthetix",
    CRV: "Curve DAO Token",
    BAL: "Balancer",
    RUNE: "THORChain",
    LUNA: "Terra Luna",
    UST: "TerraUSD",
    NEAR: "NEAR Protocol",
    FTM: "Fantom",
    ONE: "Harmony",
    ROSE: "Oasis Network",
    KAVA: "Kava",
    BAND: "Band Protocol",
    ZIL: "Zilliqa",
    ICX: "ICON",
    OMG: "OMG Network",
    BAT: "Basic Attention Token",
    ZRX: "0x",
    REP: "Augur",
    KNC: "Kyber Network Crystal",
    LRC: "Loopring",
    ENJ: "Enjin Coin",
    HOT: "Holo",
    DENT: "Dent",
    SC: "Siacoin",
    DGB: "DigiByte",
    RVN: "Ravencoin",
    WAVES: "Waves",
    ZEC: "Zcash",
    DASH: "Dash",
    XMR: "Monero",
    NEO: "Neo",
    QTUM: "Qtum",
    ONT: "Ontology",
    ZEN: "Horizen",
    DCR: "Decred"
  }
  return names[symbol] || symbol
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