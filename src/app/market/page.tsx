"use client"

import { useEffect, useState } from "react"
import Layout from "@/components/Layout"
import CompanyChart from "@/components/CompanyChart"
import { motion } from "framer-motion"
import { FaInfoCircle, FaExchangeAlt, FaSyncAlt } from "react-icons/fa"

type MarketData = {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: string
  marketCap: string
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

export default function MarketPage() {
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [refreshAnimation, setRefreshAnimation] = useState(false)

  useEffect(() => {
    fetchMarketData()
    const interval = setInterval(fetchMarketData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const fetchMarketData = async () => {
    setLoading(true)
    try {
      // This would normally fetch from a real API
      // Simulating market data for demonstration
      const mockData = [
        {
          symbol: "AAPL",
          price: 175.34 + Math.random() * 5,
          change: 2.45,
          changePercent: 1.42,
          volume: "62.3M",
          marketCap: "2.8T",
        },
        {
          symbol: "MSFT",
          price: 340.67 + Math.random() * 5,
          change: -1.23,
          changePercent: -0.36,
          volume: "28.1M",
          marketCap: "2.5T",
        },
        {
          symbol: "GOOGL",
          price: 131.86 + Math.random() * 5,
          change: 0.56,
          changePercent: 0.43,
          volume: "15.7M",
          marketCap: "1.7T",
        },
        {
          symbol: "AMZN",
          price: 127.74 + Math.random() * 5,
          change: -0.89,
          changePercent: -0.69,
          volume: "32.4M",
          marketCap: "1.3T",
        },
        {
          symbol: "META",
          price: 301.41 + Math.random() * 5,
          change: 4.12,
          changePercent: 1.38,
          volume: "18.9M",
          marketCap: "780B",
        },
        {
          symbol: "TSLA",
          price: 248.48 + Math.random() * 5,
          change: -3.56,
          changePercent: -1.41,
          volume: "45.2M",
          marketCap: "790B",
        },
        {
          symbol: "NVDA",
          price: 437.53 + Math.random() * 5,
          change: 7.89,
          changePercent: 1.83,
          volume: "38.6M",
          marketCap: "1.1T",
        },
        {
          symbol: "JPM",
          price: 146.77 + Math.random() * 5,
          change: 0.34,
          changePercent: 0.23,
          volume: "9.8M",
          marketCap: "430B",
        },
      ]

      // Add emojis based on performance
      const dataWithEmojis = mockData.map((stock) => ({
        ...stock,
        emoji: getPerformanceEmoji(stock.changePercent),
      }))

      setMarketData(dataWithEmojis)

      // Create chart data
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

      // Animate refresh button
      setRefreshAnimation(true)
      setTimeout(() => setRefreshAnimation(false), 1000)
    } catch (error) {
      console.error("Error fetching market data:", error)
    } finally {
      setLoading(false)
    }
  }

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
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4"
        >
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <FaExchangeAlt className="text-primary text-xl" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Market Pulse</h1>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Show help"
            >
              <FaInfoCircle />
            </button>
          </div>
          <button
            onClick={fetchMarketData}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors hover-lift"
          >
            <FaSyncAlt className={refreshAnimation ? "rotate" : ""} />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </motion.div>

        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-card-bg rounded-lg border border-border"
          >
            <h3 className="font-medium mb-2 text-primary">Understanding the Market View</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-lg">📊</span>
                <span>
                  <strong>Market Indices</strong>: Shows how the overall market is performing today
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">🔢</span>
                <span>
                  <strong>Stock Table</strong>: Lists major companies with their current prices and changes
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">🚀</span>
                <span>
                  <strong>Emojis</strong>: Quickly show how stocks are performing (🚀 = excellent, 📈 = good, ⚠️ =
                  caution, 📉 = declining)
                </span>
              </li>
            </ul>
          </motion.div>
        )}

        {loading && !chartData ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-muted-foreground mt-4">Loading market data...</p>
            </div>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            >
              <div className="bg-card-bg p-4 rounded-lg border border-border hover-lift">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">S&P 500</h3>
                  <span className="text-success">🚀</span>
                </div>
                <p className="text-2xl font-bold mt-2">4,783.45</p>
                <p className="text-success flex items-center">
                  +0.38% <span className="ml-1">📈</span>
                </p>
              </div>

              <div className="bg-card-bg p-4 rounded-lg border border-border hover-lift">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Nasdaq</h3>
                  <span className="text-success">🔥</span>
                </div>
                <p className="text-2xl font-bold mt-2">16,742.39</p>
                <p className="text-success flex items-center">
                  +0.54% <span className="ml-1">📈</span>
                </p>
              </div>

              <div className="bg-card-bg p-4 rounded-lg border border-border hover-lift">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Dow Jones</h3>
                  <span className="text-error">⚠️</span>
                </div>
                <p className="text-2xl font-bold mt-2">38,503.69</p>
                <p className="text-error flex items-center">
                  -0.11% <span className="ml-1">📉</span>
                </p>
              </div>

              <div className="bg-card-bg p-4 rounded-lg border border-border hover-lift">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Russell 2000</h3>
                  <span className="text-success">✅</span>
                </div>
                <p className="text-2xl font-bold mt-2">2,009.69</p>
                <p className="text-success flex items-center">
                  +0.23% <span className="ml-1">📈</span>
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-card-bg rounded-lg border border-border overflow-hidden hover-lift mb-8"
            >
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h2 className="text-xl font-semibold">Top Tech Stocks</h2>
                <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</div>
              </div>
              <div className="overflow-x-auto">
                <motion.table variants={container} initial="hidden" animate="show" className="w-full">
                  <thead className="bg-card-hover">
                    <tr>
                      <th className="p-3 text-left">Symbol</th>
                      <th className="p-3 text-left">Price</th>
                      <th className="p-3 text-left">Change</th>
                      <th className="p-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketData.map((stock, index) => (
                      <motion.tr
                        key={stock.symbol}
                        variants={item}
                        className={`${index % 2 === 0 ? "bg-card-bg" : "bg-card-hover"} hover:bg-opacity-80 transition-colors`}
                      >
                        <td className="p-3 font-medium">{stock.symbol}</td>
                        <td className="p-3">${stock.price.toFixed(2)}</td>
                        <td
                          className={`p-3 ${stock.changePercent >= 0 ? "text-success" : "text-error"} flex items-center`}
                        >
                          <span>
                            {stock.changePercent >= 0 ? "+" : ""}
                            {stock.changePercent.toFixed(2)}%
                          </span>
                          <span className="ml-2 text-lg">{stock.emoji}</span>
                        </td>
                        <td className="p-3">
                          <div
                            className={`px-2 py-1 rounded-full text-xs inline-flex items-center ${
                              stock.changePercent >= 2
                                ? "bg-success/20 text-success"
                                : stock.changePercent >= 0
                                  ? "bg-primary/20 text-primary"
                                  : stock.changePercent >= -2
                                    ? "bg-yellow-500/20 text-yellow-500"
                                    : "bg-error/20 text-error"
                            }`}
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
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </motion.table>
              </div>
            </motion.div>

            {chartData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mb-8 hover-lift"
              >
                <CompanyChart title="Market Overview" data={chartData} />
              </motion.div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
