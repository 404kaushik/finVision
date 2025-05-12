"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/Layout"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowUpIcon,
  ArrowDownIcon,
  InfoIcon,
  StarIcon,
  SearchIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  PlusIcon,
  ExternalLinkIcon,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { supabase } from "@/utils/supabase/client"
import { PriceSparkline } from "@/components/PriceSparkline"
import { toast } from "sonner"

// Helper function to get emoji based on performance
const getPerformanceEmoji = (changePercent: number): string => {
  if (changePercent >= 10) return "🚀" // Rocket for big gains
  if (changePercent >= 5) return "🔥" // Fire for strong gains
  if (changePercent >= 1) return "📈" // Chart up for moderate gains
  if (changePercent > 0) return "✅" // Check for small gains
  if (changePercent > -1) return "⚠️" // Warning for small losses
  if (changePercent > -5) return "📉" // Chart down for moderate losses
  if (changePercent > -10) return "❄️" // Cold for strong losses
  return "💥" // Explosion for big losses
}

// Helper function to get sentiment description
const getSentimentDescription = (changePercent: number): string => {
  if (changePercent >= 10) return "Extremely bullish"
  if (changePercent >= 5) return "Very bullish"
  if (changePercent >= 1) return "Bullish"
  if (changePercent > 0) return "Slightly bullish"
  if (changePercent > -1) return "Slightly bearish"
  if (changePercent > -5) return "Bearish"
  if (changePercent > -10) return "Very bearish"
  return "Extremely bearish"
}

// Helper function to get color based on performance
const getPerformanceColor = (changePercent: number): string => {
  if (changePercent >= 0) return "text-green-500 dark:text-green-400"
  return "text-red-500 dark:text-red-400"
}

// Helper function to get background color based on performance
const getPerformanceBackground = (changePercent: number): string => {
  if (changePercent >= 5) return "bg-green-500/10"
  if (changePercent > 0) return "bg-green-500/5"
  if (changePercent > -5) return "bg-red-500/5"
  return "bg-red-500/10"
}

interface CryptoData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  marketCap: string
  volume: string
  high24h: number
  low24h: number
  sparklineData?: number[]
  description?: string
}

