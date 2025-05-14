"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUpIcon, TrendingDownIcon, ExternalLinkIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getPerformanceEmoji } from "@/lib/stockUtiils"

interface Stock {
  symbol: string
  price: number
  change: number
  changePercent: number
  lastUpdated?: Date
  error?: boolean
}

// Popular stock symbols for the ticker
const popularSymbols = [
  "AAPL", "MSFT", "GOOGL", "AMD", "TSLA", 
  "META", "NVDA", "JPM", "V", "DIS"
]

export function StockTickerHeader() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real stock data
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(stocks.length === 0)
        
        // Fetch data for each symbol in parallel
        const stockPromises = popularSymbols.map(async (symbol) => {
          try {
            const response = await fetch(`/api/stock-quote?symbol=${encodeURIComponent(symbol)}`)
            
            if (!response.ok) {
              return createErrorStock(symbol)
            }
            
            const data = await response.json()
            
            if (data.error) {
              return createErrorStock(symbol)
            }
            
            return {
              symbol,
              price: data.quote?.c || 0,
              change: data.quote?.d || 0,
              changePercent: data.quote?.dp || 0,
              lastUpdated: new Date(),
              error: false
            }
          } catch (err) {
            console.error(`Error fetching data for ${symbol}:`, err)
            return createErrorStock(symbol)
          }
        })
        
        const newStocks = await Promise.all(stockPromises)
        
        if (newStocks.some(stock => !stock.error)) {
          setStocks(newStocks)
          setError(null)
        } else {
          setError("Unable to fetch stock data")
        }
      } catch (error) {
        console.error("Error fetching stock data:", error)
        setError("Failed to load stock data")
      } finally {
        setLoading(false)
      }
    }

    // Helper to create error stock objects
    const createErrorStock = (symbol: string): Stock => ({
      symbol,
      price: 0,
      change: 0,
      changePercent: 0,
      error: true
    })

    // Initial fetch
    fetchStockData()
    
    // Update every 15 minutes to respect API limits and use cached data
    const interval = setInterval(fetchStockData, 15 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  // If we're still loading initial data and have no stocks to show
  if (loading && stocks.length === 0) {
    return (
      <div className="w-full bg-background/80 backdrop-blur-sm border-b z-50 overflow-hidden">
        <div className="max-w-full py-2 px-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading market data...</span>
          </div>
        </div>
      </div>
    )
  }

  // If there's an error and we have no stocks to display
  if (error && stocks.length === 0) {
    return (
      <div className="w-full bg-background/80 backdrop-blur-sm border-b z-50 overflow-hidden">
        <div className="max-w-full py-2 px-4">
          <div className="flex items-center justify-center">
            <span className="text-sm text-muted-foreground">{error}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-background/80 backdrop-blur-sm border-b z-50 overflow-hidden">
      <div className="max-w-full py-2 px-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 overflow-hidden">
            <motion.div
              animate={{ x: "-100%" }}
              transition={{
                x: {
                  duration: 50,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                  ease: "linear",
                },
              }}
              className="flex whitespace-nowrap"
            >
              {/* Duplicate the stocks to create a seamless loop */}
              {[...stocks, ...stocks].map((stock, index) => (
                <div key={`${stock.symbol}-${index}`} className="flex items-center mx-6">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">{stock.symbol}</span>
                    {stock.error ? (
                      <span className="text-xs text-muted-foreground">Data unavailable</span>
                    ) : (
                      <>
                        <span className="text-sm font-medium">${stock.price.toFixed(2)}</span>
                        <span className="text-lg" title={`${stock.changePercent > 0 ? "Positive" : "Negative"} change`}>
                          {getPerformanceEmoji(stock.changePercent)}
                        </span>
                        <span
                          className={cn(
                            "text-xs flex items-center gap-0.5",
                            stock.change > 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500",
                          )}
                        >
                          {stock.change > 0 ? (
                            <TrendingUpIcon className="h-3 w-3" />
                          ) : (
                            <TrendingDownIcon className="h-3 w-3" />
                          )}
                          {stock.change > 0 ? "+" : ""}
                          {stock.change.toFixed(2)} ({stock.change > 0 ? "+" : ""}
                          {stock.changePercent.toFixed(2)}%)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
          <div className="ml-4 shrink-0">
            <a
              href="/market"
              className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="">View All</span>
              <ExternalLinkIcon className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}