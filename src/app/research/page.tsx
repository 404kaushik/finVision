"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Layout from "@/components/Layout"
import { getCompanyResearch } from "@/lib/perplexity"
import {
  FaStar,
  FaSpinner,
  FaNewspaper,
  FaFileAlt,
  FaChartBar,
  FaShareAlt,
  FaDownload,
  FaLightbulb,
  FaExclamationTriangle,
  FaChartLine,
} from "react-icons/fa"
import { supabase } from "@/lib/supabase"
import CompanyChart from "@/components/CompanyChart"
import { FaExternalLinkAlt } from "react-icons/fa"

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

export default function ResearchPage() {
  const searchParams = useSearchParams()
  const companyName = searchParams.get("company")

  const [research, setResearch] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "financials" | "news">("overview")
  const [chartData, setChartData] = useState<any>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipContent, setTooltipContent] = useState("")
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingStage, setLoadingStage] = useState("Gathering data")
  const [companyNews, setCompanyNews] = useState<any[]>([])
  const [newsLoading, setNewsLoading] = useState(false)

  // Add this function to fetch news
  const fetchCompanyNews = async (company: string) => {
    if (!company) return
    
    setNewsLoading(true)
    try {
      // Example using Finnhub API
      const response = await fetch(`/api/news?company=${encodeURIComponent(company)}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }
      
      const data = await response.json()
      setCompanyNews(data.news || [])
    } catch (error) {
      console.error('Error fetching company news:', error)
      setCompanyNews([])
    } finally {
      setNewsLoading(false)
    }
  }

  // Update your useEffect to call this when the tab changes
  useEffect(() => {
    if (activeTab === 'news' && companyName) {
      fetchCompanyNews(companyName)
    }
  }, [activeTab, companyName])

  useEffect(() => {
    if (companyName) {
      fetchResearch()
      generateMockChartData()
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
      const { data: user } = await supabase.auth.getUser()
      if (user?.user) {
        await supabase.from("searches").insert({
          user_id: user.user.id,
          company_name: companyName,
        })
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
      const { data: user } = await supabase.auth.getUser()
      if (user?.user && research) {
        await supabase.from("saved_companies").insert({
          user_id: user.user.id,
          company_name: companyName,
          company_data: research,
        })
        setSaved(true)

        // Show tooltip
        setTooltipContent("Company saved to your favorites! ⭐")
        setShowTooltip(true)
        setTimeout(() => setShowTooltip(false), 3000)
      }
    } catch (err) {
      console.error("Error saving company:", err)

      // Show error tooltip
      setTooltipContent("Error saving company. Please try again.")
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 3000)
    } finally {
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

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY })
  }

  if (!companyName) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-16 h-16 bg-card-bg rounded-full flex items-center justify-center mb-4">
            <FaExclamationTriangle className="text-yellow-500 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold mb-4">No company specified 🔍</h1>
          <p className="text-muted-foreground mb-6">Please return to the home page and search for a company.</p>
          <Link
            href="/"
            className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white hover:from-primary-hover hover:to-secondary rounded-full transition-colors hover-lift"
          >
            Go to Search
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto" onMouseMove={handleMouseMove}>
        {/* Floating tooltip */}
        {showTooltip && (
          <div
            className="fixed z-50 bg-card-bg p-3 rounded-lg shadow-lg border border-border scale-in"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y - 40,
              maxWidth: "250px",
            }}
          >
            {tooltipContent}
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary slide-in-left">
            {companyName} <span className="text-2xl">✨</span>
          </h1>

          <div className="flex flex-wrap gap-2 slide-in-right">
            <button
              onClick={shareResearch}
              className="flex items-center space-x-2 px-3 py-1.5 bg-card-bg hover:bg-card-hover rounded-lg transition-colors border border-border hover-lift"
            >
              <FaShareAlt />
              <span>Share</span>
            </button>

            <button
              onClick={downloadPDF}
              className="flex items-center space-x-2 px-3 py-1.5 bg-card-bg hover:bg-card-hover rounded-lg transition-colors border border-border hover-lift"
            >
              <FaDownload />
              <span>Download</span>
            </button>

            <button
              onClick={saveCompany}
              disabled={saving || saved || loading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors hover-lift ${
                saved
                  ? "bg-success text-white"
                  : "bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary text-white"
              }`}
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaStar className={saved ? "pulse" : ""} />}
              <span>{saved ? "Saved ✓" : "Save Research"}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border slide-up">
          <div className="flex space-x-4 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-2 px-1 font-medium transition-colors whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center space-x-2">
                <FaFileAlt />
                <span>Overview</span>
                <span className="text-lg">📊</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("financials")}
              className={`pb-2 px-1 font-medium transition-colors whitespace-nowrap ${
                activeTab === "financials"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center space-x-2">
                <FaChartBar />
                <span>Financials</span>
                <span className="text-lg">💰</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("news")}
              className={`pb-2 px-1 font-medium transition-colors whitespace-nowrap ${
                activeTab === "news"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center space-x-2">
                <FaNewspaper />
                <span>News</span>
                <span className="text-lg">📰</span>
              </div>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-24 h-24 mb-6">
              <FaSpinner className="animate-spin text-4xl absolute inset-0 m-auto" />
              <svg className="w-24 h-24" viewBox="0 0 100 100">
                <circle
                  className="text-gray-700"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-primary"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (loadingProgress / 100) * 283}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-xl text-muted-foreground mb-2">
              Researching {companyName}... {loadingProgress}%
            </p>
            <p className="text-sm text-muted-foreground mb-4">{loadingStage} ✨</p>
            <div className="w-64 h-2 bg-card-hover rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-error/10 border border-error p-6 rounded-lg slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center text-error">
                <FaExclamationTriangle />
              </div>
              <h3 className="text-xl font-semibold text-error">Error</h3>
            </div>
            <p>{error}</p>
            <button
              onClick={fetchResearch}
              className="mt-4 px-4 py-2 bg-error hover:bg-error/80 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : research ? (
          <div className="space-y-8">
            {activeTab === "overview" && (
              <>
                {/* Overview Section */}
                <section className="bg-card-bg p-6 rounded-lg shadow-lg border border-border transition-all duration-300 fade-in hover-lift">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <FaFileAlt />
                    </div>
                    <h2 className="text-2xl font-semibold">Company Overview</h2>
                  </div>
                  <p className="text-foreground leading-relaxed">
                    {research.overview || research.summary || "No overview available"}
                  </p>
                </section>

                {/* Metrics Section - Animated bars */}
                {research.metrics && research.metrics.length > 0 && (
                  <section className="bg-card-bg p-6 rounded-lg shadow-lg border border-border transition-all duration-300 slide-up hover-lift">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                        <FaChartBar />
                      </div>
                      <h2 className="text-2xl font-semibold">Key Metrics</h2>
                    </div>
                    <div className="space-y-4">
                      {research.metrics.map((metric: any, index: number) => (
                        <div key={index} className="space-y-1" style={{ animationDelay: `${index * 0.1}s` }}>
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-2">
                              {metric.name}
                              <span className="text-lg">{metric.emoji || "📊"}</span>
                            </span>
                            <span className="font-semibold">{metric.value}</span>
                          </div>
                          <div className="h-2 w-full bg-card-hover rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
                              style={{ width: `${metric.score || 50}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Analysis Section */}
                <section className="bg-card-bg p-6 rounded-lg shadow-lg border border-border transition-all duration-300 slide-up hover-lift">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-400/20 flex items-center justify-center text-blue-400">
                      <FaLightbulb />
                    </div>
                    <h2 className="text-2xl font-semibold">Detailed Analysis</h2>
                  </div>
                  <div className="text-foreground leading-relaxed whitespace-pre-line">
                    {research.analysis || "No detailed analysis available"}
                  </div>
                </section>

                {/* Outlook Section */}
                {research.outlook && (
                  <section className="bg-card-bg p-6 rounded-lg shadow-lg border border-border transition-all duration-300 slide-up hover-lift">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                        <FaChartLine />
                      </div>
                      <h2 className="text-2xl font-semibold">Future Outlook</h2>
                    </div>
                    <div className="text-foreground leading-relaxed">{research.outlook}</div>
                  </section>
                )}

                {/* Risks and Opportunities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {research.risks && research.risks.length > 0 && (
                    <section className="bg-card-bg p-6 rounded-lg shadow-lg border border-border transition-all duration-300 slide-up hover-lift">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                          <span className="text-xl">⚠️</span>
                        </div>
                        <h2 className="text-2xl font-semibold">Potential Risks</h2>
                      </div>
                      <ul className="space-y-2">
                        {research.risks.map((risk: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {research.opportunities && research.opportunities.length > 0 && (
                    <section className="bg-card-bg p-6 rounded-lg shadow-lg border border-border transition-all duration-300 slide-up hover-lift">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                          <span className="text-xl">💡</span>
                        </div>
                        <h2 className="text-2xl font-semibold">Opportunities</h2>
                      </div>
                      <ul className="space-y-2">
                        {research.opportunities.map((opportunity: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{opportunity}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              </>
            )}

            {activeTab === "financials" && (
              <div className="space-y-8 fade-in">
                {chartData && (
                  <section className="bg-card-bg p-6 rounded-lg shadow-lg border border-border hover-lift">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <FaChartLine />
                      </div>
                      <h2 className="text-2xl font-semibold">Stock Performance</h2>
                    </div>
                    <CompanyChart title={`${companyName} Stock Price (Last 12 Months)`} data={chartData} />
                  </section>
                )}

                <section className="bg-card-bg p-6 rounded-lg shadow-lg border border-border hover-lift">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                      <FaChartBar />
                    </div>
                    <h2 className="text-2xl font-semibold">Financial Highlights</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-card-hover rounded-lg hover-lift">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">Revenue</h3>
                        <span className="text-2xl">💰</span>
                      </div>
                      <p className="text-2xl font-bold">$12.4B</p>
                      <p className="text-success flex items-center">
                        +14.2% YoY
                        <span className="ml-2">{getPerformanceEmoji(14.2)}</span>
                      </p>
                    </div>

                    <div className="p-4 bg-card-hover rounded-lg hover-lift">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">Net Income</h3>
                        <span className="text-2xl">💵</span>
                      </div>
                      <p className="text-2xl font-bold">$3.2B</p>
                      <p className="text-success flex items-center">
                        +8.7% YoY
                        <span className="ml-2">{getPerformanceEmoji(8.7)}</span>
                      </p>
                    </div>

                    <div className="p-4 bg-card-hover rounded-lg hover-lift">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">EPS</h3>
                        <span className="text-2xl">📈</span>
                      </div>
                      <p className="text-2xl font-bold">$2.45</p>
                      <p className="text-success flex items-center">
                        +10.3% YoY
                        <span className="ml-2">{getPerformanceEmoji(10.3)}</span>
                      </p>
                    </div>

                    <div className="p-4 bg-card-hover rounded-lg hover-lift">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">P/E Ratio</h3>
                        <span className="text-2xl">⚖️</span>
                      </div>
                      <p className="text-2xl font-bold">24.3</p>
                      <p className="text-muted-foreground">Industry Avg: 22.1</p>
                    </div>

                    <div className="p-4 bg-card-hover rounded-lg hover-lift">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">Market Cap</h3>
                        <span className="text-2xl">🏢</span>
                      </div>
                      <p className="text-2xl font-bold">$845B</p>
                      <p className="text-muted-foreground">Rank: #5</p>
                    </div>

                    <div className="p-4 bg-card-hover rounded-lg hover-lift">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">Dividend Yield</h3>
                        <span className="text-2xl">💸</span>
                      </div>
                      <p className="text-2xl font-bold">1.8%</p>
                      <p className="text-muted-foreground">Industry Avg: 2.1%</p>
                    </div>
                  </div>
                </section>

                {/* Competitors Section */}
                {research.competitors && research.competitors.length > 0 && (
                  <section className="bg-card-bg p-6 rounded-lg shadow-lg border border-border hover-lift">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-blue-400/20 flex items-center justify-center text-blue-400">
                        <span className="text-xl">🏆</span>
                      </div>
                      <h2 className="text-2xl font-semibold">Competitors</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {research.competitors.map((competitor: string, index: number) => (
                        <Link
                          key={index}
                          href={`/research?company=${encodeURIComponent(competitor)}`}
                          className="p-4 bg-card-hover rounded-lg hover-lift flex items-center justify-between"
                        >
                          <span>{competitor}</span>
                          <FaExternalLinkAlt className="text-sm text-muted-foreground" />
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {activeTab === "news" && (
              <section className="bg-card-bg p-6 rounded-lg shadow-lg border border-border transition-all duration-300 fade-in hover-lift">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-400/20 flex items-center justify-center text-blue-400">
                    <FaNewspaper />
                  </div>
                  <h2 className="text-2xl font-semibold">Latest News</h2>
                </div>
                
                {loading ? (
                  <div className="flex flex-col items-center py-10">
                    <FaSpinner className="animate-spin text-2xl mb-4" />
                    <p>Loading latest news...</p>
                  </div>
                ) : companyNews && companyNews.length > 0 ? (
                  <div className="space-y-4">
                    {companyNews.map((news, index) => (
                      <div 
                        key={index} 
                        className="p-4 border border-border rounded-lg hover:bg-card-hover transition-colors cursor-pointer"
                        onClick={() => window.open(news.url, '_blank')}
                      >
                        <div className="flex items-start gap-4">
                          {news.image && (
                            <img 
                              src={news.image} 
                              alt={news.headline} 
                              className="w-20 h-20 object-cover rounded-md"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-news.png';
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium hover:text-primary">{news.headline}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{news.summary}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {new Date(news.datetime).toLocaleDateString()} • {news.source}
                              </span>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                <span>Sentiment: </span>
                                <span 
                                  className="text-base" 
                                  title={news.sentiment?.label || 'Neutral'}
                                  data-tooltip-id="sentiment-tooltip"
                                >
                                  {news.sentiment?.emoji || '📊'}
                                </span>
                              </div>
                              <span className="text-xs flex items-center gap-1 text-primary">
                                Read more <FaExternalLinkAlt size={10} />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No recent news found for {companyName}.</p>
                  </div>
                )}
              </section>
            )}

            <div className="text-sm text-muted-foreground italic mt-4 flex items-center justify-center gap-2">
              <span>Data provided by AI research. Information may not be completely accurate or up-to-date.</span>
              <span className="text-lg">🤖</span>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  )
}

// Add Link component to fix the error
function Link({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}
