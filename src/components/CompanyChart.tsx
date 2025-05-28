"use client"
import { useState } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  Filler,
  RadialLinearScale,
  ArcElement,
} from "chart.js"
import { Line, Bar, Radar, Doughnut } from "react-chartjs-2"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Radar as RadarIcon,
  Sparkles,
  Activity,
  Zap
} from "lucide-react"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  ArcElement,
)

type ChartType = "line" | "bar" | "radar" | "doughnut"

type CompanyChartProps = {
  title: string
  data: any
  defaultType?: ChartType
  subtitle?: string
  trend?: "up" | "down" | "neutral"
  value?: string
}

const chartIcons = {
  line: TrendingUp,
  bar: BarChart3,
  radar: RadarIcon,
  doughnut: PieChart,
}

const chartLabels = {
  line: "Trend",
  bar: "Compare",
  radar: "Multi-axis",
  doughnut: "Distribution",
}

const CompanyChart = ({ 
  title, 
  data, 
  defaultType = "line", 
  subtitle,
  trend = "neutral",
  value 
}: CompanyChartProps) => {
  const [chartType, setChartType] = useState<ChartType>(defaultType)
  const [isHovered, setIsHovered] = useState(false)

  const getGradient = (ctx: any, chartArea: any, colorStart: string, colorEnd: string) => {
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
    gradient.addColorStop(0, colorStart)
    gradient.addColorStop(1, colorEnd)
    return gradient
  }

  const enhancedData = {
    ...data,
    datasets: data.datasets?.map((dataset: any, index: number) => {
      const colors = [
        { border: 'rgb(99, 102, 241)', bg: 'rgba(99, 102, 241, 0.1)', hover: 'rgba(99, 102, 241, 0.8)' },
        { border: 'rgb(168, 85, 247)', bg: 'rgba(168, 85, 247, 0.1)', hover: 'rgba(168, 85, 247, 0.8)' },
        { border: 'rgb(236, 72, 153)', bg: 'rgba(236, 72, 153, 0.1)', hover: 'rgba(236, 72, 153, 0.8)' },
        { border: 'rgb(34, 197, 94)', bg: 'rgba(34, 197, 94, 0.1)', hover: 'rgba(34, 197, 94, 0.8)' },
      ]
      
      const color = colors[index % colors.length]
      
      return {
        ...dataset,
        borderColor: color.border,
        backgroundColor: chartType === 'line' ? color.bg : color.border,
        hoverBackgroundColor: color.hover,
        borderWidth: chartType === 'line' ? 3 : 2,
        pointBackgroundColor: color.border,
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: color.border,
        pointRadius: chartType === 'line' ? 6 : 4,
        pointHoverRadius: chartType === 'line' ? 8 : 6,
        fill: chartType === 'line',
        tension: 0.4,
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
        display: chartType !== 'doughnut',
        position: "top" as const,
        labels: {
          color: 'hsl(var(--foreground))',
          font: {
            size: 14,
            weight: '500',
            family: "'Inter', sans-serif",
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'hsl(var(--popover))',
        titleColor: 'hsl(var(--popover-foreground))',
        bodyColor: 'hsl(var(--popover-foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        padding: 16,
        cornerRadius: 12,
        displayColors: true,
        usePointStyle: true,
        titleFont: {
          size: 14,
          weight: '600',
        },
        bodyFont: {
          size: 13,
          weight: '500',
        },
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      },
    },
    scales: chartType !== "doughnut" && chartType !== "radar" ? {
      x: {
        border: {
          display: false,
        },
        grid: {
          display: true,
          color: 'hsl(var(--border))',
          lineWidth: 1,
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 12,
            weight: '500',
          },
          padding: 10,
        },
      },
      y: {
        border: {
          display: false,
        },
        grid: {
          display: true,
          color: 'hsl(var(--border))',
          lineWidth: 1,
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 12,
            weight: '500',
          },
          padding: 10,
        },
      },
    } : chartType === "radar" ? {
      r: {
        angleLines: {
          color: 'hsl(var(--border))',
        },
        grid: {
          color: 'hsl(var(--border))',
        },
        pointLabels: {
          color: 'hsl(var(--foreground))',
          font: {
            size: 12,
            weight: '500',
          },
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          backdropColor: 'transparent',
        },
      },
    } : undefined,
    elements: {
      point: {
        radius: 0,
        hoverRadius: 8,
        borderWidth: 3,
      },
      bar: {
        borderRadius: 8,
        borderSkipped: false,
      },
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutCubic' as const,
    },
  }

  const renderChart = () => {
    const chartProps = {
      options: chartOptions,
      data: enhancedData,
      height: 350,
    }

    switch (chartType) {
      case "line":
        return <Line {...chartProps} data={enhancedData as any} options={chartOptions as any} />
      case "bar":
        return <Bar {...chartProps} data={enhancedData as any} options={chartOptions as any}/>
      case "radar":
        return <Radar {...chartProps} data={enhancedData as any} options={chartOptions as any}/>
      case "doughnut":
        return <Doughnut {...chartProps} data={enhancedData as any} options={chartOptions as any}/>
      default:
        return <Line {...chartProps} data={enhancedData as any} options={chartOptions as any}/>
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <Activity className="h-4 w-4 text-red-500" />
      default:
        return <Zap className="h-4 w-4 text-blue-500" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800'
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-pink-500/5"
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Sparkle effect */}
        <motion.div
          className="absolute top-4 right-4 text-violet-400"
          animate={{
            scale: isHovered ? 1.2 : 1,
            rotate: isHovered ? 180 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <Sparkles className="h-5 w-5" />
        </motion.div>

        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                {title}
              </CardTitle>
              {subtitle && (
                <p className="text-sm text-muted-foreground font-medium">
                  {subtitle}
                </p>
              )}
              {value && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">{value}</span>
                  <Badge variant="outline" className={getTrendColor()}>
                    {getTrendIcon()}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          {/* Chart type selector */}
          <div className="flex items-center gap-2 pt-4">
            <span className="text-sm font-medium text-muted-foreground mr-2">View:</span>
            {(Object.keys(chartIcons) as ChartType[]).map((type) => {
              const Icon = chartIcons[type]
              const isActive = chartType === type
              
              return (
                <motion.div key={type} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType(type)}
                    className={`
                      relative overflow-hidden transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25' 
                        : 'hover:bg-muted/50'
                      }
                    `}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline font-medium">
                        {chartLabels[type]}
                      </span>
                    </span>
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          <motion.div 
            className="h-[350px] relative"
            key={chartType}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={chartType}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {renderChart()}
              </motion.div>
            </AnimatePresence>
            
            {/* Subtle glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-violet-500/5 to-transparent pointer-events-none rounded-lg"
              animate={{
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default CompanyChart

