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

// 1. Mapping from symbol to company info
const companyInfo: Record<string, { name: string; emoji: string }> = {
  AAPL: { name: "Apple Inc.",      emoji: "🍎" },
  MSFT: { name: "Microsoft Corp.", emoji: "🖥️" },
  GOOGL:{ name: "Alphabet Inc.",   emoji: "🔍" },
  AMD:  { name: "AMD",             emoji: "🧩" },
  TSLA: { name: "Tesla, Inc.",     emoji: "🚗" },
  META: { name: "Meta Platforms",  emoji: "📘" },
  NVDA: { name: "NVIDIA Corp.",    emoji: "🎮" },
  JPM:  { name: "JPMorgan Chase",   emoji: "💰" },
  V:    { name: "Visa Inc.",        emoji: "💳" },
  DIS:  { name: "Disney",          emoji: "🎬" },
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

  useEffect(() => {
    const createErrorStock = (symbol: string): Stock => ({
      symbol,
      price: 0,
      change: 0,
      changePercent: 0,
      error: true
    })

    const fetchStockData = async () => {
      try {
        setLoading(stocks.length === 0)

        const stockPromises = popularSymbols.map(async (symbol) => {
          try {
            const response = await fetch(`/api/stock-quote?symbol=${encodeURIComponent(symbol)}`)
            if (!response.ok) return createErrorStock(symbol)
            const data = await response.json()
            if (data.error) return createErrorStock(symbol)
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
      } catch (err) {
        console.error("Error fetching stock data:", err)
        setError("Failed to load stock data")
      } finally {
        setLoading(false)
      }
    }

    fetchStockData()
    const interval = setInterval(fetchStockData, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

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
              transition={{ x: { duration: 50, repeat: Infinity, ease: "linear" } }}
              className="flex whitespace-nowrap"
            >
              {[...stocks, ...stocks].map((stock, index) => {
                const info = companyInfo[stock.symbol] || { name: stock.symbol, emoji: "" }
                return (
                  <div
                    key={`${stock.symbol}-${index}`}
                    className="relative group flex items-center mx-6 overflow-visible"
                  >
                    {/* Ticker content */}
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
                              stock.change > 0
                                ? "text-green-600 dark:text-green-500"
                                : "text-red-600 dark:text-red-500"
                            )}
                          >
                            {stock.change > 0 ? <TrendingUpIcon className="h-3 w-3" /> : <TrendingDownIcon className="h-3 w-3" />}
                            {stock.change > 0 ? "+" : ""}{stock.change.toFixed(2)} ({stock.change > 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%)
                          </span>
                        </>
                      )}
                    </div>

                    {/* Hover tooltip */}
                    <div className="
                        absolute z-50 bottom-full left-1/2
                        transform -translate-x-1/2 mb-2
                        px-2 py-1 rounded
                        bg-gray-800 text-white text-xs
                        whitespace-nowrap
                        opacity-0 group-hover:opacity-100
                        transition-opacity
                        pointer-events-none
                      "
                    >
                      {info.emoji} {info.name}
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </div>
          <div className="ml-4 shrink-0">
            <a
              href="/market"
              className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>View All</span>
              <ExternalLinkIcon className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
