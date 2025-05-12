"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import Layout from "@/components/Layout"
import { getCompanyResearch } from "@/lib/perplexity"
import { supabase } from "@/utils/supabase/client"
import CompanyChart from "@/components/CompanyChart"
import {
  Loader2Icon,
  NewspaperIcon,
  FileTextIcon,
  BarChart2Icon,
  ShareIcon,
  DownloadIcon,
  LightbulbIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  GlobeIcon,
  ExternalLinkIcon,
  CheckIcon,
  BookmarkIcon,
  BookmarkPlusIcon,
  HelpCircleIcon,
  TrendingDownIcon,
  InfoIcon,
  StarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DollarSignIcon,
  PieChartIcon,
  ZapIcon,
  GitCompareIcon,
} from "lucide-react"
import { FaClock } from "react-icons/fa"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import DeepResearch from "@/components/BeginnerResearch"
import DeepResearchSkeleton from "@/components/DeepResearchSkeleton"
import ResearchComparison from "@/components/ResearchComparison"
// Helper function to get sentiment emoji
const getSentimentEmoji = (sentiment: number): string => {
  if (sentiment >= 80) return "🚀" // Very positive
  if (sentiment >= 60) return "😄" // Positive
  if (sentiment >= 40) return "🙂" // Slightly positive
  if (sentiment >= 20) return "😐" // Neutral
  if (sentiment >= 0) return "🙁" // Slightly negative
  return "😨" // Very negative
}

// Helper function to get performance emoji
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

// Financial terms glossary for beginners
const financialTerms = {
  "P/E Ratio":
    "Price-to-Earnings Ratio: Shows how much investors are willing to pay for each dollar of earnings. Lower can mean better value.",
  EPS: "Earnings Per Share: The company's profit divided by outstanding shares. Higher is generally better.",
  ROE: "Return on Equity: Measures how efficiently a company uses investments to generate earnings. Higher percentages are typically better.",
  "Debt to Equity": "Compares a company's total debt to its shareholder equity. Lower ratios suggest less risk.",
  "Dividend Yield":
    "Annual dividend payment divided by stock price, shown as a percentage. Higher yields provide more income.",
  "Market Cap":
    "The total value of all a company's shares. Larger companies are often more stable but may grow slower.",
  Revenue: "The total income from sales before expenses are subtracted. Growing revenue is usually positive.",
  "Net Income":
    "Profit after all expenses, taxes, and costs are subtracted from revenue. Also called the 'bottom line'.",
  "Total Assets": "Everything the company owns that has value. Includes cash, inventory, property, etc.",
  "Total Liabilities": "Everything the company owes to others. Includes loans, accounts payable, etc.",
  "Current Price": "The most recent price at which the stock traded.",
  Change: "The dollar amount the stock price has changed today.",
  "Change %": "The percentage the stock price has changed today.",
  High: "The highest price the stock reached today.",
  Low: "The lowest price the stock reached today.",
  Open: "The price at which the stock started trading today.",
  "Prev Close": "The final price the stock traded at yesterday.",
}

// Helper function to generate beginner-friendly explanations for metrics
function getMetricExplanation(metricName: string, score: number): string {
  const goodScore = score > 60
  const averageScore = score > 40 && score <= 60

  switch (metricName) {
    case "Revenue Growth":
      return goodScore
        ? "The company is growing its sales at a healthy rate, which is positive."
        : averageScore
          ? "The company's sales are growing at an average pace compared to similar companies."
          : "The company's sales growth is slower than expected, which could be concerning."

    case "Profit Margin":
      return goodScore
        ? "For every dollar of sales, the company keeps a good amount as profit."
        : averageScore
          ? "The company's profit margin is average for its industry."
          : "The company keeps less profit from each sale than similar companies."

    case "Market Share":
      return goodScore
        ? "The company has a strong position in its market compared to competitors."
        : averageScore
          ? "The company has an average share of its market."
          : "The company has a smaller portion of the market than leading competitors."

    case "P/E Ratio":
      return goodScore
        ? "Investors are willing to pay a premium for the company's earnings, showing confidence."
        : averageScore
          ? "The stock is priced reasonably compared to the company's earnings."
          : "The stock may be undervalued compared to the company's earnings."

    case "Debt-to-Equity":
      return goodScore
        ? "The company has a healthy balance between debt and equity financing."
        : averageScore
          ? "The company has an average amount of debt for its industry."
          : "The company has more debt than ideal, which could be risky."

    default:
      return goodScore
        ? "This metric shows positive performance."
        : averageScore
          ? "This metric shows average performance."
          : "This metric shows below-average performance."
  }
}

