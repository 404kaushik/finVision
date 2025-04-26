"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface PriceSparklineProps {
  data?: number[]
  width?: number
  height?: number
  lineColor?: string
  fillColor?: string
  showTooltip?: boolean
  animate?: boolean
}

export function PriceSparkline({
  data = [],
  width = 100,
  height = 30,
  lineColor = "currentColor",
  fillColor = "rgba(59, 130, 246, 0.2)",
  showTooltip = false,
  animate = true,
}: PriceSparklineProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const [generatedData, setGeneratedData] = useState<number[]>([])

  // Generate random data if none provided
  useEffect(() => {
    if (data.length > 0) {
      setGeneratedData(data)
      return
    }

    // Generate random data with a slight trend
    const newData: number[] = []
    let value = 50 + Math.random() * 50
    for (let i = 0; i < 20; i++) {
      value += Math.random() * 10 - 5
      value = Math.max(10, Math.min(100, value))
      newData.push(value)
    }
    setGeneratedData(newData)
  }, [data])

  if (generatedData.length === 0) {
    return <div style={{ width, height }} className="bg-muted/30 animate-pulse rounded" />
  }

  // Calculate min and max for scaling
  const minValue = Math.min(...generatedData)
  const maxValue = Math.max(...generatedData)
  const range = maxValue - minValue

  // Generate SVG path
  const points = generatedData.map((value, i) => {
    const x = (i / (generatedData.length - 1)) * width
    const y = height - ((value - minValue) / range) * height
    return { x, y, value }
  })

  const linePath = points.map((point, i) => `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")

  // Generate area path (fill below the line)
  const areaPath = [
    ...points.map((point, i) => `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`),
    `L ${width} ${height}`,
    `L 0 ${height}`,
    "Z",
  ].join(" ")

  // Determine if trend is positive
  const isPositive = generatedData[generatedData.length - 1] >= generatedData[0]
  const actualLineColor =
    lineColor === "currentColor" ? (isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)") : lineColor
  const actualFillColor =
    fillColor === "rgba(59, 130, 246, 0.2)"
      ? isPositive
        ? "rgba(34, 197, 94, 0.2)"
        : "rgba(239, 68, 68, 0.2)"
      : fillColor

  return (
    <div style={{ width, height }} className="relative">
      <svg width={width} height={height} className="overflow-visible">
        {/* Area under the curve */}
        <motion.path
          d={areaPath}
          fill={actualFillColor}
          initial={animate ? { opacity: 0 } : undefined}
          animate={animate ? { opacity: 1 } : undefined}
          transition={{ duration: 1 }}
        />

        {/* Line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke={actualLineColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          initial={animate ? { pathLength: 0 } : undefined}
          animate={animate ? { pathLength: 1 } : undefined}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Interactive points */}
        {showTooltip &&
          points.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={hoveredPoint === i ? 3 : 0}
              fill={actualLineColor}
              stroke="white"
              strokeWidth={1}
              onMouseEnter={() => setHoveredPoint(i)}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{ cursor: "pointer", transition: "r 0.2s ease" }}
            />
          ))}

        {/* Tooltip */}
        {showTooltip && hoveredPoint !== null && (
          <g>
            <rect
              x={points[hoveredPoint].x - 25}
              y={points[hoveredPoint].y - 25}
              width={50}
              height={20}
              rx={4}
              fill="rgba(0,0,0,0.8)"
              stroke="rgba(255,255,255,0.2)"
            />
            <text
              x={points[hoveredPoint].x}
              y={points[hoveredPoint].y - 12}
              textAnchor="middle"
              fontSize={10}
              fill="white"
            >
              {points[hoveredPoint].value.toFixed(2)}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
