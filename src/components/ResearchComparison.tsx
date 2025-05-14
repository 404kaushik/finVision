import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Loader2Icon, TrendingUpIcon, TrendingDownIcon, DollarSignIcon, CalendarIcon, SparklesIcon, LightbulbIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResearchComparisonProps {
  companyName: string
  userId: string
}

export default function ResearchComparison({ companyName, userId }: ResearchComparisonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [investmentAmount, setInvestmentAmount] = useState('1000')
  const [showExplanation, setShowExplanation] = useState(false)

  const fetchComparison = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/compare-research?company=${encodeURIComponent(companyName)}&userId=${userId}&investmentAmount=${investmentAmount}`
      )

      if (!response.ok) throw new Error('Failed to fetch comparison data')
      const data = await response.json()
      setComparisonData(data)
    } catch (err) {
      setError('Failed to load comparison data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (companyName && userId && userId.length > 0) {
      fetchComparison()
    }
  }, [companyName, userId, investmentAmount])

  if (loading) {
    return (
      <Card className="overflow-hidden border">
        <CardContent className="p-6">
          <motion.div 
            className="flex flex-col items-center justify-center py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <SparklesIcon className="text-4xl mb-4 text-primary" />
            </motion.div>
            <p className="text-muted-foreground">Calculating your investment journey...</p>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="overflow-hidden border border-destructive/50 bg-destructive/5">
        <CardContent className="p-6">
          <motion.div 
            className="flex flex-col items-center justify-center py-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchComparison}>Try Again</Button>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  if (!comparisonData) return null

  const isPositive = comparisonData.percentChange >= 0
  const formattedDate = new Date(comparisonData.researchDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <Card className="overflow-hidden border">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-primary/5">
        <CardTitle className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-primary" />
          <span>Your Investment Journey</span>
        </CardTitle>
        <CardDescription>
          See how your investment in {companyName} has performed since {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Investment Amount Input */}
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Try Different Investment Amounts</label>
              <div className="relative">
                <DollarSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="pl-8"
                  min="1"
                />
              </div>
            </div>
          </motion.div>

          {/* Returns Summary */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Current Value</p>
                  <motion.div 
                    className="flex items-baseline gap-2"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  >
                    <span className="text-3xl font-bold">
                      ${comparisonData.currentValue.toFixed(2)}
                    </span>
                    <Badge
                      variant={isPositive ? "default" : "destructive"}
                      className="flex items-center gap-1"
                    >
                      {isPositive ? <TrendingUpIcon className="h-3 w-3" /> : <TrendingDownIcon className="h-3 w-3" />}
                      {comparisonData.percentChange.toFixed(2)}%
                    </Badge>
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Market Comparison</p>
                  <motion.div 
                    className="flex items-baseline gap-2"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.1 }}
                  >
                    <span className="text-xl font-bold">
                      {comparisonData.marketComparison}
                    </span>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Explanation Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <LightbulbIcon className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">What This Means</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {comparisonData.explanation}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}