// Helper function to generate investment summary based on research data
function getInvestmentSummary(research: any): string {
  // Count positive and negative metrics
  let positiveCount = 0
  let negativeCount = 0

  if (research.metrics && research.metrics.length > 0) {
    research.metrics.forEach((metric: any) => {
      if (metric.score > 60) positiveCount++
      else if (metric.score < 40) negativeCount++
    })
  }

  // Count risks and opportunities
  const risksCount = research.risks?.length || 0
  const opportunitiesCount = research.opportunities?.length || 0

  // Generate summary based on counts
  if (positiveCount > negativeCount && opportunitiesCount > risksCount) {
    return `Based on our analysis, ${research.companyName || "this company"} shows strong performance metrics and more opportunities than risks. Many investors would consider this a potentially attractive investment, though all investments carry risk.`
  } else if (positiveCount > negativeCount) {
    return `${research.companyName || "This company"} has several positive performance indicators, but also faces some significant risks. It might be worth considering as part of a diversified portfolio, but be aware of the potential challenges.`
  } else if (opportunitiesCount > risksCount) {
    return `While some current metrics for ${research.companyName || "this company"} are concerning, there appear to be good opportunities for future growth. This might be considered a higher-risk investment with potential for reward.`
  } else {
    return `Our analysis shows some concerns with ${research.companyName || "this company"}'s current performance and future outlook. More cautious investors might want to watch this stock for improvements before investing.`
  }
}

// Missing components
function BookIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  )
}

function GraduationCapIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
  )
}

function XIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export default function ResearchPage() {
  const searchParams = useSearchParams()
  const companyName = searchParams.get("company")
  

  const [research, setResearch] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "financials" | "news" | "deep-research" | "comparison">("overview")
  const [chartData, setChartData] = useState<any>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipContent, setTooltipContent] = useState("")
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingStage, setLoadingStage] = useState("Gathering data")
  const [companyNews, setCompanyNews] = useState<any[]>([])
  const [newsLoading, setNewsLoading] = useState(false)
  const [financialData, setFinancialData] = useState<any>(null)
  const [financialLoading, setFinancialLoading] = useState(false)
  const [financialError, setFinancialError] = useState<string | null>(null)
  const [showGuide, setShowGuide] = useState(false)
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [showGlossary, setShowGlossary] = useState(false)
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)
  const [showBeginnerTips, setShowBeginnerTips] = useState(true)
  const [deepResearchData, setDeepResearchData] = useState<any>(null)
  const [deepResearchSaved, setDeepResearchSaved] = useState(false)
  const [deepResearchLoading, setDeepResearchLoading] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>("")  

  
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error("User not logged in")
      setUserId(user.id)
    }
    getUser()
  }, [])


  // Refs for scroll animations
  const { ref: overviewRef, inView: overviewInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const { ref: metricsRef, inView: metricsInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const { ref: analysisRef, inView: analysisInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  // Add this function to fetch financial data
  const fetchFinancialData = async (company: string) => {
    if (!company) return

    setFinancialLoading(true)
    setFinancialError(null)

    try {
      // Fetch financial data from Finnhub API
      const response = await fetch(`/api/financials?company=${encodeURIComponent(company)}`)

      if (!response.ok) {
        throw new Error("Failed to fetch financial data")
      }

      const data = await response.json()
      setFinancialData(data)

      // Also update chart data with real stock price data if available
      if (data.stockPrices && data.stockPrices.length > 0) {
        const chartLabels = data.stockPrices.map((item: any) => new Date(item.date).toLocaleDateString())
        const chartData = {
          labels: chartLabels,
          datasets: [
            {
              label: "Stock Price",
              data: data.stockPrices.map((item: any) => item.close),
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 2,
            },
          ],
        }

        // Add industry average if available
        if (data.industryAverage && data.industryAverage.length > 0) {
          chartData.datasets.push({
            label: "Industry Average",
            data: data.industryAverage.map((item: any) => item.value),
            borderColor: "rgba(139, 92, 246, 1)",
            borderWidth: 2,
          })
        }

        setChartData(chartData)
      }
    } catch (error) {
      console.error("Error fetching financial data:", error)
      setFinancialError("Failed to load financial data. Please try again.")
    } finally {
      setFinancialLoading(false)
    }
  }

  // Add this function to fetch news
  const fetchCompanyNews = async (company: string) => {
    if (!company) return

    setNewsLoading(true)
    try {
      // Example using Finnhub API
      const response = await fetch(`/api/news?company=${encodeURIComponent(company)}`)

      if (!response.ok) {
        throw new Error("Failed to fetch news")
      }

      const data = await response.json()
      setCompanyNews(data.news || [])
    } catch (error) {
      console.error("Error fetching company news:", error)
      setCompanyNews([])
    } finally {
      setNewsLoading(false)
    }
  }

  // Update useEffect to call this when the tab changes
  useEffect(() => {
    if (activeTab === "news" && companyName) {
      fetchCompanyNews(companyName)
    } else if (activeTab === "financials" && companyName) {
      fetchFinancialData(companyName)
    }
  }, [activeTab, companyName])

  useEffect(() => {
    if (companyName) {
      fetchResearch()
      // Only generate mock data if we don't have real data yet
      if (!chartData) {
        generateMockChartData()
      }

      // Try to get company logo
      setCompanyLogo(`https://logo.clearbit.com/${companyName.toLowerCase().replace(/\s+/g, "")}.com`)
    }
  }, [companyName])

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return prev
          }
          return prev + 10
        })

        // Update loading stage messages
        if (loadingProgress < 30) {
          setLoadingStage("Gathering financial data")
        } else if (loadingProgress < 60) {
          setLoadingStage("Analyzing market trends")
        } else if (loadingProgress < 90) {
          setLoadingStage("Generating insights")
        }
      }, 800)

      return () => clearInterval(interval)
    }
  }, [loading, loadingProgress])

  const generateMockChartData = () => {
    // Generate mock stock price data
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const data = {
      labels,
      datasets: [
        {
          label: "Stock Price",
          data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100) + 50),
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 2,
        },
        {
          label: "Industry Average",
          data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100) + 30),
          borderColor: "rgba(139, 92, 246, 1)",
          borderWidth: 2,
        },
      ],
    }
    setChartData(data)
  }

  const fetchResearch = async () => {
    if (!companyName) return

    setLoading(true)
    setError(null)
    setLoadingProgress(0)

    try {
      // Log the search in Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error("User not logged in")
      console.log(authError)

      // 2. Check if this company has already been saved
      const { data: existing, error: fetchError } = await supabase
      .from("saved_companies")
      .select("company_data, created_at_research, created_at")  // Add created_at to the selection
      .eq("user_id", user.id)
      .eq("company_name", companyName)
      

      if (fetchError) throw fetchError

      if (existing && existing.length > 0) {
        console.log("Loaded from Supabase")
        setSaved(true)
        setLastSavedAt(existing[0].created_at)  // Set the last saved timestamp
      }
        
      // Get research from Perplexity API
      const data = await getCompanyResearch(companyName)

      // Parse JSON from response
      try {
        // Extract the content from the assistant's message
        const content = data.choices[0].message.content
        // Try to parse it as JSON, but have a fallback
        let parsedData
        try {
          parsedData = JSON.parse(content)

          // Add sentiment scores and emojis if they don't exist
          if (parsedData.metrics && parsedData.metrics.length > 0) {
            parsedData.metrics = parsedData.metrics.map((metric: any) => ({
              ...metric,
              emoji: getSentimentEmoji(metric.score || 50),
            }))
          }
        } catch (e) {
          // If it's not valid JSON, just use the text content
          parsedData = {
            overview: content,
            metrics: [],
            analysis: content,
          }
        }
        setResearch(parsedData)        
      } catch (e) {
        setResearch({
          overview: "Failed to parse the research data properly. Please try again.",
          metrics: [],
          analysis: data.choices[0].message.content,
        })
      }
    } catch (err) {
      console.error("Error fetching research:", err)
      setError("Failed to fetch research data. Please try again.")
    } finally {
      setLoadingProgress(100)
      setTimeout(() => setLoading(false), 500) // Small delay for smooth transition
    }
  }

  const saveCompany = async () => {
    setSaving(true)
  
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
  
      if (error || !user) {
        throw new Error("User not logged in")
      }

      const currentTimestamp = new Date().toISOString()

      const { error: upsertError } = await supabase
      .from("saved_companies")
      .upsert(
        {
          user_id: user.id,
          company_name: companyName,
          company_data: research,
          created_at_research: currentTimestamp,
          created_at: currentTimestamp  // Add the current timestamp
        },
        { onConflict: "user_id,company_name" } // avoid duplicate key error
      )

      if (upsertError) throw upsertError
      setSaved(true)
      setLastSavedAt(currentTimestamp)  // Update the last saved timestamp
      setTooltipContent("Company saved to your favorites! ✅")
    } catch (err) {
      console.error("Save error:", err)
      setTooltipContent("Failed to save. Please try again.")
    } finally {
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 3000)
      setSaving(false)
    }
  }
  

  const shareResearch = () => {
    if (navigator.share) {
      navigator.share({
        title: `${companyName} Research`,
        text: `Check out this research on ${companyName}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)

      // Show tooltip
      setTooltipContent("Link copied to clipboard! 📋")
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 3000)
    }
  }

  const downloadPDF = () => {
    // Show tooltip
    setTooltipContent("PDF download started! 📄")
    setShowTooltip(true)
    setTimeout(() => setShowTooltip(false), 3000)
  }

  // Add this function to fetch deep research data
  const fetchDeepResearch = async () => {
    if (!companyName) return
  
    setActiveTab("deep-research")
    setDeepResearchLoading(true)
  
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error("User not logged in")
  
      // ✅ 1. Check if deep research already exists
      const { data, error } = await supabase
        .from("saved_companies")
        .select("deep_research")
        .eq("user_id", user.id)
        .eq("company_name", companyName)

      if (error) throw error

  
      if (data && data.length > 0 && data[0].deep_research) {
        setDeepResearchData(data[0].deep_research)
        setDeepResearchSaved(true)
      } else {
        setDeepResearchData(null) // not saved yet
        setDeepResearchSaved(false)
      }
    } catch (err) {
      console.error("Error fetching deep research:", err)
      setTooltipContent("Error loading deep research.")
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 3000)
    } finally {
      setDeepResearchLoading(false)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY })
  }

  const showTermDefinition = (term: string) => {
    setSelectedTerm(term)
    setShowGlossary(true)
  }

  if (!companyName) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center min-h-[50vh] max-w-md mx-auto text-center"
          >
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <AlertTriangleIcon className="text-yellow-500 h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold mb-4">No company specified</h1>
            <p className="text-muted-foreground mb-8">
              Please search for a company to view detailed research and analysis.
            </p>
            <Button asChild size="lg" className="rounded-full px-8">
              <a href="/">Go to Search</a>
            </Button>
          </motion.div>
        </div>
      </Layout>
    )
  }

  // Custom tab rendering
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-8 mt-6">
            {/* Overview Section */}
            <div ref={overviewRef}>
              <AnimatePresence>
                {overviewInView && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="overflow-hidden border">
                      <CardHeader className="pb-3 bg-muted/30">
                        <CardTitle className="flex items-center gap-2">
                          <FileTextIcon className="h-5 w-5 text-primary" />
                          <span>What is {companyName}?</span>
                        </CardTitle>
                        <CardDescription>A simple explanation of what this company does</CardDescription>
                      </CardHeader>
                      <CardContent className="p-2">
                        <p className="leading-relaxed text-lg">
                          {research.overview || research.summary || "No overview available"}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Metrics Section - Animated bars */}
            {research.metrics && research.metrics.length > 0 && (
              <div ref={metricsRef}>
                <AnimatePresence>
                  {metricsInView && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <Card className="overflow-hidden border">
                        <CardHeader className="pb-3 bg-muted/30">
                          <CardTitle className="flex items-center gap-2">
                            <BarChart2Icon className="h-5 w-5 text-primary" />
                            <span>How is {companyName} performing?</span>
                          </CardTitle>
                          <CardDescription>Key performance indicators with simple explanations</CardDescription>
                        </CardHeader>
                        <CardContent className="p-2">
                          <div className="space-y-6">
                            {research.metrics.map((metric: any, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="space-y-2"
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{metric.name}</span>
                                    <span className="text-lg">{metric.emoji || "📊"}</span>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 rounded-full"
                                            onClick={() => showTermDefinition(metric.name)}
                                          >
                                            <InfoIcon className="h-3 w-3 text-muted-foreground" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-xs">
                                            {financialTerms[metric.name as keyof typeof financialTerms] ||
                                              `${metric.name} is a measure of the company's performance.`}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant={
                                        metric.score > 60 ? "default" : metric.score > 40 ? "outline" : "destructive"
                                      }
                                      className="rounded-full"
                                    >
                                      {metric.score > 60 ? "Good" : metric.score > 40 ? "Average" : "Needs Improvement"}
                                    </Badge>
                                    <span className="font-semibold">{metric.value}</span>
                                  </div>
                                </div>
                                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${metric.score || 50}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={cn(
                                      "h-full rounded-full",
                                      metric.score > 60
                                        ? "bg-green-500"
                                        : metric.score > 40
                                          ? "bg-amber-500"
                                          : "bg-red-500",
                                    )}
                                  ></motion.div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {getMetricExplanation(metric.name, metric.score)}
                                </p>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Analysis Section */}
            <div ref={analysisRef}>
              <AnimatePresence>
                {analysisInView && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Card className="overflow-hidden border">
                      <CardHeader className="pb-3 bg-muted/30">
                        <CardTitle className="flex items-center gap-2">
                          <LightbulbIcon className="h-5 w-5 text-primary" />
                          <span>Expert Analysis</span>
                        </CardTitle>
                        <CardDescription>
                          Detailed breakdown of {companyName}'s performance and prospects
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="2">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="analysis">
                            <AccordionTrigger className="text-lg font-medium">Current Performance</AccordionTrigger>
                            <AccordionContent>
                              <div className="leading-relaxed whitespace-pre-line pt-2 pb-4">
                                {research.analysis || "No detailed analysis available"}
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          {research.outlook && (
                            <AccordionItem value="outlook">
                              <AccordionTrigger className="text-lg font-medium">Future Outlook</AccordionTrigger>
                              <AccordionContent>
                                <div className="leading-relaxed pt-2 pb-4">{research.outlook}</div>
                              </AccordionContent>
                            </AccordionItem>
                          )}
                        </Accordion>
                      </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            

            {/* Risks and Opportunities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {research.risks && research.risks.length && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card className="h-full border border-red-200 dark:border-red-900/30">
                    <CardHeader className="pb-3 bg-red-50 dark:bg-red-900/10">
                      <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertTriangleIcon className="h-5 w-5" />
                        <span>Potential Risks</span>
                      </CardTitle>
                      <CardDescription>Challenges that could affect {companyName}'s performance</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2">
                      <ul className="space-y-4">
                        {research.risks.map((risk: string, index: number) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            <div className="h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0 text-red-600 dark:text-red-400">
                              <ChevronDownIcon className="h-4 w-4" />
                            </div>
                            <span className="text-red-900 dark:text-red-200">{risk}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {research.opportunities && research.opportunities.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Card className="h-full border border-green-200 dark:border-green-900/30">
                    <CardHeader className="pb-3 bg-green-50 dark:bg-green-900/10">
                      <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <LightbulbIcon className="h-5 w-5" />
                        <span>Opportunities</span>
                      </CardTitle>
                      <CardDescription>Positive factors that could help {companyName} grow</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2">
                      <ul className="space-y-4">
                        {research.opportunities.map((opportunity: string, index: number) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0 text-green-600 dark:text-green-400">
                              <ChevronUpIcon className="h-4 w-4" />
                            </div>
                            <span className="text-green-900 dark:text-green-200">{opportunity}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Investment Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="overflow-hidden border bg-gradient-to-br from-primary/65 to-primary/10 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <StarIcon className="h-5 w-5 text-primary" />
                    <span>Should I invest in {companyName}?</span>
                  </CardTitle>
                  <CardDescription>A simple summary for beginners</CardDescription>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <ZapIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Key Takeaway</h3>
                        <p className="text-muted-foreground">{getInvestmentSummary(research)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <DollarSignIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">For Beginners</h3>
                        <p className="text-muted-foreground">
                          Remember that all investments carry risk. This research is just one tool to help you decide.
                          Consider talking to a financial advisor before investing.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )
      case "financials":
        return (
          <div className="space-y-8 mt-6">
            {financialLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2Icon className="animate-spin text-4xl mb-4" />
                <p className="text-muted-foreground">Loading financial data...</p>
              </div>
            ) : financialError ? (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangleIcon className="h-5 w-5" />
                    <span>Error</span>
                  </CardTitle>
                  <CardDescription className="text-destructive/80">
                    We encountered a problem while fetching financial data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{financialError}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="destructive" onClick={() => fetchFinancialData(companyName || "")}>
                    Try Again
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <>
                {/* Stock Price Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="overflow-hidden border">
                    <CardHeader className="pb-3 bg-muted/30">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUpIcon className="h-5 w-5 text-primary" />
                        <span>Stock Price History</span>
                      </CardTitle>
                      <CardDescription>How {companyName}'s stock price has changed over time</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">What am I looking at?</h3>
                          <p className="text-sm text-muted-foreground">
                            This chart shows how much one share of {companyName} stock costs over time.
                            <strong> Going up</strong> means the stock is gaining value, <strong>going down</strong>{" "}
                            means it's losing value. The purple line shows how similar companies are performing for
                            comparison.
                          </p>
                        </div>
                        <div className="h-80 w-full">
                          {chartData ? (
                            <CompanyChart data={chartData} title={`${companyName} Stock Price`} />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-muted-foreground">No chart data available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Financial Metrics */}
                {financialData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <Card className="overflow-hidden border">
                      <CardHeader className="pb-3 bg-muted/30">
                        <CardTitle className="flex items-center gap-2">
                          <BarChart2Icon className="h-5 w-5 text-primary" />
                          <span>Financial Health Check</span>
                        </CardTitle>
                        <CardDescription>
                          Key numbers that show how financially healthy {companyName} is
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Key Ratios */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium">Important Ratios</h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowGlossary(false)}
                                className="text-xs flex items-center gap-1"
                              >
                                <BookIcon className="h-3 w-3" />
                                <span>What do these mean?</span>
                              </Button>
                            </div>
                            {financialData.ratios ? (
                              <div className="space-y-3">
                                {Object.entries(financialData.ratios).map(
                                  ([key, value]: [string, any], index: number) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.3, delay: index * 0.05 }}
                                      className="group"
                                    >
                                      <div
                                        className="flex justify-between items-center p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors cursor-help"
                                        onClick={() => showTermDefinition(key)}
                                      >
                                        <span className="font-medium flex items-center gap-1">
                                          {key}
                                          <InfoIcon className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </span>
                                        <span className="font-semibold">{value}</span>
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1 ml-3 hidden group-hover:block">
                                        {financialTerms[key as keyof typeof financialTerms] ||
                                          `${key} is a financial metric used to evaluate company performance.`}
                                      </div>
                                    </motion.div>
                                  ),
                                )}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">No ratio data available</p>
                            )}
                          </div>

                          {/* Latest Financials */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium">Latest Numbers</h3>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1">
                                      <PieChartIcon className="h-3 w-3" />
                                      <span>What are these?</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>
                                      These are the most recent financial figures reported by {companyName}. They show
                                      how much money the company is making and spending.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            {financialData.financials ? (
                              <div className="space-y-3">
                                {Object.entries(financialData.financials).map(
                                  ([key, value]: [string, any], index: number) => {
                                    // Determine if the value is positive or negative for styling
                                    const isPositive = typeof value === "number" && value > 0
                                    const isNegative = typeof value === "number" && value < 0

                                    return (
                                      <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="group"
                                      >
                                        <div
                                          className="flex justify-between items-center p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors cursor-help"
                                          onClick={() => showTermDefinition(key)}
                                        >
                                          <span className="font-medium flex items-center gap-1">
                                            {key}
                                            <InfoIcon className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </span>
                                          <span
                                            className={cn(
                                              "font-semibold",
                                              isPositive && "text-green-600 dark:text-green-500",
                                              isNegative && "text-red-600 dark:text-red-500",
                                            )}
                                          >
                                            {typeof value === "number"
                                              ? new Intl.NumberFormat("en-US", {
                                                  style: "currency",
                                                  currency: "USD",
                                                  notation: "compact",
                                                  maximumFractionDigits: 2,
                                                }).format(value)
                                              : value}
                                          </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1 ml-3 hidden group-hover:block">
                                          {financialTerms[key as keyof typeof financialTerms] ||
                                            `${key} is a financial metric used to evaluate company performance.`}
                                        </div>
                                      </motion.div>
                                    )
                                  },
                                )}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">No financial data available</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Market Data */}
                {financialData && financialData.marketData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Card className="overflow-hidden border">
                      <CardHeader className="pb-3 bg-muted/30">
                        <CardTitle className="flex items-center gap-2">
                          <GlobeIcon className="h-5 w-5 text-primary" />
                          <span>Today's Trading</span>
                        </CardTitle>
                        <CardDescription>How {companyName}'s stock is performing in the market today</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(financialData.marketData).map(
                            ([key, value]: [string, any], index: number) => {
                              // Format the display based on the type of data
                              let displayValue = value
                              let icon = null

                              if (key.toLowerCase().includes("change") || key.toLowerCase().includes("percent")) {
                                const numValue = Number.parseFloat(value)
                                const isPositive = numValue > 0
                                displayValue = `${isPositive ? "+" : ""}${numValue.toFixed(2)}%`
                                icon = isPositive ? (
                                  <TrendingUpIcon className="h-3 w-3 text-green-600 dark:text-green-500" />
                                ) : (
                                  <TrendingDownIcon className="h-3 w-3 text-red-600 dark:text-red-500" />
                                )
                              }

                              return (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: index * 0.05 }}
                                  className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-help"
                                  onClick={() => showTermDefinition(key)}
                                >
                                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                    {key}
                                    <InfoIcon className="h-3 w-3 opacity-50" />
                                  </p>
                                  <p className="text-xl font-semibold flex items-center gap-1">
                                    {icon}
                                    {displayValue}
                                  </p>
                                </motion.div>
                              )
                            },
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Beginner's Guide to Financials */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="overflow-hidden border bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCapIcon className="h-5 w-5 text-primary" />
                        <span>Understanding Financial Data</span>
                      </CardTitle>
                      <CardDescription>A simple guide for beginners</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="stock-price">
                          <AccordionTrigger>What does the stock price tell me?</AccordionTrigger>
                          <AccordionContent>
                            <p className="py-2">
                              The stock price shows how much it costs to buy one share of the company. When people think
                              the company will do well, they buy more shares and the price goes up. When they're worried
                              about the company's future, they sell shares and the price goes down.
                            </p>
                            <p className="py-2">
                              Remember: A higher stock price doesn't always mean a "better" company. Large, established
                              companies might have lower prices but be more stable investments.
                            </p>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="ratios">
                          <AccordionTrigger>What are financial ratios?</AccordionTrigger>
                          <AccordionContent>
                            <p className="py-2">
                              Financial ratios are tools that help you compare companies of different sizes. They're
                              like grades on a report card for the company's financial health.
                            </p>
                            <p className="py-2">
                              For example, the P/E Ratio (Price to Earnings) tells you how much investors are willing to
                              pay for each dollar of profit. A lower P/E might mean the stock is undervalued
                              (potentially a good deal).
                            </p>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="revenue">
                          <AccordionTrigger>What's the difference between Revenue and Profit?</AccordionTrigger>
                          <AccordionContent>
                            <p className="py-2">
                              <strong>Revenue</strong> is all the money a company brings in from selling its products or
                              services. It's like your total paycheck before any deductions.
                            </p>
                            <p className="py-2">
                              <strong>Profit</strong> (or Net Income) is what's left after paying all expenses, costs,
                              and taxes. It's like your take-home pay after all deductions.
                            </p>
                            <p className="py-2">
                              A company can have huge revenue but still lose money if its expenses are too high.
                            </p>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="good-investment">
                          <AccordionTrigger>How do I know if this is a good investment?</AccordionTrigger>
                          <AccordionContent>
                            <p className="py-2">
                              There's no single number that tells you if a stock is a good investment. Instead, look at:
                            </p>
                            <ul className="list-disc pl-6 py-2 space-y-1">
                              <li>Is the company growing its revenue and profits?</li>
                              <li>Does it have more assets than debts?</li>
                              <li>Is it performing better than similar companies?</li>
                              <li>Do you understand and believe in what the company does?</li>
                              </ul>
                            <p className="py-2">
                              Remember: Past performance doesn't guarantee future results, and it's usually best to
                              invest in multiple companies rather than just one.
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </div>
        )
      case "news":
        return (
          <div className="space-y-8 mt-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="overflow-hidden border">
                <CardHeader className="pb-3 bg-muted/30">
                  <CardTitle className="flex items-center gap-2">
                    <NewspaperIcon className="h-5 w-5 text-primary" />
                    <span>Latest News</span>
                  </CardTitle>
                  <CardDescription>Recent news articles and events related to {companyName}</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-muted/30 p-4 rounded-lg mb-6">
                    <h3 className="font-medium mb-2">Why news matters for stocks</h3>
                    <p className="text-sm text-muted-foreground">
                      News can have a big impact on stock prices. Good news (like strong earnings or new products) often
                      makes prices go up, while bad news (like missed targets or legal issues) can make prices fall. The
                      "sentiment" indicator shows if the news is likely positive or negative for the company.
                    </p>
                  </div>

                  {newsLoading ? (
                    <div className="flex flex-col items-center py-10">
                      <Loader2Icon className="animate-spin text-2xl mb-4" />
                      <p>Loading latest news...</p>
                    </div>
                  ) : companyNews && companyNews.length > 0 ? (
                    <div className="space-y-4">
                      {companyNews.map((news, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="group"
                        >
                          <Card
                            className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group-hover:shadow-md"
                            onClick={() => window.open(news.url, "_blank")}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                {news.image && (
                                  <img
                                    src={news.image || "/placeholder.svg"}
                                    alt={news.headline}
                                    className="w-20 h-20 object-cover rounded-md"
                                    onError={(e) => {
                                      e.currentTarget.src = "/placeholder.svg?height=80&width=80"
                                    }}
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium group-hover:text-primary transition-colors">
                                      {news.headline}
                                    </h3>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{news.summary}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(news.datetime).toLocaleDateString()} • {news.source}
                                    </span>
                                    <div className="flex items-center gap-1 text-sm">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger className="flex items-center gap-1">
                                            <span className="text-xs text-muted-foreground">Sentiment: </span> 
                                            <span className="text-base" title={news.sentiment?.label || "Neutral"}>
                                              {news.sentiment?.emoji || "📊"}
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>
                                              {news.sentiment?.label || "Neutral"} sentiment -
                                              {news.sentiment?.label === "Positive"
                                                ? " This news might be good for the stock price"
                                                : news.sentiment?.label === "Negative"
                                                  ? " This news might be bad for the stock price"
                                                  : " This news might not affect the stock price much"}
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                    <span className="text-xs flex items-center gap-1 text-primary">
                                      Read more <ExternalLinkIcon size={10} />
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No recent news found for {companyName}.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )
      case "deep-research":
        return (
          <div className="space-y-8 mt-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="overflow-hidden border">
              <CardHeader className="pb-4 bg-gradient-to-r from-primary/10 to-primary/5 space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ZapIcon className="h-5 w-5 text-primary" />
                    <CardTitle>Sonar Deep Research</CardTitle>
                    <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                      PREMIUM
                    </Badge>
                  </div>
                  
                </div>
                <CardDescription>
                  AI-powered comprehensive analysis of {companyName} using advanced models
                </CardDescription>
              </CardHeader>

                <CardContent className="p-6">
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <DeepResearchSkeleton />
                      </motion.div>
                    ) : (
                      <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <DeepResearch companyName={companyName || ""} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
                <CardFooter className="border-t p-4 bg-muted/10">
                  <div className="w-full text-xs text-muted-foreground">
                    <p className="flex items-center gap-1">
                      <InfoIcon className="h-3 w-3" />
                      <span>
                        Deep Research uses Perplexity's sonar-deep-research model to generate comprehensive analysis.
                        This may take a moment to complete.
                      </span>
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        )
      case "comparison":
        return (
          <div className="space-y-8 mt-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="overflow-hidden border">
                <CardHeader className="pb-4 bg-gradient-to-r from-primary/10 to-primary/5 space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <GitCompareIcon className="h-5 w-5 text-primary" />
                      <CardTitle>Investment Comparison</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResearchComparison companyName={companyName || ""} userId={userId || ""} />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8" onMouseMove={handleMouseMove}>
        {/* Floating tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed z-50 bg-card p-3 rounded-lg shadow-lg border"
              style={{
                left: tooltipPosition.x + 10,
                top: tooltipPosition.y - 40,
                maxWidth: "250px",
              }}
            >
              {tooltipContent}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Financial Term Glossary Dialog */}
        <Dialog open={showGlossary} onOpenChange={setShowGlossary}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookIcon className="h-5 w-5 text-primary" />
                <span>Financial Term Glossary</span>
              </DialogTitle>
              <DialogDescription>
                {selectedTerm ? `Definition of ${selectedTerm}` : "Common financial terms explained in simple language"}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedTerm ? (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{selectedTerm}</h3>
                  <p>{financialTerms[selectedTerm as keyof typeof financialTerms]}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(financialTerms).map(([term, definition]) => (
                    <div key={term} className="space-y-1">
                      <h3 className="font-medium">{term}</h3>
                      <p className="text-sm text-muted-foreground">{definition}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowGlossary(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col space-y-8 py-20">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
                {companyLogo ? (
                  <img
                    src={companyLogo || "/placeholder.svg"}
                    alt={`${companyName} logo`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `/placeholder.svg?height=64&width=64`
                    }}
                  />
                ) : (
                  <BarChart2Icon className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">{companyName}</h1>
                <p className="text-muted-foreground">Financial Research & Analysis</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => setShowGuide(true)} className="rounded-full">
                      <HelpCircleIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Research guide</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowGlossary(false)}
                      className="rounded-full"
                    >
                      <BookIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Financial glossary</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button variant="outline" size="icon" onClick={shareResearch} className="rounded-full">
                <ShareIcon className="h-4 w-4" />
              </Button>

              <Button variant="outline" size="icon" onClick={downloadPDF} className="rounded-full">
                <DownloadIcon className="h-4 w-4" />
              </Button>       

              <Button
                onClick={saveCompany}
                disabled={saving || saved || loading}
                className={cn("gap-2 rounded-full px-6", saved && "bg-muted text- border-2 hover:bg-muted/80")}
              >
                {saving ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <BookmarkIcon className="h-4 w-4" />
                ) : (
                  <BookmarkPlusIcon className="h-4 w-4" />
                )}
                <span>{saved ? "Saved" : saving ? "Saving..." : "Save Research"}</span>
                {saved && <CheckIcon className="h-4 w-4 text-green-500" />}
              </Button>

              {lastSavedAt && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <FaClock className="text-primary/70" />
                  <span>
                    Last saved {new Date(lastSavedAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </motion.div>
              )}
              {/* Add the timestamp display */}

              <Button
                className="bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 gap-2 rounded-full px-6"
                onClick={fetchDeepResearch}
              >
                <ZapIcon className="h-4 w-4" />
                <span>Deep Research</span>
              </Button>
            </div>
          </motion.div>

          {/* Beginner Tips Banner */}
          <AnimatePresence>
            {showBeginnerTips && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 rounded-full p-2 mt-1">
                        <LightbulbIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">New to Stock Research?</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowBeginnerTips(false)}
                            className="h-8 w-8 p-0 rounded-full"
                          >
                            <span className="sr-only">Close</span>
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          This page shows you important information about {companyName}. Here's how to use it:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                          <div className="flex items-start gap-2">
                            <div className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center text-primary font-medium">
                              1
                            </div>
                            <p className="text-sm">
                              <span className="font-medium">Overview</span>: Learn what the company does and how it's
                              performing
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center text-primary font-medium">
                              2
                            </div>
                            <p className="text-sm">
                              <span className="font-medium">Financials</span>: See numbers that show the company's
                              health
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center text-primary font-medium">
                              3
                            </div>
                            <p className="text-sm">
                              <span className="font-medium">News</span>: Read recent stories that might affect the stock
                              price
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <InfoIcon className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Hover over any financial term to see a simple explanation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Research Guide Dialog */}
          <Dialog open={showGuide} onOpenChange={setShowGuide}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <GraduationCapIcon className="h-5 w-5 text-primary" />
                  <span>Stock Research Guide</span>
                </DialogTitle>
                <DialogDescription>A beginner-friendly guide to understanding company research</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileTextIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Company Overview</h3>
                    <p className="text-sm text-muted-foreground">
                      This section explains what the company does, what products they sell, and their position in the
                      market. Think of it as the company's "resume."
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BarChart2Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Key Metrics</h3>
                    <p className="text-sm text-muted-foreground">
                      These are important numbers that show how well the company is doing. The colored bars show if the
                      numbers are good (longer green bars) or concerning (shorter red bars).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUpIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Stock Chart</h3>
                    <p className="text-sm text-muted-foreground">
                      This graph shows how the stock price has changed over time. Going up means the stock is gaining
                      value, going down means it's losing value.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <LightbulbIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Analysis & Outlook</h3>
                    <p className="text-sm text-muted-foreground">
                      This is expert opinion on how the company is performing and what might happen in the future. It
                      includes potential risks and opportunities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <NewspaperIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">News & Events</h3>
                    <p className="text-sm text-muted-foreground">
                      Recent news articles about the company. News can affect stock prices - good news often makes
                      prices go up, while bad news can make them go down.
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowGuide(false)}>Got it</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Custom Tabs Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full"
          >
            <div className="grid w-full grid-cols-5 rounded-xl p-1 bg-muted/30">
              <button
                onClick={() => setActiveTab("overview")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-sm font-medium transition-all",
                  activeTab === "overview"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50",
                )}
              >
                <FileTextIcon className="h-4 w-4" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab("financials")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-sm font-medium transition-all",
                  activeTab === "financials"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50",
                )}
              >
                <BarChart2Icon className="h-4 w-4" />
                <span>Financials</span>
              </button>
              <button
                onClick={() => setActiveTab("news")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-sm font-medium transition-all",
                  activeTab === "news"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50",
                )}
              >
                <NewspaperIcon className="h-4 w-4" />
                <span>News</span>
              </button>
              <button
                onClick={() => setActiveTab("deep-research")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-sm font-medium transition-all",
                  activeTab === "deep-research"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50",
                )}
              >
                <ZapIcon className="h-4 w-4" />
                <span>Deep Research</span>
              </button>
              <button
                onClick={() => setActiveTab("comparison")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-sm font-medium transition-all",
                  activeTab === "comparison"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50",
                )}
              >
                <GitCompareIcon className="h-4 w-4" />
                <span>Comparison</span>
              </button>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-24 h-24 mb-6"
              >
                <Loader2Icon className="animate-spin text-4xl absolute inset-0 m-auto" />
                <svg className="w-24 h-24" viewBox="0 0 100 100">
                  <circle
                    className="text-muted"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                  />
                  <motion.circle
                    initial={{ strokeDashoffset: 283 }}
                    animate={{ strokeDashoffset: 283 - (loadingProgress / 100) * 283 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-primary"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    strokeDasharray="283"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <p className="text-xl text-muted-foreground mb-2">
                  Researching {companyName}... {loadingProgress}%
                </p>
                <p className="text-sm text-muted-foreground mb-4 text-center">{loadingStage} ✨</p>
                <Progress value={loadingProgress} className="w-64" />
              </motion.div>
            </div>
          ) : error ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="border-destructive/50 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangleIcon className="h-5 w-5" />
                    <span>Error</span>
                  </CardTitle>
                  <CardDescription className="text-destructive/80">
                    We encountered a problem while fetching research data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{error}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="destructive" onClick={fetchResearch}>
                    Try Again
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ) : research ? (
            renderTabContent()
          ) : null}

          <div className="text-sm text-muted-foreground italic mt-4 text-center">
            Data provided by AI research. Information may not be completely accurate or up-to-date.
          </div>
        </div>
      </div>
    </Layout>
  )
}
