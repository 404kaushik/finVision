"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PriceSparkline } from "./PriceSparkline"
import { getPerformanceEmoji } from "@/lib/stockUtiils"
import { motion } from "framer-motion"
import Link from "next/link"
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StockCardProps {
  symbol: string
  name: string
  price?: number
  change?: number
  changePercent?: number
  sector?: string
  sparklineData?: number[]
}

export function StockCard({
  symbol,
  name,
  price = 100,
  change = 0,
  changePercent = 0,
  sector = "",
  sparklineData,
}: StockCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [data, setData] = useState<number[]>([])

  // Generate random sparkline data if none provided
  useEffect(() => {
    if (sparklineData) {
      setData(sparklineData)
      return
    }

    // Generate random data with a trend matching the change percent
    const newData: number[] = []
    let value = price - change * 1.2 // Start a bit lower/higher than current

    for (let i = 0; i < 20; i++) {
      // Add some randomness but maintain the overall trend
      const trend = change / 20
      const randomness = price * 0.01 * (Math.random() - 0.5)
      value += trend + randomness
      newData.push(value)
    }

    setData(newData)
  }, [sparklineData, price, change])

  const isPositive = changePercent >= 0

  return (
    <motion.div whileHover={{ y: -4 }} onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)}>
      <Link href={`/stocks/${symbol}`}>
        <Card className="overflow-hidden h-full border-border hover:border-primary/20 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-medium text-base">{symbol}</div>
                <div className="text-xs text-muted-foreground truncate max-w-[150px]">{name}</div>
              </div>
              <div className="text-lg" title={`${changePercent >= 0 ? "Positive" : "Negative"} trend`}>
                {getPerformanceEmoji(changePercent)}
              </div>
            </div>

            <div className="flex justify-between items-baseline mb-3">
              <div className="text-lg font-medium">${price.toFixed(2)}</div>
              <div
                className={cn(
                  "text-sm flex items-center gap-1",
                  isPositive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500",
                )}
              >
                {isPositive ? <TrendingUpIcon className="h-3 w-3" /> : <TrendingDownIcon className="h-3 w-3" />}
                <span>
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(2)} ({changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="mt-2">
              <PriceSparkline
                data={data}
                width={isHovered ? 220 : 200}
                height={40}
                showTooltip={isHovered}
                lineColor={isPositive ? "#22c55e" : "#ef4444"}
                fillColor={isPositive ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"}
              />
            </div>

            {sector && <div className="mt-2 text-xs text-muted-foreground">Sector: {sector}</div>}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
