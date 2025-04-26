"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PriceSparkline } from "./PriceSparkline"
import { getPerformanceEmoji } from "@/lib/stockUtiils"
import { motion } from "framer-motion"
import Link from "next/link"

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

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={`/stocks/${symbol}`}>
        <Card className="overflow-hidden h-full">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-bold text-lg">{symbol}</div>
                <div className="text-xs text-muted-foreground truncate max-w-[150px]">{name}</div>
              </div>
              <div className="text-2xl" title={`${changePercent >= 0 ? "Positive" : "Negative"} trend`}>
                {getPerformanceEmoji(changePercent)}
              </div>
            </div>

            <div className="flex justify-between items-baseline mb-3">
              <div className="text-lg font-semibold">${price.toFixed(2)}</div>
              <div className={`text-sm ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                {change >= 0 ? "+" : ""}
                {change.toFixed(2)} ({changePercent >= 0 ? "+" : ""}
                {changePercent.toFixed(2)}%)
              </div>
            </div>

            <div className="mt-2">
              <PriceSparkline data={data} width={isHovered ? 220 : 200} height={50} showTooltip={isHovered} />
            </div>

            {sector && <div className="mt-2 text-xs text-muted-foreground">Sector: {sector}</div>}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
