"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import Layout from "@/components/Layout"
import { StockCarousel } from "@/components/StockCarousel"
import CompanyChart from "@/components/CompanyChart"
import {
  CoinsIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  InfoIcon,
  RefreshCwIcon,
  SearchIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExternalLinkIcon,
  BarChart2Icon,
  DollarSignIcon,
  PieChartIcon,
  LightbulbIcon,
  AlertCircleIcon,
  NewspaperIcon,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { getStockInsight } from "@/lib/perplexity"

type MarketIndex = {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

type MarketData = {
  symbol: string
  companyName: string
  price: number
  change: number
  changePercent: number
  volume: string
  marketCap: string
  logo?: string
  industry?: string
  emoji: string
}

// Helper function to get emoji based on performance
const getPerformanceEmoji = (changePercent: number): string => {
  if (changePercent >= 5) return "🚀" // Rocket for big gains
  if (changePercent >= 2) return "🔥" // Fire for strong gains
  if (changePercent >= 0.5) return "📈" // Chart up for moderate gains
  if (changePercent > 0) return "✅" // Check for small gains
  if (changePercent > -0.5) return "⚠️" // Warning for small losses
  if (changePercent > -2) return "📉" // Chart down for moderate losses
  if (changePercent > -5) return "❄️" // Cold for strong losses
  return "💥" // Explosion for big losses
}

// Helper function to get company logo
const getCompanyLogo = (symbol: string): string => {
  return `https://logo.clearbit.com/${symbol.toLowerCase()}.com`
}

interface Company {
  name: string;
  domain: string; // Important: Need the domain name to fetch logo
}

export default function MarketPage() {
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [marketLogo, setMarketLogo] = useState<MarketData[]>([])
  const [filteredData, setFilteredData] = useState<MarketData[]>([])
  const [indices, setIndices] = useState<MarketIndex[]>([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [refreshAnimation, setRefreshAnimation] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  }>({ key: "symbol", direction: "ascending" })
  const [stockInsights, setStockInsights] = useState<Record<string, string>>({})
  const [loadingInsights, setLoadingInsights] = useState<Record<string, boolean>>({})

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    fetchMarketData()
    const interval = setInterval(fetchMarketData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  // Add a new useEffect to fetch insights when market data changes
  useEffect(() => {
    if (marketData.length > 0) {
      // First, try to load insights from localStorage
      try {
        const savedInsights = localStorage.getItem('stockInsights');
        if (savedInsights) {
          const parsedInsights = JSON.parse(savedInsights);
          setStockInsights(parsedInsights);
        }
      } catch (error) {
        console.error("Error loading insights from localStorage:", error);
      }
      
      // Add a debounce to prevent multiple rapid calls
      const timer = setTimeout(() => {
        fetchStockInsights(marketData);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [marketData])

  // Save insights to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(stockInsights).length > 0) {
      try {
        localStorage.setItem('stockInsights', JSON.stringify(stockInsights));
      } catch (error) {
        console.error("Error saving insights to localStorage:", error);
      }
    }
  }, [stockInsights]);

  const fetchStockInsights = async (stocks: MarketData[]) => {
    // Only fetch insights for stocks that don't already have them
    const stocksToFetch = stocks.filter(stock => !stockInsights[stock.symbol]);
    
    if (stocksToFetch.length === 0) return;
    
    const newInsights: Record<string, string> = {}
    const newLoadingStates: Record<string, boolean> = {}

    // Initialize loading states only for stocks being fetched
    stocksToFetch.forEach((stock) => {
      newLoadingStates[stock.symbol] = true
    })
    setLoadingInsights(prev => ({...prev, ...newLoadingStates}))

    // Fetch insights for each stock
    await Promise.all(
      stocksToFetch.map(async (stock) => {
        try {
          const { insight } = await getStockInsight(stock.symbol, stock.changePercent)
          if (insight) {
            newInsights[stock.symbol] = insight
          }
        } catch (error) {
          console.error(`Error fetching insight for ${stock.symbol}:`, error)
        } finally {
          setLoadingInsights((prev) => ({
            ...prev,
            [stock.symbol]: false,
          }))
        }
      }),
    )

    setStockInsights((prev) => ({ ...prev, ...newInsights }))
  }

  useEffect(() => {
    // Filter and sort data when marketData, searchQuery, or activeTab changes
    let result = [...marketData]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.companyName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply tab filter
    if (activeTab === "gainers") {
      result = result.filter((stock) => stock.changePercent > 0)
    } else if (activeTab === "losers") {
      result = result.filter((stock) => stock.changePercent < 0)
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof MarketData]
      const bValue = b[sortConfig.key as keyof MarketData]

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "ascending" ? aValue - bValue : bValue - aValue
      } else {
        const strA = String(aValue).toLowerCase()
        const strB = String(bValue).toLowerCase()
        return sortConfig.direction === "ascending" ? strA.localeCompare(strB) : strB.localeCompare(strA)
      }
    })

    setFilteredData(result)
  }, [marketData, searchQuery, activeTab, sortConfig])

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return null
    }
    return sortConfig.direction === "ascending" ? (
      <ArrowUpIcon className="h-3 w-3" />
    ) : (
      <ArrowDownIcon className="h-3 w-3" />
    )
  }

  const fetchMarketData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/market-data")

      if (!response.ok) {
        throw new Error("Failed to fetch market data")
      }

      const data = await response.json()

      // Process stocks data
      const stocksWithEmojis = data.stocks.map((stock: any) => ({
        ...stock,
        emoji: getPerformanceEmoji(stock.changePercent),
        logo: getCompanyLogo(stock.symbol),
      }))

      setMarketData(stocksWithEmojis)
      setIndices(data.indices)
      setLastUpdated(new Date())

      // Create chart data
      const labels = stocksWithEmojis.map((item: MarketData) => item.symbol)
      const prices = stocksWithEmojis.map((item: MarketData) => item.price)
      const changes = stocksWithEmojis.map((item: MarketData) => item.changePercent)

      setChartData({
        labels,
        datasets: [
          {
            label: "Price",
            data: prices,
            borderColor: "rgba(59, 130, 246, 1)",
            backgroundColor: "rgba(59, 130, 246, 0.5)",
          },
          {
            label: "Change %",
            data: changes,
            borderColor: "rgba(139, 92, 246, 1)",
            backgroundColor: "rgba(139, 92, 246, 0.5)",
          },
        ],
      })

      setError(null)

      // Animate refresh button
      setRefreshAnimation(true)
      setTimeout(() => setRefreshAnimation(false), 1000)
    } catch (error) {
      console.error("Error fetching market data:", error)
      setError("Failed to fetch market data. Using sample data instead.")

      // Use sample data as fallback
      if (marketData.length === 0) {
        const mockData = [
          {
            symbol: "AAPL",
            companyName: "Apple Inc.",
            price: 175.34 + Math.random() * 5,
            change: 2.45,
            changePercent: 1.42,
            volume: "62.3M",
            domain: "apple.com",
            marketCap: "2.8T",
            industry: "Technology",
          },
          {
            symbol: "MSFT",
            companyName: "Microsoft Corporation",
            price: 340.67 + Math.random() * 5,
            change: -1.23,
            changePercent: -0.36,
            volume: "28.1M",
            marketCap: "2.5T",
            industry: "Technology",
          },
          {
            symbol: "GOOGL",
            companyName: "Alphabet Inc.",
            price: 131.86 + Math.random() * 5,
            change: 0.56,
            changePercent: 0.43,
            volume: "15.7M",
            marketCap: "1.7T",
            industry: "Technology",
          },
          {
            symbol: "AMZN",
            companyName: "Amazon.com Inc.",
            price: 127.74 + Math.random() * 5,
            change: -0.89,
            changePercent: -0.69,
            volume: "32.4M",
            marketCap: "1.3T",
            industry: "Consumer Cyclical",
          },
          {
            symbol: "META",
            companyName: "Meta Platforms Inc.",
            price: 301.41 + Math.random() * 5,
            change: 4.12,
            changePercent: 1.38,
            volume: "18.9M",
            marketCap: "780B",
            industry: "Technology",
          },
          {
            symbol: "TSLA",
            companyName: "Tesla Inc.",
            price: 248.48 + Math.random() * 5,
            change: -3.56,
            changePercent: -1.41,
            volume: "45.2M",
            marketCap: "790B",
            industry: "Automotive",
          },
          {
            symbol: "NVDA",
            companyName: "NVIDIA Corporation",
            price: 437.53 + Math.random() * 5,
            change: 7.89,
            changePercent: 1.83,
            volume: "38.6M",
            marketCap: "1.1T",
            industry: "Technology",
          },
          {
            symbol: "JPM",
            companyName: "JPMorgan Chase & Co.",
            price: 146.77 + Math.random() * 5,
            change: 0.34,
            changePercent: 0.23,
            volume: "9.8M",
            marketCap: "430B",
            industry: "Financial Services",
          },
        ]

        // Add emojis and logos based on performance
        const dataWithEmojis = mockData.map((stock) => ({
          ...stock,
          emoji: getPerformanceEmoji(stock.changePercent),
          logo: getCompanyLogo(stock.symbol),
        }))

        setMarketData(
          dataWithEmojis.map((stock) => ({
            ...stock,
            companyName: stock.companyName || stock.symbol, // Provide fallback for missing companyName
          })),
        )

        // Create chart data from sample data
        const labels = dataWithEmojis.map((item) => item.symbol)
        const prices = dataWithEmojis.map((item) => item.price)
        const changes = dataWithEmojis.map((item) => item.changePercent)

        setChartData({
          labels,
          datasets: [
            {
              label: "Price",
              data: prices,
              borderColor: "rgba(59, 130, 246, 1)",
              backgroundColor: "rgba(59, 130, 246, 0.5)",
            },
            {
              label: "Change %",
              data: changes,
              borderColor: "rgba(139, 92, 246, 1)",
              backgroundColor: "rgba(139, 92, 246, 0.5)",
            },
          ],
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const API_KEY = "pk_b3x22PoMT9C74oqX7C9sgg"

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-24">
        <div className="flex flex-col space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart2Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Market Pulse</h1>
                <p className="text-muted-foreground">Real-time market insights and trends</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="text-sm text-muted-foreground hidden md:inline-block">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowHelp(!showHelp)}
                      className="rounded-full"
                    >
                      <InfoIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Market guide</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button onClick={fetchMarketData} className="gap-2" disabled={loading}>
                <RefreshCwIcon className={cn("h-4 w-4", refreshAnimation ? "animate-spin" : "")} />
                <span className="hidden sm:inline-block">{loading ? "Refreshing..." : "Refresh"}</span>
              </Button>
              <Button
                onClick={() => fetchStockInsights(marketData)}
                variant="outline"
                size="sm"
                className="gap-2 ml-2"
                disabled={marketData.length === 0}
              >
                <RefreshCwIcon className="h-4 w-4" />
                <span className="hidden sm:inline-block">Refresh Insights</span>
              </Button>
            </div>
          </div>

          {/* Market Guide Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full md:hidden mb-4">
                <InfoIcon className="h-4 w-4 mr-2" />
                Market Guide
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Understanding the Market</DialogTitle>
                <DialogDescription>A quick guide to help you navigate market data</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BarChart2Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Market Indices</h3>
                    <p className="text-sm text-muted-foreground">Shows how the overall market is performing today</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUpIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Performance Indicators</h3>
                    <p className="text-sm text-muted-foreground">Emojis quickly show how stocks are performing:</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <span>🚀</span>
                        <span className="text-xs">Excellent (+5%+)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🔥</span>
                        <span className="text-xs">Strong (+2-5%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📈</span>
                        <span className="text-xs">Good (+0.5-2%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>✅</span>
                        <span className="text-xs">Positive (0-0.5%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⚠️</span>
                        <span className="text-xs">Caution (0 to -0.5%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📉</span>
                        <span className="text-xs">Declining (-0.5 to -2%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>❄️</span>
                        <span className="text-xs">Cold (-2 to -5%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>💥</span>
                        <span className="text-xs">Severe (-5%+)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <DollarSignIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Market Terminology</h3>
                    <p className="text-sm text-muted-foreground mb-2">Common terms you'll see in the market view:</p>
                    <div className="space-y-1">
                      <p className="text-xs">
                        <span className="font-medium">Market Cap:</span> Total value of a company's shares
                      </p>
                      <p className="text-xs">
                        <span className="font-medium">Volume:</span> Number of shares traded
                      </p>
                      <p className="text-xs">
                        <span className="font-medium">Change %:</span> Percentage price change today
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <NewspaperIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">AI Stock Insights</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Our AI analyzes recent news and market trends to explain why stocks are moving:
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <LightbulbIcon className="h-3 w-3 text-green-600 dark:text-green-500" />
                        <p className="text-xs">
                          <span className="font-medium">Green insights</span> explain positive movements
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircleIcon className="h-3 w-3 text-red-600 dark:text-red-500" />
                        <p className="text-xs">
                          <span className="font-medium">Red insights</span> explain negative movements
                        </p>
                      </div>
                      <p className="text-xs mt-2">
                        Hover over any insight for more information. Insights are updated throughout the day.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive"
            >
              {error}
            </motion.div>
          )}

          {/* Market Indices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {loading && indices.length === 0
              ? Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardContent className="p-4">
                        <Skeleton className="h-5 w-24 mb-2" />
                        <Skeleton className="h-8 w-20 mb-2" />
                        <Skeleton className="h-4 w-16" />
                      </CardContent>
                    </Card>
                  ))
              : indices.map((index) => (
                  <Card key={index.symbol} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm">{index.name}</h3>
                        <span className="text-lg">{getPerformanceEmoji(index.changePercent)}</span>
                      </div>
                      <p className="text-2xl font-bold">{index.price.toLocaleString()}</p>
                      <p
                        className={cn(
                          "flex items-center text-sm",
                          index.changePercent >= 0
                            ? "text-green-600 dark:text-green-500"
                            : "text-red-600 dark:text-red-500",
                        )}
                      >
                        {index.changePercent >= 0 ? (
                          <TrendingUpIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDownIcon className="h-3 w-3 mr-1" />
                        )}
                        {index.changePercent >= 0 ? "+" : ""}
                        {index.changePercent.toFixed(2)}%
                      </p>
                    </CardContent>
                  </Card>
                ))}
          </motion.div>

          {lastUpdated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <NewspaperIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-1">✨ New: AI Stock Insights</h3>
                  <p className="text-muted-foreground">
                    We now provide AI-generated explanations for why stocks are moving today. Look for the "Reason"
                    column to understand market movements at a glance.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      onClick={() => fetchStockInsights(marketData)}
                      size="sm"
                      className="gap-2"
                      disabled={marketData.length === 0 || Object.values(loadingInsights).some((loading) => loading)}
                    >
                      <RefreshCwIcon
                        className={cn(
                          "h-4 w-4",
                          Object.values(loadingInsights).some((loading) => loading) ? "animate-spin" : "",
                        )}
                      />
                      <span>Refresh Insights</span>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowHelp(true)}>
                      <InfoIcon className="h-4 w-4" />
                      <span>Learn More</span>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stock Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="top-stocks"
          >
            <StockCarousel
              title="Top Performing Stocks"
              description="Stocks with the highest positive change today"
              filter={(stock) => (stock.changePercent || 0) > 0}
            />
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-3 w-full sm:w-[300px]">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="gainers">Gainers</TabsTrigger>
                  <TabsTrigger value="losers">Losers</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Stocks Table */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center justify-between">
                  <span>Market Overview</span>
                  {Object.values(loadingInsights).some((loading) => loading) && (
                    <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
                      <div className="h-3 w-3 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
                      <span>Analyzing market insights...</span>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  {filteredData.length} stocks •{" "}
                  {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : "Updating..."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th
                          className="text-left p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => requestSort("symbol")}
                        >
                          <div className="flex items-center gap-1">
                            <span>Symbol</span>
                            {getSortIcon("symbol")}
                          </div>
                        </th>
                        <th className="text-left p-3">Company</th>
                        <th
                          className="text-left p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => requestSort("price")}
                        >
                          <div className="flex items-center gap-1">
                            <span>Price</span>
                            {getSortIcon("price")}
                          </div>
                        </th>
                        <th
                          className="text-left p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => requestSort("changePercent")}
                        >
                          <div className="flex items-center gap-1">
                            <span>Change</span>
                            {getSortIcon("changePercent")}
                          </div>
                        </th>
                        <th className="text-left p-3 hidden md:table-cell">Volume</th>
                        <th className="text-left p-3 hidden md:table-cell">Market Cap</th>
                        <th className="text-left p-3 hidden lg:table-cell">Reason</th>
                        <th className="text-left p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && filteredData.length === 0 ? (
                        Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <tr key={i} className="border-b">
                              <td className="p-3">
                                <Skeleton className="h-6 w-16" />
                              </td>
                              <td className="p-3">
                                <Skeleton className="h-6 w-32" />
                              </td>
                              <td className="p-3">
                                <Skeleton className="h-6 w-20" />
                              </td>
                              <td className="p-3">
                                <Skeleton className="h-6 w-20" />
                              </td>
                              <td className="p-3 hidden md:table-cell">
                                <Skeleton className="h-6 w-16" />
                              </td>
                              <td className="p-3 hidden md:table-cell">
                                <Skeleton className="h-6 w-16" />
                              </td>
                              <td className="p-3 hidden lg:table-cell">
                                <Skeleton className="h-6 w-40" />
                              </td>
                              <td className="p-3">
                                <Skeleton className="h-6 w-24" />
                              </td>
                            </tr>
                          ))
                      ) : filteredData.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-muted-foreground">
                            No stocks found matching your criteria
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((stock, index) => (
                          <motion.tr
                            key={stock.symbol}
                            variants={item}
                            initial="hidden"
                            animate="show"
                            className={cn(
                              "border-b hover:bg-muted/50 transition-colors cursor-pointer",
                              index % 2 === 0 ? "bg-background" : "bg-muted/20",
                            )}
                            onClick={() => (window.location.href = `/research?company=${stock.symbol}`)}
                          >
                            <td className="p-3 font-medium">{stock.symbol}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {/* <img
                                  src={stock.logo || "/placeholder.svg"}
                                  alt={stock.companyName}
                                  className="h-6 w-6 rounded-full object-cover bg-muted"
                                  onError={(e) => {
                                    e.currentTarget.src = `/placeholder.svg?height=24&width=24`
                                  }}
                                /> */}
                                {/* <img
                                  src={`https://logo.dev/api/v1/${stock.domain}?apikey=${API_KEY}`}
                                  alt={`${stock.companyName} logo`}
                                  className="h-10 w-10 object-contain"
                                />                   */}
                                <span className="hidden md:inline-block">{stock.companyName}</span>
                              </div>
                            </td>
                            <td className="p-3 font-medium">${stock.price.toFixed(2)}</td>
                            <td
                              className={cn(
                                "p-3 flex items-center gap-1",
                                stock.changePercent >= 0
                                  ? "text-green-600 dark:text-green-500"
                                  : "text-red-600 dark:text-red-500",
                              )}
                            >
                              {stock.changePercent >= 0 ? (
                                <TrendingUpIcon className="h-3 w-3" />
                              ) : (
                                <TrendingDownIcon className="h-3 w-3" />
                              )}
                              <span>
                                {stock.changePercent >= 0 ? "+" : ""}
                                {stock.changePercent.toFixed(2)}%
                              </span>
                              <span className="ml-1 text-lg">{stock.emoji}</span>
                            </td>
                            <td className="p-3 hidden md:table-cell">{stock.volume}</td>
                            <td className="p-3 hidden md:table-cell">{stock.marketCap}</td>
                            <td className="p-3 hidden lg:table-cell max-w-[250px]">
                              {loadingInsights[stock.symbol] ? (
                                <div className="flex items-center gap-2">
                                  <div className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
                                  <span className="text-muted-foreground text-sm">Analyzing...</span>
                                </div>
                              ) : stockInsights[stock.symbol] ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-start gap-2 cursor-help">
                                        <motion.div
                                          initial={{ scale: 0.9, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          transition={{ duration: 0.3 }}
                                          className={cn(
                                            "h-5 w-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5",
                                            stock.changePercent >= 0
                                              ? "bg-green-500/20 text-green-600 dark:text-green-500"
                                              : "bg-red-500/20 text-red-600 dark:text-red-500",
                                          )}
                                        >
                                          {stock.changePercent >= 0 ? (
                                            <LightbulbIcon className="h-3 w-3" />
                                          ) : (
                                            <AlertCircleIcon className="h-3 w-3" />
                                          )}
                                        </motion.div>
                                        <span className="text-sm line-clamp-2">{stockInsights[stock.symbol]}</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-[300px]">
                                      <div className="space-y-2">
                                        <div className="font-medium">{stock.symbol} Insight:</div>
                                        <p>{stockInsights[stock.symbol]}</p>
                                        {/* <div className="text-xs whitespace-nowrap text-white">
                                          AI-generated insight based on recent news and market trends
                                        </div> */}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <span className="text-sm text-muted-foreground italic">No insight available</span>
                              )}
                            </td>
                            <td className="p-3">
                              <Badge
                                className={cn(
                                  "flex items-center gap-1",
                                  stock.changePercent >= 2
                                    ? "bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/30"
                                    : stock.changePercent >= 0
                                      ? "bg-primary/20 text-primary hover:bg-primary/30"
                                      : stock.changePercent >= -2
                                        ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-500 hover:bg-yellow-500/30"
                                        : "bg-red-500/20 text-red-700 dark:text-red-500 hover:bg-red-500/30",
                                )}
                              >
                                <span className="mr-1">{stock.emoji}</span>
                                <span>
                                  {stock.changePercent >= 2
                                    ? "Strong Buy"
                                    : stock.changePercent >= 0
                                      ? "Buy"
                                      : stock.changePercent >= -2
                                        ? "Hold"
                                        : "Sell"}
                                </span>
                              </Badge>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <p className="text-sm text-muted-foreground">Click on any stock to view detailed research</p>
                <Button variant="outline" size="sm" className="gap-1" asChild>
                  <a href="/research" target="_blank" rel="noopener noreferrer">
                    <ExternalLinkIcon className="h-3 w-3" />
                    <span>Research</span>
                  </a>
                </Button>
              </CardFooter>
            </Card>

            {/* Market Chart */}
            <div ref={ref}>
              <AnimatePresence>
                {inView && chartData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-8"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Market Overview</CardTitle>
                        <CardDescription>Visual comparison of stock prices and performance</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <CompanyChart title="" data={chartData} />
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Market Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    <span>Market Insights</span>
                  </CardTitle>
                  <CardDescription>Key trends and sector performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Sector Performance</h3>
                      <div className="space-y-3">
                        {loading ? (
                          Array(4)
                            .fill(0)
                            .map((_, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="space-y-2 flex-1">
                                  <Skeleton className="h-4 w-24" />
                                  <Skeleton className="h-2 w-full" />
                                </div>
                                <Skeleton className="h-4 w-12" />
                              </div>
                            ))
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                <span className="text-green-600 dark:text-green-500">🔥</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium">Technology</span>
                                  <span className="text-green-600 dark:text-green-500">+2.4%</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500 rounded-full" style={{ width: "72%" }}></div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                <span className="text-green-600 dark:text-green-500">📈</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium">Healthcare</span>
                                  <span className="text-green-600 dark:text-green-500">+1.2%</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500 rounded-full" style={{ width: "58%" }}></div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                <span className="text-red-600 dark:text-red-500">📉</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium">Energy</span>
                                  <span className="text-red-600 dark:text-red-500">-0.8%</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-red-500 rounded-full" style={{ width: "42%" }}></div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                <span className="text-yellow-600 dark:text-yellow-500">⚠️</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium">Financial</span>
                                  <span className="text-yellow-600 dark:text-yellow-500">+0.3%</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: "51%" }}></div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Market Trends</h3>
                      <div className="space-y-4">
                        {loading ? (
                          Array(3)
                            .fill(0)
                            .map((_, i) => (
                              <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-4/6" />
                              </div>
                            ))
                        ) : (
                          <>
                            <div className="flex items-start gap-3">
                              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                                <TrendingUpIcon className="h-3 w-3 text-primary" />
                              </div>
                              <p className="text-sm">
                                <span className="font-medium">Tech sector leads gains</span> with semiconductor stocks
                                showing strong momentum driven by AI demand.
                              </p>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="h-6 w-6 rounded-full bg-yellow-500/20 flex items-center justify-center mt-0.5">
                                <InfoIcon className="h-3 w-3 text-yellow-600 dark:text-yellow-500" />
                              </div>
                              <p className="text-sm">
                                <span className="font-medium">Market volatility increasing</span> ahead of upcoming
                                Federal Reserve meeting and interest rate decision.
                              </p>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                                <CoinsIcon className="h-3 w-3 text-green-600 dark:text-green-500" />
                              </div>
                              <p className="text-sm">
                                <span className="font-medium">Consumer spending data</span> shows resilience despite
                                inflation concerns, boosting retail stocks.
                              </p>
                            </div>
                          </>
                        )}

                        <Button variant="outline" className="w-full mt-2" asChild>
                          <a href="/learn" target="_blank" rel="noopener noreferrer">
                            Learn More About Market Trends
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
