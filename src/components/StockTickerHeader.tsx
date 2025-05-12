"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUpIcon, TrendingDownIcon, ExternalLinkIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { getPerformanceEmoji } from "@/lib/stockUtiils"

interface Stock {
  symbol: string
  price: number
  change: number
  changePercent: number
}

export function StockTickerHeader() {
  const [stocks, setStocks] = useState<Stock[]>([
    { symbol: "AAPL", price: 187.32, change: 1.25, changePercent: 0.67 },
    { symbol: "MSFT", price: 402.56, change: -1.89, changePercent: -0.47 },
    { symbol: "GOOGL", price: 142.17, change: 2.34, changePercent: 1.68 },
    { symbol: "AMZN", price: 178.75, change: 3.21, changePercent: 1.83 },
    { symbol: "TSLA", price: 175.34, change: -5.67, changePercent: -3.13 },
    { symbol: "META", price: 474.99, change: 8.45, changePercent: 1.81 },
    { symbol: "NVDA", price: 824.18, change: 15.32, changePercent: 1.89 },
    { symbol: "JPM", price: 183.76, change: -0.89, changePercent: -0.48 },
    { symbol: "V", price: 275.42, change: 1.12, changePercent: 0.41 },
    { symbol: "WMT", price: 59.87, change: 0.34, changePercent: 0.57 },
  ])

  // Fetch real stock data
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // This would be replaced with a real API call in production
        // const response = await fetch('/api/stocks')
        // const data = await response.json()
        // setStocks(data)

        // For now, we'll just simulate price changes
        setStocks((prevStocks) =>
          prevStocks.map((stock) => ({
            ...stock,
            price: Number((stock.price + (Math.random() * 2 - 1) * 0.1).toFixed(2)),
            change: Number((stock.change + (Math.random() * 0.4 - 0.2)).toFixed(2)),
            changePercent: Number((stock.changePercent + (Math.random() * 0.2 - 0.1)).toFixed(2)),
          })),
        )
      } catch (error) {
        console.error("Error fetching stock data:", error)
      }
    }

    // Update every minute
    const interval = setInterval(fetchStockData, 60000)

    // Initial fetch
    fetchStockData()

    return () => clearInterval(interval)
  }, [])

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
