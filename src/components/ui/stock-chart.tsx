import * as React from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface StockChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      borderColor?: string
      backgroundColor?: string
    }>
  }
  title?: string
  subtitle?: string
  trend?: "up" | "down" | "neutral"
  value?: string
}

export function StockChart({
  data,
  title = "Stock Price",
  subtitle,
  trend = "neutral",
  value,
  className,
  ...props
}: StockChartProps) {
  const enhancedData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => {
      const colors = [
        { border: 'hsl(var(--primary))', bg: 'hsl(var(--primary) / 0.1)' },
        { border: 'hsl(var(--secondary))', bg: 'hsl(var(--secondary) / 0.1)' },
        { border: 'hsl(var(--accent))', bg: 'hsl(var(--accent) / 0.1)' },
      ]
      
      const color = colors[index % colors.length]
      
      return {
        ...dataset,
        borderColor: dataset.borderColor || color.border,
        backgroundColor: dataset.backgroundColor || color.bg,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: color.border,
        pointBorderColor: 'hsl(var(--background))',
        pointHoverBackgroundColor: 'hsl(var(--background))',
        pointHoverBorderColor: color.border,
        tension: 0.4,
        fill: true,
      }
    })
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: 'hsl(var(--foreground))',
          font: {
            size: 12,
            weight: '500',
          },
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'hsl(var(--popover))',
        titleColor: '#ffff',
        bodyColor: 'hsl(var(--popover-foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        usePointStyle: true,
        titleFont: {
          size: 13,
          weight: '600',
        },
        bodyFont: {
          size: 12,
          weight: '400',
        },
      },
    },
    scales: {
      x: {
        border: {
          display: false,
        },
        grid: {
          display: true,
          color: 'hsl(var(--border) / 0.5)',
          lineWidth: 1,
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 11,
            weight: '400',
          },
          padding: 8,
          maxRotation: 0,
        },
      },
      y: {
        border: {
          display: false,
        },
        grid: {
          display: true,
          color: 'hsl(var(--border) / 0.5)',
          lineWidth: 1,
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 11,
            weight: '400',
          },
          padding: 8,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-emerald-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-rose-500" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900'
      case 'down':
        return 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/50 dark:border-blue-900'
    }
  }

  return (
    <Card className={cn("overflow-hidden border shadow-sm", className)} {...props}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          {value && (
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold">{value}</span>
              <Badge variant="outline" className={cn("flex items-center gap-1", getTrendColor())}>
                {getTrendIcon()}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <motion.div 
          className="h-[300px] w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Line 
            data={enhancedData} 
            options={chartOptions as any}                           
          />
        </motion.div>
      </CardContent>
    </Card>
  )
}