export default function CryptoPage() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [filteredData, setFilteredData] = useState<CryptoData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [savedCryptos, setSavedCryptos] = useState<string[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchCryptoData()
    checkUser()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = cryptoData.filter(
        (crypto) =>
          crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredData(filtered)
    } else {
      setFilteredData(cryptoData)
    }
  }, [searchTerm, cryptoData])

  useEffect(() => {
    if (activeTab === "all") {
      setFilteredData(cryptoData)
    } else if (activeTab === "gainers") {
      setFilteredData(cryptoData.filter((crypto) => crypto.changePercent > 0))
    } else if (activeTab === "losers") {
      setFilteredData(cryptoData.filter((crypto) => crypto.changePercent < 0))
    } else if (activeTab === "saved" && user) {
      setFilteredData(cryptoData.filter((crypto) => savedCryptos.includes(crypto.symbol)))
    }
  }, [activeTab, cryptoData, savedCryptos, user])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()
    if (data?.user) {
      setUser(data.user)
      fetchSavedCryptos(data.user.id)
    }
  }

  const fetchSavedCryptos = async (userId: string) => {
    const { data } = await supabase.from("saved_cryptos").select("crypto_symbol").eq("user_id", userId)

    if (data) {
      setSavedCryptos(data.map((item) => item.crypto_symbol))
    }
  }

  const fetchCryptoData = async () => {
    setLoading(true)
    setRefreshing(true)
    try {
      const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY

      if (!API_KEY) {
        console.error("Finnhub API key is not defined")
        generateFallbackData()
        return
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

          // Generate sparkline data
          const sparklineData = generateSparklineData(quoteData.c, quoteData.dp)

          return {
            symbol: actualSymbol,
            name: getCryptoName(actualSymbol),
            price: quoteData.c || 0,
            change: quoteData.d || 0,
            changePercent: quoteData.dp || 0,
            marketCap: formatMarketCap(actualSymbol),
            volume: formatVolume(quoteData.c * (Math.random() * 1000000 + 500000)),
            high24h: quoteData.c * (1 + Math.random() * 0.05),
            low24h: quoteData.c * (1 - Math.random() * 0.05),
            sparklineData,
            description: getCryptoDescription(actualSymbol),
          }
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error)
          return null
        }
      })

      const results = await Promise.allSettled(cryptoPromises)

      // Filter successful results
      const fetchedCryptos = results
        .filter(
          (result): result is PromiseFulfilledResult<any> => result.status === "fulfilled" && result.value !== null,
        )
        .map((result) => result.value)

      if (fetchedCryptos.length > 0) {
        setCryptoData(fetchedCryptos)
        setFilteredData(fetchedCryptos)
      } else {
        generateFallbackData()
      }
    } catch (error) {
      console.error("Error fetching crypto data:", error)
      generateFallbackData()
    } finally {
      setLoading(false)
      setTimeout(() => setRefreshing(false), 500)
    }
  }

  const generateSparklineData = (currentPrice: number, changePercent: number) => {
    const data: number[] = []
    let price = currentPrice * (1 - changePercent / 100) // Start from beginning of period

    for (let i = 0; i < 24; i++) {
      // Add some randomness but maintain the overall trend
      const trend = changePercent / 100 / 24
      const randomness = currentPrice * 0.005 * (Math.random() - 0.5)
      price = price * (1 + trend) + randomness
      data.push(price)
    }

    return data
  }

  const getCryptoName = (symbol: string): string => {
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

  const getCryptoDescription = (symbol: string): string => {
    const descriptions: { [key: string]: string } = {
      BTC: "Bitcoin is the first decentralized cryptocurrency. It was created in 2009 by an unknown person using the pseudonym Satoshi Nakamoto.",
      ETH: "Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether is the native cryptocurrency of the platform.",
      BNB: "Binance Coin is the cryptocurrency issued by the Binance exchange and trades with the BNB symbol.",
      XRP: "XRP is the native cryptocurrency of the XRP Ledger, which is an open-source, permissionless and decentralized blockchain technology.",
      ADA: "Cardano is a public blockchain platform. It is open-source and decentralized, with consensus achieved using proof of stake.",
      DOGE: "Dogecoin is a cryptocurrency created by software engineers Billy Markus and Jackson Palmer as a joke.",
      SOL: "Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale.",
      DOT: "Polkadot is a sharded multichain network founded by the Web3 Foundation.",
      AVAX: "Avalanche is an open-source platform for launching decentralized applications and enterprise blockchain deployments.",
      LINK: "Chainlink is a decentralized oracle network that provides real-world data to smart contracts on the blockchain.",
      MATIC:
        "Polygon (formerly Matic Network) is a protocol and a framework for building and connecting Ethereum-compatible blockchain networks.",
      UNI: "Uniswap is a decentralized finance protocol that is used to exchange cryptocurrencies.",
    }
    return descriptions[symbol] || "No description available."
  }

  const formatMarketCap = (symbol: string): string => {
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

  const formatVolume = (volume: number): string => {
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

  const generateFallbackData = () => {
    const fallbackCryptoData: CryptoData[] = [
      {
        symbol: "BTC",
        name: "Bitcoin",
        price: 50000 + Math.random() * 5000,
        change: 2500,
        changePercent: 5.2,
        marketCap: "$1.02T",
        volume: "$32.5B",
        high24h: 52000,
        low24h: 49000,
        description:
          "Bitcoin is the first decentralized cryptocurrency. It was created in 2009 by an unknown person using the pseudonym Satoshi Nakamoto.",
      },
      {
        symbol: "ETH",
        name: "Ethereum",
        price: 3000 + Math.random() * 300,
        change: -120,
        changePercent: -3.8,
        marketCap: "$350B",
        volume: "$18.7B",
        high24h: 3200,
        low24h: 2900,
        description:
          "Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether is the native cryptocurrency of the platform.",
      },
      {
        symbol: "BNB",
        name: "Binance Coin",
        price: 400 + Math.random() * 40,
        change: 12,
        changePercent: 3.1,
        marketCap: "$50B",
        volume: "$2.1B",
        high24h: 420,
        low24h: 390,
        description:
          "Binance Coin is the cryptocurrency issued by the Binance exchange and trades with the BNB symbol.",
      },
      {
        symbol: "XRP",
        name: "Ripple",
        price: 0.5 + Math.random() * 0.05,
        change: 0.02,
        changePercent: 4.2,
        marketCap: "$25B",
        volume: "$1.8B",
        high24h: 0.55,
        low24h: 0.48,
        description:
          "XRP is the native cryptocurrency of the XRP Ledger, which is an open-source, permissionless and decentralized blockchain technology.",
      },
      {
        symbol: "ADA",
        name: "Cardano",
        price: 1.2 + Math.random() * 0.12,
        change: -0.08,
        changePercent: -6.2,
        marketCap: "$15B",
        volume: "$1.2B",
        high24h: 1.3,
        low24h: 1.15,
        description:
          "Cardano is a public blockchain platform. It is open-source and decentralized, with consensus achieved using proof of stake.",
      },
      {
        symbol: "DOGE",
        name: "Dogecoin",
        price: 0.08 + Math.random() * 0.008,
        change: 0.006,
        changePercent: 8.1,
        marketCap: "$12B",
        volume: "$980M",
        high24h: 0.09,
        low24h: 0.075,
        description:
          "Dogecoin is a cryptocurrency created by software engineers Billy Markus and Jackson Palmer as a joke.",
      },
      {
        symbol: "SOL",
        name: "Solana",
        price: 100 + Math.random() * 10,
        change: 7,
        changePercent: 7.5,
        marketCap: "$30B",
        volume: "$2.5B",
        high24h: 105,
        low24h: 95,
        description:
          "Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale.",
      },
      {
        symbol: "DOT",
        name: "Polkadot",
        price: 15 + Math.random() * 1.5,
        change: -0.8,
        changePercent: -5.1,
        marketCap: "$8B",
        volume: "$650M",
        high24h: 16,
        low24h: 14.5,
        description: "Polkadot is a sharded multichain network founded by the Web3 Foundation.",
      },
    ]

    // Add sparkline data to each crypto
    fallbackCryptoData.forEach((crypto) => {
      crypto.sparklineData = generateSparklineData(crypto.price, crypto.changePercent)
    })

    setCryptoData(fallbackCryptoData)
    setFilteredData(fallbackCryptoData)
  }

  const saveCrypto = async (crypto: CryptoData) => {
    if (!user) {
    toast.error("Authentication required", {
        description: "Please sign in to save cryptocurrencies"
    })
    return
    }

    try {
    if (savedCryptos.includes(crypto.symbol)) {
        // Remove from saved
        await supabase.from("saved_cryptos").delete().eq("user_id", user.id).eq("crypto_symbol", crypto.symbol)

        setSavedCryptos((prev) => prev.filter((symbol) => symbol !== crypto.symbol))

        toast.success("Removed from saved", {
        description: `${crypto.name} has been removed from your saved cryptocurrencies`
        })
    } else {
        // Add to saved
        await supabase.from("saved_cryptos").insert({
          user_id: user.id,
          crypto_symbol: crypto.symbol,
          crypto_name: crypto.name,
        })

        setSavedCryptos((prev) => [...prev, crypto.symbol])

        toast.success("Added to saved", {
        description: `${crypto.name} has been added to your saved cryptocurrencies`
        })
    }
    } catch (error) {
    console.error("Error saving crypto:", error)
    toast.error("Error", {
        description: "Failed to update saved cryptocurrencies"
    })
    }
  }

  const researchCrypto = (crypto: CryptoData) => {
    window.location.href = `/research?company=${encodeURIComponent(crypto.name)}`
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
        >
          <div>
            <h1 className="text-3xl font-medium">Cryptocurrency Market</h1>
            <p className="text-muted-foreground mt-1">Track and analyze the top cryptocurrencies in real-time</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCryptoData}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCwIcon className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInfoModal(true)}
              className="flex items-center gap-2"
            >
              <InfoIcon className="h-4 w-4" />
              <span>Crypto Guide</span>
            </Button>
          </div>
        </motion.div>

        {/* Search and filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search cryptocurrencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="gainers">Gainers</TabsTrigger>
                <TabsTrigger value="losers">Losers</TabsTrigger>
                {user && <TabsTrigger value="saved">Saved</TabsTrigger>}
              </TabsList>
            </Tabs>
          </div>
        </motion.div>

        {/* Crypto cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-4">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-[60px] w-full" />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-medium mb-2">No cryptocurrencies found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filters</p>
                </motion.div>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                initial="hidden"
                animate="show"
              >
                {filteredData.map((crypto, index) => (
                  <motion.div
                    key={crypto.symbol}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 },
                    }}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      className={`overflow-hidden border hover:shadow-md transition-all duration-300 ${getPerformanceBackground(crypto.changePercent)}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {crypto.symbol}
                              <span className="text-xl">{getPerformanceEmoji(crypto.changePercent)}</span>
                            </CardTitle>
                            <CardDescription>{crypto.name}</CardDescription>
                          </div>
                          <div className="flex gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => saveCrypto(crypto)}
                                  >
                                    <StarIcon
                                      className={`h-4 w-4 ${savedCryptos.includes(crypto.symbol) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                                    />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {savedCryptos.includes(crypto.symbol) ? "Remove from saved" : "Add to saved"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setSelectedCrypto(crypto)}
                                  >
                                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View details</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-baseline mb-3">
                          <div className="text-2xl font-medium">
                            ${crypto.price < 1 ? crypto.price.toFixed(4) : crypto.price.toFixed(2)}
                          </div>
                          <div className={`flex items-center gap-1 ${getPerformanceColor(crypto.changePercent)}`}>
                            {crypto.changePercent >= 0 ? (
                              <TrendingUpIcon className="h-4 w-4" />
                            ) : (
                              <TrendingDownIcon className="h-4 w-4" />
                            )}
                            <span>
                              {crypto.changePercent >= 0 ? "+" : ""}
                              {crypto.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>

                        <div className="h-[60px] w-full">
                          <PriceSparkline
                            data={crypto.sparklineData || []}
                            width={300}
                            height={60}
                            showTooltip={false}
                            lineColor={crypto.changePercent >= 0 ? "#22c55e" : "#ef4444"}
                            fillColor={crypto.changePercent >= 0 ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Market Cap</div>
                            <div className="font-medium">{crypto.marketCap}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">24h Volume</div>
                            <div className="font-medium">{crypto.volume}</div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <Button variant="outline" size="sm" className="w-[48%]" onClick={() => researchCrypto(crypto)}>
                          <SearchIcon className="h-3 w-3 mr-2" />
                          Research
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="w-[48%]"
                          onClick={() => setSelectedCrypto(crypto)}
                        >
                          <PlusIcon className="h-3 w-3 mr-2" />
                          Details
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}

        {/* Beginner's guide modal */}
        <AnimatePresence>
          {showInfoModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowInfoModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card max-w-2xl w-full rounded-lg shadow-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <h2 className="text-2xl font-medium mb-4 flex items-center gap-2">
                    <span>Crypto Guide for Beginners</span>
                    <span className="text-2xl">🔍</span>
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">What is Cryptocurrency? 💡</h3>
                      <p className="text-muted-foreground">
                        Cryptocurrency is a digital or virtual currency that uses cryptography for security and operates
                        on a technology called blockchain.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Understanding the Basics 📊</h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>
                            <strong>Price</strong>: The current value of one unit of the cryptocurrency in USD.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>
                            <strong>Change %</strong>: How much the price has changed in the last 24 hours.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>
                            <strong>Market Cap</strong>: Total value of all coins (Price × Total Supply).
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>
                            <strong>Volume</strong>: How much of the cryptocurrency has been traded in the last 24
                            hours.
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Performance Indicators 📈</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🚀</span>
                          <span className="text-muted-foreground">Very strong gains (`{'>'}`10%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🔥</span>
                          <span className="text-muted-foreground">Strong gains (5-10%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📈</span>
                          <span className="text-muted-foreground">Moderate gains (1-5%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">✅</span>
                          <span className="text-muted-foreground">Small gains (0-1%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">⚠️</span>
                          <span className="text-muted-foreground">Small losses (0-1%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📉</span>
                          <span className="text-muted-foreground">Moderate losses (1-5%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">❄️</span>
                          <span className="text-muted-foreground">Strong losses (5-10%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">💥</span>
                          <span className="text-muted-foreground">Very strong losses (`{'>'}`10%)</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Getting Started Tips 💪</h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Start by researching established cryptocurrencies like Bitcoin and Ethereum.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Use the "Research" button to learn more about a specific cryptocurrency.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Save cryptocurrencies you're interested in to track them easily.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>
                            Remember that cryptocurrency markets are highly volatile - prices can change rapidly.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button onClick={() => setShowInfoModal(false)}>Close Guide</Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Crypto details modal */}
        <AnimatePresence>
          {selectedCrypto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedCrypto(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card max-w-2xl w-full rounded-lg shadow-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-full ${getPerformanceBackground(selectedCrypto.changePercent)}`}>
                        <span className="text-2xl">{getPerformanceEmoji(selectedCrypto.changePercent)}</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-medium">{selectedCrypto.name}</h2>
                        <p className="text-muted-foreground">{selectedCrypto.symbol}</p>
                      </div>
                    </div>
                    <Badge variant={selectedCrypto.changePercent >= 0 ? "default" : "destructive"}>
                      {getSentimentDescription(selectedCrypto.changePercent)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="text-3xl font-medium mb-2">
                        ${selectedCrypto.price < 1 ? selectedCrypto.price.toFixed(4) : selectedCrypto.price.toFixed(2)}
                      </div>
                      <div className={`flex items-center gap-1 ${getPerformanceColor(selectedCrypto.changePercent)}`}>
                        {selectedCrypto.changePercent >= 0 ? (
                          <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4" />
                        )}
                        <span>
                          {selectedCrypto.changePercent >= 0 ? "+" : ""}
                          {selectedCrypto.changePercent.toFixed(2)}% (24h)
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-muted-foreground text-sm">Market Cap</div>
                        <div className="font-medium">{selectedCrypto.marketCap}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-sm">24h Volume</div>
                        <div className="font-medium">{selectedCrypto.volume}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-sm">24h High</div>
                        <div className="font-medium">${selectedCrypto.high24h.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-sm">24h Low</div>
                        <div className="font-medium">${selectedCrypto.low24h.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Price Chart (24h)</h3>
                    <div className="h-[200px] w-full">
                      <PriceSparkline
                        data={selectedCrypto.sparklineData || []}
                        width={600}
                        height={200}
                        showTooltip={true}
                        lineColor={selectedCrypto.changePercent >= 0 ? "#22c55e" : "#ef4444"}
                        fillColor={
                          selectedCrypto.changePercent >= 0 ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"
                        }
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">About {selectedCrypto.name}</h3>
                    <p className="text-muted-foreground">{selectedCrypto.description}</p>
                  </div>

                  <div className="flex justify-between gap-4">
                    <Button variant="outline" className="flex-1" onClick={() => saveCrypto(selectedCrypto)}>
                      <StarIcon
                        className={`h-4 w-4 mr-2 ${savedCryptos.includes(selectedCrypto.symbol) ? "fill-yellow-400 text-yellow-400" : ""}`}
                      />
                      {savedCryptos.includes(selectedCrypto.symbol) ? "Saved" : "Save"}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => researchCrypto(selectedCrypto)}>
                      <SearchIcon className="h-4 w-4 mr-2" />
                      Research
                    </Button>
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={() => {
                        window.open(
                          `https://www.coingecko.com/en/coins/${selectedCrypto.name.toLowerCase().replace(" ", "-")}`,
                          "_blank",
                        )
                      }}
                    >
                      <ExternalLinkIcon className="h-4 w-4 mr-2" />
                      Learn More
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  )
}
