"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/utils/supabase/client"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { getBeginnerFriendlyResearch } from "@/lib/perplexity"
import CompanyImages from "@/components/CompanyImages"
import { getCompanyImages } from "@/lib/getCompanyImages"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMediaQuery } from "@/hooks/use-mobile"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from "chart.js"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  ExternalLink,
  HelpCircle,
  Info,
  Lightbulb,
  LineChart,
  Newspaper,
  Shield,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  XCircle,
  Images,
  Loader2,
} from "lucide-react"

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip, Legend)

type BeginnerResearchProps = {
  companyName: string
  onClose?: () => void
}

// Helper function to get color based on score
const getScoreColor = (score: number) => {
  if (score >= 80) return "bg-emerald-500"
  if (score >= 60) return "bg-blue-500"
  if (score >= 40) return "bg-amber-500"
  if (score >= 20) return "bg-orange-500"
  return "bg-red-500"
}

// Helper function to get verdict badge color
const getVerdictColor = (verdict: string) => {
  if (verdict.includes("Strong Buy")) return "bg-emerald-500 hover:bg-emerald-600"
  if (verdict.includes("Buy")) return "bg-green-500 hover:bg-green-600"
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
  "Almost done! Finalizing your research report...",
]

export default function BeginnerResearch({ companyName, onClose }: BeginnerResearchProps) {
  const [research, setResearch] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingStage, setLoadingStage] = useState("Gathering data")
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState<"positive" | "negative" | null>(null)
  const [messageIdx, setMessageIdx] = useState(0)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipContent, setTooltipContent] = useState("")
  const [deepResearchSaved, setDeepResearchSaved] = useState(false)
  const [deepResearchLoading, setDeepResearchLoading] = useState(false)
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false)

  const isMobile = useMediaQuery("(max-width: 768px)")
  const contentRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ["start start", "end end"],
  })

  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

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
    if (!loading) return
    const interval = setInterval(() => {
      setMessageIdx((prev) => (prev + 1) % thinkingMessages.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [loading])

  const fetchResearch = async () => {
    setLoading(true)
    setError(null)
    setLoadingProgress(0)

    try {
      // Step 1: Check if deep research exists in database
      setLoadingProgress(20)
      console.log("🔍 Step 1: Checking for existing deep research...")

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) throw new Error("User not logged in")

      const normalizedCompanyName = companyName.toLowerCase()

      const { data: existingResearch, error: fetchError } = await supabase
        .from("saved_research")
        .select("deep_research_data, created_deepresearch_at")
        .eq("user_id", user.id)
        .eq("company_name", normalizedCompanyName)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError
      }

      if (existingResearch?.deep_research_data) {
        console.log("Found existing deep research in database")
        setResearch(existingResearch.deep_research_data)
        setDeepResearchSaved(true)
        setLastSavedAt(existingResearch.created_deepresearch_at)
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
            const imgs = await getCompanyImages(product.name)
            if (imgs && imgs.length > 0) {
              product.image = imgs[0].url
            }
          }
        }
      }

      setResearch(data)
      setLoadingProgress(100)
      console.log(data.products)
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

    setDeepResearchLoading(true)

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) throw new Error("User not logged in")

      const normalizedCompanyName = companyName.toLowerCase()

      const { error: updateError } = await supabase.from("saved_research").upsert(
        {
          user_id: user.id,
          company_name: normalizedCompanyName,
          deep_research_data: research,
          created_deepresearch_at: new Date().toISOString(),
        },
        { onConflict: "user_id,company_name" },
      )

      if (updateError) throw updateError

      setDeepResearchSaved(true)
      setLastSavedAt(new Date().toISOString())
      setShowSaveConfirmation(true)
      setTimeout(() => setShowSaveConfirmation(false), 3000)
    } catch (err) {
      console.error("Error saving deep research:", err)
      setTooltipContent("Failed to save deep research.")
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 3000)
    } finally {
      setDeepResearchLoading(false)
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full max-w-2xl mx-auto mt-8 md:mt-16"
      >
        <Card className="shadow-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/10 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <CardHeader className="bg-gradient-to-r from-primary/20 to-secondary/20 py-4 rounded-t-lg relative z-10">
            <CardTitle className="text-2xl flex items-center gap-2">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
                <Lightbulb className="text-primary" />
              </motion.div>
              <span>Deep Research in Progress</span>
            </CardTitle>
            <CardDescription>
              <span className="font-semibold text-primary">This may take 5-10 minutes.</span> <br />
              Please stay on this page—your personalized, beginner-friendly investment report is being crafted!
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 pb-6 flex flex-col items-center relative z-10">
            <div className="relative w-32 h-32 mb-6">
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  rotate: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                  scale: { duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
                }}
                className="absolute inset-0"
              >
                <svg className="w-32 h-32" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="var(--secondary)" />
                    </linearGradient>
                  </defs>
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
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (loadingProgress / 100) * 283}
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                  className="text-primary font-bold text-xl"
                >
                  {loadingProgress}%
                </motion.div>
              </div>
            </div>
            <div className="w-full flex flex-col items-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="text-lg font-medium text-center mb-2 text-primary h-12 flex items-center"
                >
                  {thinkingMessages[messageIdx]}
                </motion.p>
              </AnimatePresence>
              <p className="text-muted-foreground max-w-md text-center mb-4">
                Our AI is working hard to deliver a detailed, easy-to-understand investment analysis for{" "}
                <span className="font-semibold">{companyName}</span>.
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
            <motion.div
              className="mt-8 text-center text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <span className="font-semibold text-primary">Tip:</span> You can open other tabs, but don't close this
              page or you'll lose your progress!
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl mx-auto">
        <Card className="border-border shadow-lg overflow-hidden">
          <CardHeader className="bg-red-500/10">
            <CardTitle className="text-2xl flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-6 w-6" />
              <span>Error</span>
            </CardTitle>
            <CardDescription>We encountered a problem while researching {companyName}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-lg mb-4">{error}</p>
              <Button
                onClick={fetchResearch}
                className="bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (!research) {
    return null
  }

  const topProducts = (research.products || []).sort((a: any, b: any) => (b.sales || 0) - (a.sales || 0)).slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl mx-auto relative"
      ref={contentRef}
    >
      {/* Background gradient that fades as you scroll */}
      <motion.div
        className="fixed inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10"
        style={{ opacity: backgroundOpacity }}
      />

      {/* Save confirmation toast */}
      <AnimatePresence>
        {showSaveConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
          >
            <CheckCircle className="h-5 w-5" />
            <span>Research saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="border-border shadow-xl overflow-hidden bg-card/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/30 to-secondary/80 rounded-t-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <motion.div
              className="py-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CardTitle className="text-2xl md:text-3xl flex items-center gap-2">
                <Lightbulb className="text-primary h-6 w-6 md:h-7 md:w-7" />
                <span>{research.companyName || companyName}</span>
                {research.ticker && (
                  <Badge variant="outline" className="ml-2 text-sm bg-white text-black">
                    {research.ticker}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-1 text-base text-muted-foreground dark:text-white/80">Beginner-Friendly Investment Analysis</CardDescription>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button
                onClick={saveDeepResearch}
                disabled={deepResearchSaved || !research || deepResearchLoading}
                className={`rounded-full px-6 text-white transition-all duration-300 ${
                  deepResearchSaved
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:scale-105"
                }`}
              >
                {deepResearchLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : deepResearchSaved ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 " />
                    Deep Research Saved
                  </>
                ) : (
                  "Save Deep Research"
                )}
              </Button>
            </motion.div>
          </div>
          {lastSavedAt && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 text-sm text-muted-foreground dark:text-white/80"
            >
              <Clock className="text-muted-foreground dark:text-white/80 h-4 w-4" />
              <span>
                Last saved{" "}
                {new Date(lastSavedAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </motion.div>
          )}
        </CardHeader>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 py-4 sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b">
            <TabsList className={`grid ${isMobile ? "grid-cols-4" : "grid-cols-7"} w-full`}>
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <Info className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-1">
                <LineChart className="h-4 w-4" />
                <span>Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="pros-cons" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>Pros & Cons</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-1">
                <Lightbulb className="h-4 w-4" />
                <span>Insights</span>
              </TabsTrigger>
              {!isMobile && (
                <>
                  <TabsTrigger value="images" className="flex items-center gap-1">
                    <Images className="h-4 w-4" />
                    <span>Images</span>
                  </TabsTrigger>
                  <TabsTrigger value="products" className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    <span>Products</span>
                  </TabsTrigger>
                  <TabsTrigger value="swot" className="flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" />
                    <span>SWOT</span>
                  </TabsTrigger>
                </>
              )}
              {isMobile && (
                <TabsTrigger value="more" className="flex items-center gap-1">
                  <span>More</span>
                </TabsTrigger>
              )}
            </TabsList>
            {isMobile && activeTab === "more" && (
              <div className="grid grid-cols-3 gap-2 mt-2 pb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("images")}
                  className="flex items-center gap-1"
                >
                  <Images className="h-4 w-4" />
                  <span>Images</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("products")}
                  className="flex items-center gap-1"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Products</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("swot")}
                  className="flex items-center gap-1"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>SWOT</span>
                </Button>
              </div>
            )}
          </div>

          <CardContent className="pt-6 px-6">
            <TabsContent value="overview" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Simple Summary */}
                <motion.div
                  className="bg-card-hover p-6 rounded-xl shadow-md border border-primary/10"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-xl font-medium mb-3 flex items-center gap-2 text-primary">
                    <Info className="h-5 w-5" />
                    <span>In Simple Terms</span>
                  </h3>
                  <p className="text-lg leading-relaxed">{research.simpleSummary}</p>
                </motion.div>

                {/* Beginner Explanation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h3 className="text-xl font-medium mb-3 text-primary">What You Need to Know</h3>
                  <p className="text-muted-foreground dark:text-white/80 leading-relaxed text-base">{research.beginnerExplanation}</p>
                </motion.div>

                {/* Verdict */}
                <motion.div
                  className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl shadow-md border border-primary/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <h3 className="text-xl font-medium mb-4 flex items-center gap-2 text-primary">
                    <TrendingUp className="h-5 w-5" />
                    <span>Beginner's Verdict</span>
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <Badge className={`${getVerdictColor(research.beginnerVerdict)} text-white px-4 py-1.5 text-base`}>
                      {research.beginnerVerdict.split(" ")[0]} {research.beginnerVerdict.split(" ")[1] || ""}
                    </Badge>
                    <p className="text-base">{research.beginnerVerdict.split(" ").slice(2).join(" ")}</p>
                  </div>
                </motion.div>

                {/* Simple Analogy */}
                {research.simpleAnalogy && (
                  <motion.div
                    className="bg-card-hover p-6 rounded-xl shadow-md border border-yellow-200/50 mb- md:mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <h3 className="text-xl font-medium mb-3 flex items-center gap-2 text-yellow-500">
                      <Lightbulb className="h-5 w-5" />
                      <span>Simple Analogy</span>
                    </h3>
                    <p className="text-base leading-relaxed">{research.simpleAnalogy}</p>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="analysis" className="mt-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Financial Health */}
                <motion.div
                  className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 p-6 rounded-xl shadow-md border border-blue-200 dark:border-blue-800/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-medium flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <Shield className="h-5 w-5" />
                      <span>Financial Health</span>
                    </h3>
                    <Badge variant="outline" className="font-mono text-base px-3 py-1 bg-white/80 dark:bg-black/50">
                      {research.financialHealth.score}/100
                    </Badge>
                  </div>
                  <div className="relative h-3 mb-4 bg-blue-100 dark:bg-blue-950 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${research.financialHealth.score}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`absolute top-0 left-0 h-full ${getScoreColor(research.financialHealth.score)}`}
                    />
                  </div>
                  <p className="text-muted-foreground dark:text-white/80 text-base">{research.financialHealth.explanation}</p>
                </motion.div>

                {/* Growth Potential */}
                <motion.div
                  className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 p-6 rounded-xl shadow-md border border-green-200 dark:border-green-800/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-medium flex items-center gap-2 text-green-600 dark:text-green-400">
                      <TrendingUp className="h-5 w-5" />
                      <span>Growth Potential</span>
                    </h3>
                    <Badge variant="outline" className="font-mono text-base px-3 py-1 bg-white/80 dark:bg-black/50">
                      {research.growthPotential.score}/100
                    </Badge>
                  </div>
                  <div className="relative h-3 mb-4 bg-green-100 dark:bg-green-950 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${research.growthPotential.score}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                      className={`absolute top-0 left-0 h-full ${getScoreColor(research.growthPotential.score)}`}
                    />
                  </div>
                  <p className="text-muted-foreground dark:text-white/80 text-base">{research.growthPotential.explanation}</p>
                </motion.div>

                {/* Stability */}
                <motion.div
                  className="bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 p-6 rounded-xl shadow-md border border-purple-200 dark:border-purple-800/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-medium flex items-center gap-2 text-purple-600 dark:text-purple-400">
                      <Shield className="h-5 w-5" />
                      <span>Stability</span>
                    </h3>
                    <Badge variant="outline" className="font-mono text-base px-3 py-1 bg-white/80 dark:bg-black/50">
                      {research.stability.score}/100
                    </Badge>
                  </div>
                  <div className="relative h-3 mb-4 bg-purple-100 dark:bg-purple-950 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${research.stability.score}%` }}
                      transition={{ duration: 1, delay: 0.6 }}
                      className={`absolute top-0 left-0 h-full ${getScoreColor(research.stability.score)}`}
                    />
                  </div>
                  <p className="text-muted-foreground dark:text-white/80 text-base">{research.stability.explanation}</p>
                </motion.div>

                {/* Competitive Advantage & Industry Position */}
                {(research.competitiveAdvantage || research.industryPosition) && (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    {research.competitiveAdvantage && (
                      <motion.div
                        className="bg-card-hover p-6 rounded-xl shadow-md border border-primary/10"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h3 className="text-xl font-medium mb-3 flex items-center gap-2 text-green-500">
                          <CheckCircle className="h-5 w-5" />
                          <span>Competitive Advantage</span>
                        </h3>
                        <p className="text-muted-foreground dark:text-white/80 text-base">{research.competitiveAdvantage}</p>
                      </motion.div>
                    )}
                    {research.industryPosition && (
                      <motion.div
                        className="bg-card-hover p-6 rounded-xl shadow-md border border-primary/10"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <h3 className="text-xl font-medium mb-3 flex items-center gap-2 text-blue-500">
                          <LineChart className="h-5 w-5" />
                          <span>Industry Position</span>
                        </h3>
                        <Badge className="bg-primary hover:bg-primary/90 text-base px-3 py-1">
                          {research.industryPosition}
                        </Badge>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="pros-cons" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Why Consider */}
                <motion.div
                  className="bg-gradient-to-br from-green-50 to-green-100/30 dark:from-green-950/30 dark:to-green-900/10 p-6 rounded-xl shadow-md border border-green-200 dark:border-green-800/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <h3 className="text-xl font-medium mb-6 flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span>Why Consider Investing</span>
                  </h3>
                  {research.whyConsider && research.whyConsider.length > 0 ? (
                    <ul className="space-y-4">
                      {research.whyConsider.map((reason: string, index: number) => (
                        <motion.li
                          key={index}
                          className="flex items-start gap-3 bg-white/50 dark:bg-white/5 p-3 rounded-lg shadow-sm"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-base">{reason}</span>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No specific reasons provided.</p>
                  )}
                </motion.div>

                {/* Why Avoid */}
                <motion.div
                  className="bg-gradient-to-br from-red-50 to-red-100/30 dark:from-red-950/30 dark:to-red-900/10 p-6 rounded-xl shadow-md border border-red-200 dark:border-red-800/50"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <h3 className="text-xl font-medium mb-6 flex items-center gap-2 text-red-600 dark:text-red-400">
                    <XCircle className="h-5 w-5" />
                    <span>Potential Risks</span>
                  </h3>
                  {research.whyAvoid && research.whyAvoid.length > 0 ? (
                    <ul className="space-y-4">
                      {research.whyAvoid.map((risk: string, index: number) => (
                        <motion.li
                          key={index}
                          className="flex items-start gap-3 bg-white/50 dark:bg-white/5 p-3 rounded-lg shadow-sm"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-base">{risk}</span>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No specific risks provided.</p>
                  )}
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Recent News */}
                {research.recentNews && research.recentNews.length > 0 && (
                  <motion.div
                    className="bg-gradient-to-r from-blue-50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 p-6 rounded-xl shadow-md border border-blue-200 dark:border-blue-800/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  >
                    <h3 className="text-xl font-medium mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <Newspaper className="h-5 w-5" />
                      <span>Recent News</span>
                    </h3>
                    <ul className="space-y-3">
                      {research.recentNews.map((news: string, index: number) => (
                        <motion.li
                          key={index}
                          className="flex items-start gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-lg shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
                          <span className="text-base">{news}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Common Misconceptions */}
                {research.commonMisconceptions && research.commonMisconceptions.length > 0 && (
                  <motion.div
                    className="bg-gradient-to-r from-purple-50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10 p-6 rounded-xl shadow-md border border-purple-200 dark:border-purple-800/50"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  >
                    <h3 className="text-xl font-medium mb-4 flex items-center gap-2 text-purple-600 dark:text-purple-400">
                      <HelpCircle className="h-5 w-5" />
                      <span>Common Misconceptions</span>
                    </h3>
                    <ul className="space-y-3">
                      {research.commonMisconceptions.map((misconception: string, index: number) => (
                        <motion.li
                          key={index}
                          className="flex items-start gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-lg shadow-sm"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                        >
                          <span className="text-purple-500 mt-1 flex-shrink-0">•</span>
                          <span className="text-base">{misconception}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Next Steps */}
                <motion.div
                  className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl shadow-md border border-primary/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <h3 className="text-xl font-medium mb-3 flex items-center gap-2 text-primary">
                    <ArrowRight className="h-5 w-5" />
                    <span>Next Steps</span>
                  </h3>
                  <p className="mb-6 text-base">
                    Now that you understand the basics about {research.companyName || companyName}, here are some
                    suggested next steps:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full bg-primary hover:bg-primary/90 flex items-center gap-2 text-base py-6">
                        <LineChart className="h-5 w-5" />
                        <span>View Detailed Research</span>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        className="w-full flex items-center gap-2 text-base py-6 border-primary/20"
                      >
                        <ExternalLink className="h-5 w-5" />
                        <span>Learn More About Investing</span>
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </TabsContent>

            <TabsContent value="images" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-card-hover p-6 rounded-xl shadow-md border border-primary/10">
                  <h3 className="text-xl font-medium mb-6 flex items-center gap-2 text-primary">
                    <Images className="h-5 w-5" />
                    <span>Company Images</span>
                  </h3>
                  {research && research.images && research.images.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                      <CompanyImages images={research.images} />
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No images available for this company.</p>
                  )}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="products" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {topProducts.map((product: any, idx: number) => (
                  <motion.div
                    key={product.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <Card className="relative group overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-white to-primary/10 dark:from-gray-900 dark:to-primary/20 h-full">
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                          #{idx + 1} Best Seller
                        </Badge>
                      </div>
                      <div className="relative h-48 overflow-hidden">
                        <motion.img
                          src={product.image || "/fallback-product.jpg"}
                          alt={product.name}
                          className="w-full h-48 object-cover shadow-lg group-hover:brightness-110 transition"
                          onError={(e) => {
                            e.currentTarget.src = "/fallback-product.jpg"
                          }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2 group-hover:text-primary transition-colors">
                          <Sparkles className="text-primary h-5 w-5" />
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          <span className="font-semibold">Business Line:</span> {product.businessLine}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
                          <motion.div
                            className="flex items-center gap-1 text-lg font-bold text-green-600 dark:text-green-400"
                            whileHover={{ scale: 1.05 }}
                          >
                            <TrendingUp className="h-5 w-5" />
                            <span>Sales: {(product.sales ?? 0).toLocaleString()}</span>
                          </motion.div>
                          <motion.div
                            className="flex items-center gap-1 text-lg font-bold text-blue-600 dark:text-blue-400"
                            whileHover={{ scale: 1.05 }}
                          >
                            <TrendingUp className="h-5 w-5" />
                            <span>Profit: ${(product.profit ?? 0).toLocaleString()}</span>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="swot" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <Card className="bg-gradient-to-br from-green-50 to-green-100/30 dark:from-green-950/30 dark:to-green-900/10 border-green-300 dark:border-green-800/50 h-full">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                      <ShieldCheck className="text-green-600 h-5 w-5" />
                      <span className="font-bold text-green-700 dark:text-green-400">Strengths</span>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {research.swot?.strengths?.map((s: string, i: number) => (
                          <motion.li
                            key={i}
                            className="flex items-start gap-2 text-green-800 dark:text-green-300"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.1 }}
                          >
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{s}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <Card className="bg-gradient-to-br from-red-50 to-red-100/30 dark:from-red-950/30 dark:to-red-900/10 border-red-300 dark:border-red-800/50 h-full">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                      <AlertTriangle className="text-red-600 h-5 w-5" />
                      <span className="font-bold text-red-700 dark:text-red-400">Weaknesses</span>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {research.swot?.weaknesses?.map((w: string, i: number) => (
                          <motion.li
                            key={i}
                            className="flex items-start gap-2 text-red-800 dark:text-red-300"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.1 }}
                          >
                            <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <span>{w}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100/30 dark:from-blue-950/30 dark:to-blue-900/10 border-blue-300 dark:border-blue-800/50 h-full">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                      <TrendingUp className="text-blue-600 h-5 w-5" />
                      <span className="font-bold text-blue-700 dark:text-blue-400">Opportunities</span>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {research.swot?.opportunities?.map((o: string, i: number) => (
                          <motion.li
                            key={i}
                            className="flex items-start gap-2 text-blue-800 dark:text-blue-300"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.1 }}
                          >
                            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>{o}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/30 dark:from-yellow-950/30 dark:to-yellow-900/10 border-yellow-300 dark:border-yellow-800/50 h-full">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                      <TrendingDown className="text-yellow-600 h-5 w-5" />
                      <span className="font-bold text-yellow-700 dark:text-yellow-400">Threats</span>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {research.swot?.threats?.map((t: string, i: number) => (
                          <motion.li
                            key={i}
                            className="flex items-start gap-2 text-yellow-800 dark:text-yellow-300"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.1 }}
                          >
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <span>{t}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>

        <CardFooter className="flex flex-col sm:flex-row sm:justify-between border-t border-border p-6 bg-card-bg/50 gap-4">
          <div className="text-sm text-muted-foreground">
            <p>
              Data provided by AI research. Information may not be completely accurate or up-to-date. Always do
              additional research before making investment decisions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!feedbackGiven ? (
              <TooltipProvider>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFeedback("positive")}
                        className="text-green-500 hover:text-green-600 hover:bg-green-100/10"
                      >
                        <ThumbsUp className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This was helpful</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFeedback("negative")}
                        className="text-red-500 hover:text-red-600 hover:bg-red-100/10"
                      >
                        <ThumbsDown className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This needs improvement</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            ) : (
              <AnimatePresence>
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-sm text-green-500 flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Thank you for your feedback!
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </CardFooter>

        {/* Stock Sentiment */}
        {research.stockSentiment && (
          <motion.div
            className="flex flex-col items-center justify-center gap-3 m-8 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border-4 border-primary/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.span
              className="text-6xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1.1 }}
              transition={{ 
                duration: 0.5, 
                type: "spring",
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              {research.stockSentiment?.emoji}
            </motion.span>
            <span className="text-2xl font-semibold text-center">{research.stockSentiment?.summary}</span>
          </motion.div>
        )}

        {/* Visual Metaphor */}
        {research.visualMetaphor && (
          <motion.div
            className="bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 rounded-xl p-6 flex items-center justify-center gap-4 m-6 border-4 border-primary/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >            
            <span className="text-lg font-medium">{research.visualMetaphor}</span>
          </motion.div>
        )}

        {/* How it Makes Money (Pie Chart) */}
        {research.howItMakesMoney && (
          <motion.div
            className="my-8 p-6 bg-card-hover rounded-xl shadow-md border border-primary/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.01 }}
          >
            <h3 className="text-xl font-bold mb-4 text-primary">How {research.companyName} Makes Money</h3>
            <div className="max-w-md mx-auto">
              <Pie
                data={{
                  labels: research.howItMakesMoney.map((item: any) => item.label),
                  datasets: [
                    {
                      data: research.howItMakesMoney.map((item: any) => item.percent),
                      backgroundColor: research.howItMakesMoney.map((item: any) => item.color),
                      borderWidth: 2,
                      borderColor: "#ffffff",
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        font: {
                          size: 14,
                        },
                        padding: 20,
                      },
                    },
                  },
                  animation: {
                    animateScale: true,
                    animateRotate: true,
                  },
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Beginner FAQ */}
        {research.beginnerFAQ && (
          <motion.div
            className="my-8 p-6 bg-card-hover rounded-xl shadow-md border border-primary/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-bold mb-4 text-primary">Beginner FAQ</h3>
            <Accordion type="single" collapsible className="w-full">
              {research.beginnerFAQ.map((item: any, idx: number) => (
                <AccordionItem key={idx} value={`faq-${idx}`} className="border-b border-primary/10">
                  <AccordionTrigger className="text-base font-medium py-4 hover:text-primary transition-colors">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground pb-4">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        )}
      </Card>
    </motion.div>
  )
}
