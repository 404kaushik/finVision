"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { getBeginnerFriendlyResearch } from "@/lib/perplexity"
import { cn } from "@/lib/utils"
import CompanyImages from "@/components/CompanyImages"
import { getCompanyImages } from "@/lib/getCompanyImages"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FaInfoCircle,
  FaChartLine,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaLightbulb,
  FaNewspaper,
  FaClock,
  FaQuestionCircle,
  FaSpinner,
  FaArrowRight,
  FaExternalLinkAlt,
  FaThumbsUp,
  FaThumbsDown,
  FaImages,
} from "react-icons/fa"
import { RiMentalHealthLine } from "react-icons/ri"
import { BsGraphUp, BsShieldCheck } from "react-icons/bs"
import { GiTakeMyMoney } from "react-icons/gi"
import { Sparkles, TrendingUp, TrendingDown, ShieldCheck, AlertTriangle } from "lucide-react"
import { Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

type BeginnerResearchProps = {
  companyName: string
  onClose?: () => void
}



// Helper function to get color based on score
const getScoreColor = (score: number) => {
  if (score >= 80) return "bg-green-500"
  if (score >= 60) return "bg-blue-500"
  if (score >= 40) return "bg-yellow-500"
  if (score >= 20) return "bg-orange-500"
  return "bg-red-500"
}

// Helper function to get verdict badge color
const getVerdictColor = (verdict: string) => {
  if (verdict.includes("Strong Buy")) return "bg-green-500 hover:bg-green-600"
  if (verdict.includes("Buy")) return "bg-emerald-500 hover:bg-emerald-600"
  if (verdict.includes("Hold")) return "bg-blue-500 hover:bg-blue-600"
  if (verdict.includes("Sell")) return "bg-orange-500 hover:bg-orange-600"
  if (verdict.includes("Strong Sell")) return "bg-red-500 hover:bg-red-600"
  return "bg-gray-500 hover:bg-gray-600"
}

const thinkingMessages = [
  "Gathering the latest financial data...",
  "Analyzing recent news and market trends...",
  "Comparing with industry competitors...",
  "Evaluating growth potential and risks...",
  "Summarizing key insights for beginners...",
  "Checking for common misconceptions...",
  "Scoring financial health and stability...",
  "Finding the most profitable business lines...",
  "Preparing a jargon-free summary...",
  "Almost done! Finalizing your research report..."
];

export default function BeginnerResearch({ companyName, onClose }: BeginnerResearchProps) {
  const [research, setResearch] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingStage, setLoadingStage] = useState("Gathering data")
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState<"positive" | "negative" | null>(null)
  const [messageIdx, setMessageIdx] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipContent, setTooltipContent] = useState("")
  const [deepResearchData, setDeepResearchData] = useState<any>(null)
  const [deepResearchSaved, setDeepResearchSaved] = useState(false)
  const [deepResearchLoading, setDeepResearchLoading] = useState(false)


  useEffect(() => {
    if (companyName) {
      fetchResearch()
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
          return prev + 5
        })

        // Update loading stage messages
        if (loadingProgress < 20) {
          setLoadingStage("Gathering company information")
        } else if (loadingProgress < 40) {
          setLoadingStage("Analyzing financial health")
        } else if (loadingProgress < 60) {
          setLoadingStage("Evaluating growth potential")
        } else if (loadingProgress < 80) {
          setLoadingStage("Simplifying complex concepts")
        } else {
          setLoadingStage("Preparing beginner-friendly insights")
        }
      }, 600)

      return () => clearInterval(interval)
    }
  }, [loading, loadingProgress])

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setMessageIdx((prev) => (prev + 1) % thinkingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  const fetchResearch = async () => {
    setLoading(true)
    setError(null)
    setLoadingProgress(0)
  
    try {
      // Step 1: Check if deep research exists in database
      setLoadingProgress(20)
      console.log("🔍 Step 1: Checking for existing deep research...")
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error("User not logged in")
  
      const { data: existingResearch, error: fetchError } = await supabase
        .from("saved_companies")
        .select("deep_research, created_at_deep_research")
        .eq("user_id", user.id)
        .eq("company_name", companyName)
        .single()
  
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }
  
      if (existingResearch?.deep_research) {
        console.log("Found existing deep research in database")
        setResearch(existingResearch.deep_research)
        setDeepResearchSaved(true)
        setLastSavedAt(existingResearch.created_at_deep_research)
        setLoadingProgress(100)
        return
      }
  
      // Step 2: Generate new research if not found
      console.log("🧠 Step 2: Generating new deep research...")
      setLoadingProgress(40)
  
      // Fetch raw data (includes both deep research + formatted result)
      const data = await getBeginnerFriendlyResearch(companyName)
  
      // Step 3: Indicate formatting is in progress
      setLoadingProgress(60)
      console.log("🧠 Step 3: Formatting for beginners...")
  
      // Extract and parse the response content
      if (!data || !data.companyName) {
        throw new Error("Invalid research data received.")
      }
  
      // After parsing beginnerData
      if (data.products && Array.isArray(data.products)) {
        for (const product of data.products) {
          if (!product.image || product.image.startsWith("http") === false || product.image.includes("image-url.com")) {
            // Fetch an image for the product name
            const imgs = await getCompanyImages(product.name);
            if (imgs && imgs.length > 0) {
              product.image = imgs[0].url;
            }
          }
        }
      }
  
      setResearch(data)
      setLoadingProgress(100)
      console.log(data.products);
    } catch (err) {
      console.error("Error fetching research:", err)
      setError("Failed to fetch research data. Please try again.")
      setLoadingProgress(100)
    } finally {
      setTimeout(() => setLoading(false), 500) // Smooth visual exit
    }
  }

  const saveDeepResearch = async () => {
    if (!companyName || !research) return

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error("User not logged in")
  
      const { error: updateError } = await supabase
        .from("saved_companies")
        .upsert(
          {
            user_id: user.id,
            company_name: companyName,
            deep_research: research,
            created_at_deep_research: new Date().toISOString()
          },
          { onConflict: "user_id,company_name" }
        )
  
      if (updateError) throw updateError
  
      setDeepResearchSaved(true)
      setLastSavedAt(new Date().toISOString())
      setTooltipContent("Deep research saved! ✅")
    } catch (err) {
      console.error("Error saving deep research:", err)
      setTooltipContent("Failed to save deep research.")
    } finally {
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 3000)
    }
  }
  
  

  const handleFeedback = (type: "positive" | "negative") => {
    setFeedbackGiven(type)
    setShowFeedback(true)

    // In a real app, you would send this feedback to your backend
    console.log(`User gave ${type} feedback for research on ${companyName}`)

    // Hide the feedback message after 3 seconds
    setTimeout(() => {
      setShowFeedback(false)
    }, 3000)
  }

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-16 shadow-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/10">
        <CardHeader className="bg-gradient-to-r from-primary/20 to-secondary/20 py-4 rounded-t-lg">
          <CardTitle className="text-2xl flex items-center gap-2">
            <FaLightbulb className="text-primary animate-pulse" />
            <span>Deep Research in Progress</span>
          </CardTitle>
          <CardDescription>
            <span className="font-semibold text-primary">This may take 5-10 minutes.</span> <br />
            Please stay on this page—your personalized, beginner-friendly investment report is being crafted!
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 pb-6 flex flex-col items-center">          
          <div className="relative w-24 h-24 mb-6">
            <FaSpinner className="animate-spin text-4xl absolute inset-0 m-auto text-primary" />
            <svg className="w-24 h-24" viewBox="0 0 100 100">
              <circle
                className="text-card-hover"
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
          <div className="w-full flex flex-col items-center">
            <motion.p
              key={messageIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5 }}
              className="text-lg font-medium text-center mb-2 text-primary"
            >
              {thinkingMessages[messageIdx]}
            </motion.p>
            <p className="text-muted-foreground max-w-md text-center mb-4">
              Our AI is working hard to deliver a detailed, easy-to-understand investment analysis for <span className="font-semibold">{companyName}</span>.
            </p>
            <div className="w-full max-w-md h-2 bg-card-hover rounded-full overflow-hidden mt-2">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: "0%" }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-muted-foreground">
            <span className="font-semibold text-primary">Tip:</span> You can open other tabs, but don't close this page or you'll lose your progress!
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto border-border">
        <CardHeader className="bg-red-500/10">
          <CardTitle className="text-2xl flex items-center gap-2 text-red-500">
            <FaExclamationTriangle />
            <span>Error</span>
          </CardTitle>
          <CardDescription>We encountered a problem while researching {companyName}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-lg mb-4">{error}</p>
            <Button onClick={fetchResearch} className="bg-primary hover:bg-primary/90">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!research) {
    return null
  }

  const topProducts = (research.products || [])
    .sort((a: any, b: any) => (b.sales || 0) - (a.sales || 0))
    .slice(0, 3);

  return (
    <Card className="w-full max-w-7xl mx-auto border-border shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/30 to-secondary/80 rounded-t-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="py-2">
            <CardTitle className="text-2xl flex items-center gap-2">
              <FaLightbulb className="text-primary" />
              <span>{research.companyName || companyName}</span>
              {research.ticker && (
                <Badge variant="outline" className="ml-2 text-sm bg-white text-black">
                  {research.ticker}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">Beginner-Friendly Investment Analysis</CardDescription>
          </div>

          <Button
            onClick={saveDeepResearch}
            disabled={deepResearchSaved || !research}
            className={`rounded-full px-6 text-white transition-colors ${
              deepResearchSaved
                ? "bg-green-600 hover:bg-green-700 cursor-default"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {deepResearchSaved ? (
              <>
                <FaCheckCircle className="mr-2" />
                Deep Research Saved
              </>
            ) : (
              "Save Deep Research"
            )}
          </Button>

        </div>
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
      </CardHeader>           

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6 pt-2">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <FaInfoCircle className="hidden sm:inline" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-1">
              <FaChartLine className="hidden sm:inline" />
              <span>Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="pros-cons" className="flex items-center gap-1">
              <RiMentalHealthLine className="hidden sm:inline" />
              <span>Pros & Cons</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1">
              <FaLightbulb className="hidden sm:inline" />
              <span>Insights</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-1">
              <FaImages className="hidden sm:inline" />
              <span>Images</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-1">
              <Sparkles className="hidden sm:inline" />
              <span>Products</span>
            </TabsTrigger>
            <TabsTrigger value="swot" className="flex items-center gap-1">
              <ShieldCheck className="hidden sm:inline" />
              <span>SWOT</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-6">
          <TabsContent value="overview" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-6">
                {/* Simple Summary */}
                <div className="bg-card-hover p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <FaInfoCircle className="text-primary" />
                    <span>In Simple Terms</span>
                  </h3>
                  <p className="text-lg">{research.simpleSummary}</p>
                </div>

                {/* Beginner Explanation */}
                <div>
                  <h3 className="text-lg font-medium mb-3">What You Need to Know</h3>
                  <p className="text-muted-foreground leading-relaxed">{research.beginnerExplanation}</p>
                </div>

                {/* Verdict */}
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <GiTakeMyMoney className="text-primary" />
                    <span>Beginner's Verdict</span>
                  </h3>
                  <div className="flex items-center gap-3">
                    <Badge className={`${getVerdictColor(research.beginnerVerdict)} text-white px-3 py-1`}>
                      {research.beginnerVerdict.split(" ")[0]} {research.beginnerVerdict.split(" ")[1] || ""}
                    </Badge>
                    <p>{research.beginnerVerdict.split(" ").slice(2).join(" ")}</p>
                  </div>
                </div>

                {/* Simple Analogy */}
                {research.simpleAnalogy && (
                  <div className="bg-card-hover p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                      <FaLightbulb className="text-yellow-500" />
                      <span>Simple Analogy</span>
                    </h3>
                    <p>{research.simpleAnalogy}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="analysis" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-6">
                {/* Financial Health */}
                <div className="bg-card-hover p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <BsShieldCheck className="text-blue-500" />
                      <span>Financial Health</span>
                    </h3>
                    <Badge variant="outline" className="font-mono">
                      {research.financialHealth.score}/100
                    </Badge>
                  </div>
                  <Progress
                    value={research.financialHealth.score}
                    className={`h-2 mb-3 ${getScoreColor(research.financialHealth.score)}`}
                  />
                  <p className="text-muted-foreground">{research.financialHealth.explanation}</p>
                </div>

                {/* Growth Potential */}
                <div className="bg-card-hover p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <BsGraphUp className="text-green-500" />
                      <span>Growth Potential</span>
                    </h3>
                    <Badge variant="outline" className="font-mono">
                      {research.growthPotential.score}/100
                    </Badge>
                  </div>
                  <Progress
                    value={research.growthPotential.score}                    
                    className={`h-2 mb-3 ${getScoreColor(research.growthPotential.score)}`}
                  />
                  <p className="text-muted-foreground">{research.growthPotential.explanation}</p>
                </div>

                {/* Stability */}
                <div className="bg-card-hover p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <RiMentalHealthLine className="text-purple-500" />
                      <span>Stability</span>
                    </h3>
                    <Badge variant="outline" className="font-mono">
                      {research.stability.score}/100
                    </Badge>
                  </div>
                  <Progress
                    value={research.stability.score}
                    className={`h-2 mb-3 ${getScoreColor(research.stability.score)}`}
                  />
                  <p className="text-muted-foreground">{research.stability.explanation}</p>
                </div>

                {/* Competitive Advantage & Industry Position */}
                {(research.competitiveAdvantage || research.industryPosition) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {research.competitiveAdvantage && (
                      <div className="bg-card-hover p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                          <FaCheckCircle className="text-green-500" />
                          <span>Competitive Advantage</span>
                        </h3>
                        <p className="text-muted-foreground">{research.competitiveAdvantage}</p>
                      </div>
                    )}
                    {research.industryPosition && (
                      <div className="bg-card-hover p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                          <FaChartLine className="text-blue-500" />
                          <span>Industry Position</span>
                        </h3>
                        <Badge className="bg-primary hover:bg-primary/90">{research.industryPosition}</Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="pros-cons" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Why Consider */}
                <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-green-500">
                    <FaCheckCircle />
                    <span>Why Consider Investing</span>
                  </h3>
                  {research.whyConsider && research.whyConsider.length > 0 ? (
                    <ul className="space-y-3">
                      {research.whyConsider.map((reason: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No specific reasons provided.</p>
                  )}
                </div>

                {/* Why Avoid */}
                <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-red-500">
                    <FaTimesCircle />
                    <span>Potential Risks</span>
                  </h3>
                  {research.whyAvoid && research.whyAvoid.length > 0 ? (
                    <ul className="space-y-3">
                      {research.whyAvoid.map((risk: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No specific risks provided.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="insights" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-6">
                {/* Recent News */}
                {research.recentNews && research.recentNews.length > 0 && (
                  <div className="bg-card-hover p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                      <FaNewspaper className="text-blue-500" />
                      <span>Recent News</span>
                    </h3>
                    <ul className="space-y-2">
                      {research.recentNews.map((news: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 p-2 hover:bg-card-bg rounded-lg transition-colors"
                        >
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{news}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Common Misconceptions */}
                {research.commonMisconceptions && research.commonMisconceptions.length > 0 && (
                  <div className="bg-card-hover p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                      <FaQuestionCircle className="text-purple-500" />
                      <span>Common Misconceptions</span>
                    </h3>
                    <ul className="space-y-2">
                      {research.commonMisconceptions.map((misconception: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          <span>{misconception}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Steps */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <FaArrowRight className="text-primary" />
                    <span>Next Steps</span>
                  </h3>
                  <p className="mb-4">
                    Now that you understand the basics about {research.companyName || companyName}, here are some
                    suggested next steps:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                      <FaChartLine />
                      <span>View Detailed Research</span>
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <FaExternalLinkAlt />
                      <span>Learn More About Investing</span>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="images" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-6">
                <div className="bg-card-hover p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <FaImages className="text-primary" />
                    <span>Company Images</span>
                  </h3>
                  {research && research.images && research.images.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <CompanyImages images={research.images} />
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No images available for this company.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="products" className="mt-0">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {topProducts.map((product: any, idx: number) => (
                  <Card key={product.name} className="relative group shadow-xl border-2 border-primary/30 hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-white to-primary/10">
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                        #{idx + 1} Best Seller
                      </Badge>
                    </div>
                    <img
                      src={product.image || "/fallback-product.jpg"}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg shadow-lg group-hover:brightness-110 transition"
                      onError={(e) => { e.currentTarget.src = "/fallback-product.jpg"; }}
                    />
                    <CardContent className="p-4">
                      <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        <Sparkles className="text-primary" />
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        <span className="font-semibold">Business Line:</span> {product.businessLine}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-lg font-bold text-green-600 flex items-center gap-1">
                          <TrendingUp /> Sales: {(product.sales ?? 0).toLocaleString()}
                        </span>
                        <span className="text-lg font-bold text-blue-600 flex items-center gap-1">
                          <TrendingUp /> Profit: ${(product.profit ?? 0).toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="swot" className="mt-0">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-green-100/60 border-green-300">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <ShieldCheck className="text-green-600" />
                    <span className="font-bold text-green-700">Strengths</span>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc ml-5 text-green-800">
                      {research.swot?.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-red-100/60 border-red-300">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <AlertTriangle className="text-red-600" />
                    <span className="font-bold text-red-700">Weaknesses</span>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc ml-5 text-red-800">
                      {research.swot?.weaknesses?.map((w: string, i: number) => <li key={i}>{w}</li>)}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-blue-100/60 border-blue-300">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <TrendingUp className="text-blue-600" />
                    <span className="font-bold text-blue-700">Opportunities</span>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc ml-5 text-blue-800">
                      {research.swot?.opportunities?.map((o: string, i: number) => <li key={i}>{o}</li>)}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-100/60 border-yellow-300">
                  <CardHeader className="flex flex-row items-center gap-2">
                    <TrendingDown className="text-yellow-600" />
                    <span className="font-bold text-yellow-700">Threats</span>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc ml-5 text-yellow-800">
                      {research.swot?.threats?.map((t: string, i: number) => <li key={i}>{t}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter className="flex justify-between border-t border-border p-4 bg-card-bg/50">
        <div className="text-sm text-muted-foreground">
          <p>
            Data provided by AI research. Information may not be completely accurate or up-to-date. Always do additional
            research before making investment decisions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!feedbackGiven ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback("positive")}
                className="text-green-500 hover:text-green-600 hover:bg-green-100/10"
              >
                <FaThumbsUp />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback("negative")}
                className="text-red-500 hover:text-red-600 hover:bg-red-100/10"
              >
                <FaThumbsDown />
              </Button>
            </>
          ) : (
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-sm text-green-500"
                >
                  Thank you for your feedback!
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </CardFooter>

      {/* Stock Sentiment */}
      <div className="flex items-center justify-center gap-3 my-6">
        <span className="text-5xl animate-bounce">{research.stockSentiment?.emoji}</span>
        <span className="text-xl font-semibold">{research.stockSentiment?.summary}</span>
      </div>

      {/* Visual Metaphor */}
      {research.visualMetaphor && (
        <motion.div
          className="bg-gradient-to-r from-blue-100 to-green-100 rounded-xl p-6 flex items-center gap-4 my-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img src="/visual-metaphor.svg" alt="Metaphor" className="w-16 h-16" />
          <span className="text-lg font-medium">{research.visualMetaphor}</span>
        </motion.div>
      )}

      {/* How it Makes Money (Pie Chart) */}
      {research.howItMakesMoney && (
        <div className="my-8">
          <h3 className="text-lg font-bold mb-2">How {research.companyName} Makes Money</h3>
          <Pie
            data={{
              labels: research.howItMakesMoney.map((item: any) => item.label),
              datasets: [{
                data: research.howItMakesMoney.map((item: any) => item.percent),
                backgroundColor: research.howItMakesMoney.map((item: any) => item.color),
              }]
            }}
            options={{ plugins: { legend: { position: "bottom" } } }}
          />
        </div>
      )}

      {/* Visual Timeline */}
      {research.visualTimeline && (
        <div className="my-8">
          <h3 className="text-lg font-bold mb-2">Company Timeline</h3>
          <div className="flex overflow-x-auto gap-6 py-4">
            {research.visualTimeline.map((item: any, idx: number) => (
              <motion.div
                key={idx}
                className="min-w-[200px] bg-white rounded-lg shadow-md p-4 flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <img src={item.image} alt={item.event} className="w-20 h-20 object-cover rounded-full mb-2" />
                <span className="font-bold">{item.year}</span>
                <span className="text-sm text-muted-foreground">{item.event}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Risk Meter */}
      {research.visualRiskMeter && (
        <div className="my-8 flex flex-col items-center">
          <h3 className="text-lg font-bold mb-2">Risk Meter</h3>
          <motion.div
            className="w-40 h-40 rounded-full bg-gradient-to-tr from-yellow-200 to-red-200 flex items-center justify-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-4xl font-bold" style={{ color: research.visualRiskMeter.color }}>
              {research.visualRiskMeter.score}/100
            </span>
          </motion.div>
          <span className="text-sm mt-2">{research.visualRiskMeter.explanation}</span>
        </div>
      )}

      {/* What Makes Special */}
      {research.whatMakesSpecial && (
        <motion.div
          className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 my-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-lg font-medium">{research.whatMakesSpecial}</span>
        </motion.div>
      )}

      {/* Beginner FAQ */}
      {research.beginnerFAQ && (
        <div className="my-8">
          <h3 className="text-lg font-bold mb-2">Beginner FAQ</h3>
          <Accordion type="single" collapsible>
            {research.beginnerFAQ.map((item: any, idx: number) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </Card>
  )
}
