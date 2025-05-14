"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Define a type for stock data
type Stock = {
  symbol: string
  companyName: string
  price: number
  changePercent?: number
  change?: number
}

// Sample stock data (fallback data if API fails)
const sampleStocks: Stock[] = [
  { symbol: "AAPL", companyName: "Apple Inc.", price: 182.52, changePercent: 1.25, change: 2.25 },
  { symbol: "MSFT", companyName: "Microsoft Corp.", price: 337.94, changePercent: 0.87, change: 2.91 },
  { symbol: "GOOGL", companyName: "Alphabet Inc.", price: 131.86, changePercent: 1.42, change: 1.85 },
  { symbol: "AMZN", companyName: "Amazon.com Inc.", price: 127.74, changePercent: 0.95, change: 1.2 },
  { symbol: "NVDA", companyName: "NVIDIA Corp.", price: 416.1, changePercent: 2.35, change: 9.56 },
  { symbol: "META", companyName: "Meta Platforms Inc.", price: 297.74, changePercent: 1.15, change: 3.38 },
  { symbol: "TSLA", companyName: "Tesla Inc.", price: 237.49, changePercent: -0.75, change: -1.8 },
  { symbol: "BRK.A", companyName: "Berkshire Hathaway", price: 528450, changePercent: 0.32, change: 1680 },
  { symbol: "JPM", companyName: "JPMorgan Chase & Co.", price: 146.43, changePercent: 0.65, change: 0.94 },
  { symbol: "V", companyName: "Visa Inc.", price: 235.44, changePercent: 0.48, change: 1.12 },
]

// Popular stock symbols to fetch from Finnhub
const popularSymbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "JPM", "V", "WMT", "DIS", "KO", "PEP"]

type StockCarouselProps = {
  title: string
  description: string
  filter?: (stock: Stock) => boolean
}

export function StockCarousel({ title, description, filter }: StockCarouselProps) {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true)
      try {
        const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY

        if (!API_KEY) {
          throw new Error("Finnhub API key is not defined")
        }

        // Fetch data for multiple symbols
        const stockPromises = popularSymbols.map(async (symbol) => {
          const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
          const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`

          const [quoteRes, profileRes] = await Promise.all([fetch(quoteUrl), fetch(profileUrl)])

          if (!quoteRes.ok || !profileRes.ok) {
            throw new Error(`Failed to fetch data for ${symbol}`)
          }

          const quoteData = await quoteRes.json()
          const profileData = await profileRes.json()

          return {
            symbol: symbol,
            companyName: profileData.name || symbol,
            price: quoteData.c || 0, // Current price
            change: quoteData.d || 0, // Change
            changePercent: quoteData.dp || 0, // Change percent
          }
        })

        // Use Promise.allSettled to handle individual failures
        const results = await Promise.allSettled(stockPromises)

        // Filter successful results
        const fetchedStocks = results
          .filter(
            (
              result,
            ): result is PromiseFulfilledResult<{
              symbol: string
              companyName: string
              price: number
              change: number
              changePercent: number
            }> => result.status === "fulfilled",
          )
          .map((result) => (result as PromiseFulfilledResult<Stock>).value)

        if (fetchedStocks.length > 0) {
          setStocks(fetchedStocks)
        } else {
          // Fall back to sample data if no stocks were successfully fetched
          console.warn("No stocks fetched from API, using sample data")
          setStocks(sampleStocks)
        }
      } catch (err) {
        console.error("Error fetching stocks:", err)
        setError("Failed to load stock data")
        // Use sample data as fallback
        setStocks(sampleStocks)
      } finally {
        setLoading(false)
      }
    }

    fetchStocks()
  }, [])

  // Apply filter if provided
  const filteredStocks = filter ? stocks.filter(filter) : stocks

  // Handle navigation
  const nextSlide = () => {
    if (filteredStocks.length <= 3) return
    setCurrentIndex((prevIndex) => (prevIndex === filteredStocks.length - 3 ? 0 : prevIndex + 1))
  }

  const prevSlide = () => {
    if (filteredStocks.length <= 3) return
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? filteredStocks.length - 3 : prevIndex - 1))
  }

  // Visible stocks based on current index
  const visibleStocks = filteredStocks.slice(currentIndex, currentIndex + 3)

  return (
    <Card className="stock-carousel overflow-hidden border-border">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-medium">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {filteredStocks.length > 3 && (
            <div className="flex space-x-2">
              <Button
                onClick={prevSlide}
                variant="outline"
                size="icon"
                className="rounded-full h-8 w-8"
                aria-label="Previous stocks"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                onClick={nextSlide}
                variant="outline"
                size="icon"
                className="rounded-full h-8 w-8"
                aria-label="Next stocks"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-24" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-10 w-full mt-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-muted-foreground py-4">{error}</div>
        ) : filteredStocks.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No stocks available matching your criteria.</p>
            <p className="text-sm mt-2">Try adjusting your filter or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {visibleStocks.map((stock) => (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-card hover:bg-accent/50 p-4 rounded-lg border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-base">{stock.symbol}</h3>
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">{stock.companyName}</p>
                  </div>
                  <div className={`text-right ${(stock.changePercent || 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                    <p className="font-mono font-medium">${stock.price.toLocaleString()}</p>
                    <p className="text-xs flex items-center justify-end gap-1">
                      {(stock.changePercent || 0) >= 0 ? "▲" : "▼"}
                      {stock.change?.toFixed(2) || "0.00"} ({Math.abs(stock.changePercent || 0).toFixed(2)}%)
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}