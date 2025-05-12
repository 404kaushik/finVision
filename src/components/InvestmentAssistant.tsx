"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BotIcon,
  TrendingUpIcon,
  GraduationCapIcon,
  CoinsIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  XIcon,
  LightbulbIcon,
  HelpCircleIcon,
  MessageSquareIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ActivityIcon,
  SendIcon,
} from "lucide-react"
import { RiMentalHealthLine } from "react-icons/ri"
import { BsGraphUp } from "react-icons/bs"
import { GiTakeMyMoney } from "react-icons/gi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

type AssistantMode = "chat" | "learn" | "simulator" | "risk" | "concepts"

export default function InvestmentAssistant({ initiallyOpen = false }: { initiallyOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(initiallyOpen)
  const [isMinimized, setIsMinimized] = useState(false)
  const [mode, setMode] = useState<AssistantMode>("chat")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversation, setConversation] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: "👋 Hi there! I'm your Investment Assistant. How can I help you understand the stock market today?",
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [riskScore, setRiskScore] = useState(50)
  const [riskQuestions, setRiskQuestions] = useState([
    {
      question: "How long do you plan to invest?",
      answer: 3,
      min: 1,
      max: 5,
      labels: ["<1 year", "1-3 years", "3-5 years", "5-10 years", ">10 years"],
    },
    {
      question: "How would you react to a 20% drop in your investments?",
      answer: 3,
      min: 1,
      max: 5,
      labels: ["Sell everything", "Sell some", "Do nothing", "Buy a little more", "Buy a lot more"],
    },
    {
      question: "What's your investment experience level?",
      answer: 2,
      min: 1,
      max: 5,
      labels: ["None", "Beginner", "Intermediate", "Advanced", "Expert"],
    },
    {
      question: "What's your primary investment goal?",
      answer: 3,
      min: 1,
      max: 5,
      labels: ["Preserve capital", "Income", "Balanced", "Growth", "Aggressive growth"],
    },
  ])
  const [activeQuestion, setActiveQuestion] = useState(0)
  const [showRiskResult, setShowRiskResult] = useState(false)
  const [virtualPortfolio, setVirtualPortfolio] = useState<any[]>([])
  const [virtualCash, setVirtualCash] = useState(10000)
  const [stockSearch, setStockSearch] = useState("")
  const [stockResults, setStockResults] = useState<any[]>([])
  const [showStockSearch, setShowStockSearch] = useState(false)
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [purchaseAmount, setPurchaseAmount] = useState(1)
  const [showPurchaseConfirmation, setShowPurchaseConfirmation] = useState(false)
  const [showPortfolioValue, setShowPortfolioValue] = useState(false)
  const [portfolioValue, setPortfolioValue] = useState(0)
  const [showConcepts, setShowConcepts] = useState(false)
  const [activeConcept, setActiveConcept] = useState(0)
  const [conceptSearchTerm, setConceptSearchTerm] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const stockConcepts = [
    {
      title: "Stock",
      description:
        "A stock represents ownership in a company. When you buy a stock, you're buying a small piece of that company.",
      example: "If a company has 1,000 shares and you buy 10 shares, you own 1% of the company.",
      icon: <TrendingUpIcon className="text-primary" />,
    },
    {
      title: "Dividend",
      description:
        "A dividend is a payment made by a company to its shareholders, usually as a distribution of profits.",
      example: "If a company pays a $2 dividend per share and you own 10 shares, you'll receive $20 in dividends.",
      icon: <CoinsIcon className="text-amber-500" />,
    },
    {
      title: "P/E Ratio",
      description:
        "The Price-to-Earnings ratio is a valuation ratio of a company's current share price compared to its earnings per share.",
      example: "If a stock is trading at $100 per share and its earnings per share is $5, it has a P/E ratio of 20.",
      icon: <BsGraphUp className="text-green-500" />,
    },
    {
      title: "Market Cap",
      description: "Market capitalization is the total value of a company's outstanding shares of stock.",
      example:
        "If a company has 1 million shares outstanding and each share is worth $50, the market cap is $50 million.",
      icon: <GiTakeMyMoney className="text-purple-500" />,
    },
    {
      title: "Bull Market",
      description: "A bull market is a market condition in which prices are rising or expected to rise.",
      example: "During the 2010s, the U.S. stock market experienced one of the longest bull markets in history.",
      icon: <TrendingUpIcon className="text-green-500" />,
    },
    {
      title: "Bear Market",
      description: "A bear market is a market condition in which prices are falling or expected to fall.",
      example:
        "During the 2008 financial crisis, the stock market entered a bear market with stocks falling more than 20%.",
      icon: <TrendingUpIcon className="text-red-500" />,
    },
    {
      title: "Diversification",
      description:
        "Diversification is a risk management strategy that mixes a variety of investments within a portfolio.",
      example:
        "Instead of investing all your money in one company, you might invest in 20 different companies across various industries.",
      icon: <RiMentalHealthLine className="text-primary" />,
    },
    {
      title: "ETF",
      description:
        "An Exchange-Traded Fund (ETF) is a type of investment fund that tracks an index, sector, commodity, or other asset.",
      example:
        "Instead of buying shares in individual tech companies, you could buy a tech sector ETF that includes many tech companies.",
      icon: <CoinsIcon className="text-amber-500" />,
    },
  ]

  const filteredConcepts = conceptSearchTerm
    ? stockConcepts.filter(
        (concept) =>
          concept.title.toLowerCase().includes(conceptSearchTerm.toLowerCase()) ||
          concept.description.toLowerCase().includes(conceptSearchTerm.toLowerCase()),
      )
    : stockConcepts

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [conversation])

  useEffect(() => {
    if (mode === "simulator") {
      calculatePortfolioValue()
    }
  }, [mode, virtualPortfolio])

  const calculatePortfolioValue = () => {
    const totalValue =
      virtualPortfolio.reduce((total, stock) => {
        return total + stock.price * stock.shares
      }, 0) + virtualCash

    setPortfolioValue(totalValue)
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return

    // Add user message to conversation
    setConversation([...conversation, { role: "user", content: message }])
    setMessage("")
    setIsTyping(true)

    try {
      // Call Perplexity API
      const response = await fetchPerplexityResponse(message)
      setConversation((prev) => [...prev, { role: "assistant", content: response }])
    } catch (error) {
      console.error("Error fetching response:", error)
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error while processing your request. Please try again later.",
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const fetchPerplexityResponse = async (query: string) => {
    try {
      // Add finance-specific context to the query
      const enhancedQuery = `As a financial advisor, please answer this investment-related question to user's in a beginner friendly manner and use simple language and don't yap: ${query}`

      const response = await fetch("/api/response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: enhancedQuery }),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()
      return data.answer || "I'm sorry, I couldn't find an answer to that question."
    } catch (error) {
      console.error("Error calling Perplexity API:", error)
      return "I'm having trouble connecting to my knowledge base. Please try again later."
    }
  }

  const handleRiskAssessment = () => {
    // Calculate risk score based on answers
    const totalScore = riskQuestions.reduce((sum, q) => sum + q.answer, 0)
    const maxPossibleScore = riskQuestions.length * 5
    const percentageScore = (totalScore / maxPossibleScore) * 100
    setRiskScore(percentageScore)
    setShowRiskResult(true)
  }

  const getRiskProfile = () => {
    if (riskScore < 30)
      return {
        name: "Conservative",
        description:
          "You prefer stability and are uncomfortable with large market swings. Focus on preserving capital with some growth.",
        color: "blue",
      }
    if (riskScore < 50)
      return {
        name: "Moderately Conservative",
        description: "You're cautious but willing to accept some volatility for better returns.",
        color: "teal",
      }
    if (riskScore < 70)
      return {
        name: "Moderate",
        description:
          "You have a balanced approach to risk and return, accepting market fluctuations for long-term growth.",
        color: "green",
      }
    if (riskScore < 85)
      return {
        name: "Moderately Aggressive",
        description: "You're comfortable with significant volatility and seek strong growth potential.",
        color: "amber",
      }
    return {
      name: "Aggressive",
      description: "You seek maximum growth and can tolerate large market swings. You have a long time horizon.",
      color: "red",
    }
  }

  const handleSearchStocks = () => {
    if (!stockSearch.trim()) return

    setShowStockSearch(true)

    // Mock stock search results
    const mockResults = [
      { symbol: "AAPL", name: "Apple Inc.", price: 175.34, change: 2.45, changePercent: 1.42 },
      { symbol: "MSFT", name: "Microsoft Corporation", price: 340.67, change: -1.23, changePercent: -0.36 },
      { symbol: "GOOGL", name: "Alphabet Inc.", price: 131.86, change: 0.56, changePercent: 0.43 },
      { symbol: "AMZN", name: "Amazon.com Inc.", price: 127.74, change: -0.89, changePercent: -0.69 },
      { symbol: "TSLA", name: "Tesla, Inc.", price: 248.48, change: -3.56, changePercent: -1.41 },
    ].filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(stockSearch.toLowerCase()) ||
        stock.name.toLowerCase().includes(stockSearch.toLowerCase()),
    )

    setStockResults(mockResults)
  }

  const selectStock = (stock: any) => {
    setSelectedStock(stock)
    setShowStockSearch(false)
    setPurchaseAmount(1)
  }

  const handleBuyStock = () => {
    if (!selectedStock) return

    const totalCost = selectedStock.price * purchaseAmount

    if (totalCost > virtualCash) {
      alert("Not enough virtual cash for this purchase!")
      return
    }

    // Check if stock already in portfolio
    const existingStockIndex = virtualPortfolio.findIndex((s) => s.symbol === selectedStock.symbol)

    if (existingStockIndex >= 0) {
      // Update existing position
      const updatedPortfolio = [...virtualPortfolio]
      updatedPortfolio[existingStockIndex].shares += purchaseAmount
      setVirtualPortfolio(updatedPortfolio)
    } else {
      // Add new position
      setVirtualPortfolio([
        ...virtualPortfolio,
        {
          ...selectedStock,
          shares: purchaseAmount,
          purchasePrice: selectedStock.price,
          purchaseDate: new Date().toISOString(),
        },
      ])
    }

    // Deduct cash
    setVirtualCash((prev) => prev - totalCost)
    setShowPurchaseConfirmation(true)

    // Hide confirmation after 3 seconds
    setTimeout(() => {
      setShowPurchaseConfirmation(false)
      setSelectedStock(null)
    }, 3000)
  }

  const handleSellStock = (stockIndex: number) => {
    const stock = virtualPortfolio[stockIndex]
    const saleValue = stock.price * stock.shares

    // Remove from portfolio
    const updatedPortfolio = virtualPortfolio.filter((_, index) => index !== stockIndex)
    setVirtualPortfolio(updatedPortfolio)

    // Add cash
    setVirtualCash((prev) => prev + saleValue)

    // Show confirmation
    setConversation((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `✅ Sold ${stock.shares} shares of ${stock.symbol} for $${saleValue.toFixed(2)}.`,
      },
    ])
  }

  const resetSimulator = () => {
    setVirtualPortfolio([])
    setVirtualCash(10000)
    setSelectedStock(null)
    setShowPurchaseConfirmation(false)
    setShowPortfolioValue(false)
  }

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg z-50"
          onClick={() => setIsOpen(true)}
        >
          <BotIcon className="h-5 w-5" />
        </motion.button>
      )}

      {/* Assistant panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              width: isMinimized ? "300px" : "400px",
              height: isMinimized ? "80px" : "600px",
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-primary p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <BotIcon className="text-primary-foreground h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-primary-foreground font-medium">Investment Assistant</h3>
                  {!isMinimized && (
                    <p className="text-primary-foreground/80 text-xs">Your personal guide to investing</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => setIsMinimized(!isMinimized)}
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                >
                  {isMinimized ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Mode tabs */}
                <Tabs defaultValue="chat" value={mode} onValueChange={(value) => setMode(value as AssistantMode)}>
                  <TabsList className="w-full rounded-none border-b border-border">
                    <TabsTrigger value="chat" className="flex-1 data-[state=active]:bg-accent">
                      <div className="flex items-center gap-1">
                        <MessageSquareIcon className="h-4 w-4" />
                        <span className="text-xs">Chat</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="learn" className="flex-1 data-[state=active]:bg-accent">
                      <div className="flex items-center gap-1">
                        <GraduationCapIcon className="h-4 w-4" />
                        <span className="text-xs">Learn</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="simulator" className="flex-1 data-[state=active]:bg-accent">
                      <div className="flex items-center gap-1">
                        <TrendingUpIcon className="h-4 w-4" />
                        <span className="text-xs">Simulator</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="risk" className="flex-1 data-[state=active]:bg-accent">
                      <div className="flex items-center gap-1">
                        <ActivityIcon className="h-4 w-4" />
                        <span className="text-xs">Risk</span>
                      </div>
                    </TabsTrigger>
                  </TabsList>

                  {/* Content area */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {/* Chat mode */}
                    {mode === "chat" && (
                      <div className="h-full flex flex-col">
                        <div className="flex-1 overflow-y-auto mb-4 px-2">
                          {conversation.map((msg, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className={`mb-4 ${msg.role === "user" ? "ml-auto max-w-[80%]" : "mr-auto max-w-[80%]"}`}
                            >
                              <div className="flex items-start gap-2">
                                {msg.role === "assistant" && (
                                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                                    <BotIcon className="text-primary-foreground h-4 w-4" />
                                  </div>
                                )}
                                <div
                                  className={cn(
                                    "p-3 rounded-lg",
                                    msg.role === "user"
                                      ? "bg-primary text-primary-foreground rounded-tr-none"
                                      : "bg-accent rounded-tl-none",
                                  )}
                                >
                                  {msg.role === "assistant" ? (
                                    <div>
                                      {msg.content.split("\n").map((paragraph, i) => {
                                        // Check if paragraph contains a stock symbol pattern like $AAPL
                                        const hasStockSymbol = /\$[A-Z]{1,5}/.test(paragraph)

                                        // Check if paragraph mentions percentage
                                        const hasPercentage = /\d+(\.\d+)?%/.test(paragraph)

                                        // Check if paragraph is about market trends
                                        const isTrend = /trend|bull|bear|market|growth|decline/.test(
                                          paragraph.toLowerCase(),
                                        )

                                        return (
                                          <div key={i} className="mb-2">
                                            {hasStockSymbol ? (
                                              <div className="flex items-center gap-2 font-medium">
                                                <TrendingUpIcon className="text-primary h-3 w-3" />
                                                <span
                                                  dangerouslySetInnerHTML={{
                                                    __html: paragraph.replace(
                                                      /\$([A-Z]{1,5})/g,
                                                      '<span class="text-primary font-medium">$$$1</span>',
                                                    ),
                                                  }}
                                                />
                                              </div>
                                            ) : hasPercentage ? (
                                              <div className="flex items-center gap-2 font-medium">
                                                <BsGraphUp
                                                  className={
                                                    paragraph.includes("-") ? "text-red-500" : "text-green-500"
                                                  }
                                                />
                                                <span
                                                  dangerouslySetInnerHTML={{
                                                    __html: paragraph.replace(
                                                      /(\d+(\.\d+)?%)/g,
                                                      '<span class="font-medium">$1</span>',
                                                    ),
                                                  }}
                                                />
                                              </div>
                                            ) : isTrend ? (
                                              <div className="flex items-center gap-2 font-medium">
                                                <LightbulbIcon className="text-amber-500 h-3 w-3" />
                                                {paragraph}
                                              </div>
                                            ) : (
                                              <p>{paragraph}</p>
                                            )}
                                          </div>
                                        )
                                      })}

                                      {/* Add a "Learn more" button for longer responses */}
                                      {msg.content.length > 100 && (
                                        <div className="mt-3 pt-2 border-t border-border">
                                          <button
                                            onClick={() => {
                                              setMode("learn")
                                              setConceptSearchTerm(msg.content.split(" ").slice(0, 3).join(" "))
                                            }}
                                            className="text-xs text-primary flex items-center gap-1 hover:underline"
                                          >
                                            <GraduationCapIcon className="h-3 w-3" />
                                            <span>Learn more about this topic</span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p>{msg.content}</p>
                                  )}
                                </div>
                                {msg.role === "user" && (
                                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                      <path
                                        fillRule="evenodd"
                                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}

                          {isTyping && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mb-4 mr-auto max-w-[80%]"
                            >
                              <div className="flex items-start gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                                  <BotIcon className="text-primary-foreground h-4 w-4" />
                                </div>
                                <div className="p-3 rounded-lg bg-accent rounded-tl-none">
                                  <div className="flex gap-1 items-center">
                                    <div className="flex space-x-1">
                                      <motion.div
                                        animate={{
                                          scale: [1, 1.2, 1],
                                          opacity: [0.5, 1, 0.5],
                                        }}
                                        transition={{
                                          duration: 1.5,
                                          repeat: Number.POSITIVE_INFINITY,
                                          repeatType: "loop",
                                        }}
                                        className="w-1.5 h-1.5 rounded-full bg-primary"
                                      />
                                      <motion.div
                                        animate={{
                                          scale: [1, 1.2, 1],
                                          opacity: [0.5, 1, 0.5],
                                        }}
                                        transition={{
                                          duration: 1.5,
                                          delay: 0.2,
                                          repeat: Number.POSITIVE_INFINITY,
                                          repeatType: "loop",
                                        }}
                                        className="w-1.5 h-1.5 rounded-full bg-primary"
                                      />
                                      <motion.div
                                        animate={{
                                          scale: [1, 1.2, 1],
                                          opacity: [0.5, 1, 0.5],
                                        }}
                                        transition={{
                                          duration: 1.5,
                                          delay: 0.4,
                                          repeat: Number.POSITIVE_INFINITY,
                                          repeatType: "loop",
                                        }}
                                        className="w-1.5 h-1.5 rounded-full bg-primary"
                                      />
                                    </div>
                                    <span className="text-xs text-muted-foreground ml-1">
                                      Researching financial insights...
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>

                        <div className="relative">
                          <Input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask about investing..."
                            className="pr-10"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleSendMessage()
                              }
                            }}
                            disabled={isTyping}
                          />
                          <Button
                            type="submit"
                            size="icon"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                            onClick={handleSendMessage}
                            disabled={!message.trim() || isTyping}
                          >
                            <SendIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Learn mode */}
                    {mode === "learn" && !showConcepts && (
                      <div>
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <GraduationCapIcon className="text-primary h-4 w-4" />
                          <span>Learning Center</span>
                        </h3>

                        <p className="text-muted-foreground mb-6 text-sm">
                          New to investing? Start here to learn the basics and build your knowledge.
                        </p>

                        <div className="grid grid-cols-1 gap-3 mb-6">
                          <Button
                            onClick={() => {
                              setShowConcepts(true)
                              setActiveConcept(0)
                            }}
                            variant="outline"
                            className="justify-start h-auto py-3 px-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <LightbulbIcon className="h-4 w-4" />
                              </div>
                              <div className="text-left">
                                <h4 className="font-medium text-sm">Stock Market Concepts</h4>
                                <p className="text-xs text-muted-foreground">
                                  Learn key terms and concepts for beginners
                                </p>
                              </div>
                            </div>
                          </Button>

                          <Button
                            onClick={() => setMode("risk")}
                            variant="outline"
                            className="justify-start h-auto py-3 px-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <ActivityIcon className="h-4 w-4" />
                              </div>
                              <div className="text-left">
                                <h4 className="font-medium text-sm">Understand Your Risk Profile</h4>
                                <p className="text-xs text-muted-foreground">
                                  Discover your investment style and risk tolerance
                                </p>
                              </div>
                            </div>
                          </Button>

                          <Button
                            onClick={() => setMode("simulator")}
                            variant="outline"
                            className="justify-start h-auto py-3 px-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <TrendingUpIcon className="h-4 w-4" />
                              </div>
                              <div className="text-left">
                                <h4 className="font-medium text-sm">Practice with Virtual Money</h4>
                                <p className="text-xs text-muted-foreground">
                                  Try investing without risk using our simulator
                                </p>
                              </div>
                            </div>
                          </Button>

                          <Button
                            onClick={() => {
                              setMode("chat")
                              setConversation([
                                ...conversation,
                                {
                                  role: "user",
                                  content: "Can you explain how to start investing as a beginner?",
                                },
                              ])
                              setIsTyping(true)
                              setTimeout(() => {
                                setConversation((prev) => [
                                  ...prev,
                                  {
                                    role: "assistant",
                                    content:
                                      "🌱 Starting to invest is easier than you might think! Here's a simple step-by-step guide:\n\n1. Set clear financial goals (retirement, house, etc.)\n2. Build an emergency fund first (3-6 months of expenses)\n3. Pay off high-interest debt\n4. Understand your risk tolerance (try our Risk Assessment)\n5. Start with a small amount in index funds or ETFs\n6. Consider tax-advantaged accounts like 401(k) or IRA\n7. Diversify your investments\n8. Stay consistent with regular contributions\n9. Be patient and think long-term\n\nWould you like me to explain any of these steps in more detail?",
                                  },
                                ])
                                setIsTyping(false)
                              }, 1500)
                            }}
                            variant="outline"
                            className="justify-start h-auto py-3 px-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <HelpCircleIcon className="h-4 w-4" />
                              </div>
                              <div className="text-left">
                                <h4 className="font-medium text-sm">Ask Basic Questions</h4>
                                <p className="text-xs text-muted-foreground">
                                  Get simple explanations to your investing questions
                                </p>
                              </div>
                            </div>
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Concepts mode (part of Learn) */}
                    {mode === "learn" && showConcepts && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <button
                            onClick={() => setShowConcepts(false)}
                            className="flex items-center gap-1 text-primary text-sm hover:underline"
                          >
                            <ChevronLeftIcon className="h-3 w-3" />
                            <span>Back to Learning Center</span>
                          </button>

                          <div className="text-xs text-muted-foreground">
                            {activeConcept + 1} of {filteredConcepts.length}
                          </div>
                        </div>

                        <div className="mb-4">
                          <Input
                            type="text"
                            value={conceptSearchTerm}
                            onChange={(e) => setConceptSearchTerm(e.target.value)}
                            placeholder="Search concepts..."
                          />
                        </div>

                        {filteredConcepts.length > 0 ? (
                          <Card className="mb-4">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  {filteredConcepts[activeConcept].icon}
                                </div>
                                <h3 className="text-lg font-medium">{filteredConcepts[activeConcept].title}</h3>
                              </div>

                              <p className="mb-4 text-sm">{filteredConcepts[activeConcept].description}</p>

                              <div className="bg-accent p-3 rounded-lg mb-4">
                                <h4 className="font-medium text-sm mb-1">Example:</h4>
                                <p className="text-muted-foreground text-sm">
                                  {filteredConcepts[activeConcept].example}
                                </p>
                              </div>

                              <div className="flex justify-between">
                                <Button
                                  onClick={() => setActiveConcept((prev) => Math.max(0, prev - 1))}
                                  disabled={activeConcept === 0}
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <ChevronLeftIcon className="h-4 w-4" />
                                </Button>

                                <Button
                                  onClick={() =>
                                    setActiveConcept((prev) => Math.min(filteredConcepts.length - 1, prev + 1))
                                  }
                                  disabled={activeConcept === filteredConcepts.length - 1}
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <ChevronRightIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card className="mb-4">
                            <CardContent className="p-4 text-center">
                              <p className="text-muted-foreground">No concepts found matching "{conceptSearchTerm}"</p>
                              <Button
                                onClick={() => setConceptSearchTerm("")}
                                variant="link"
                                className="mt-2 text-primary"
                              >
                                Clear search
                              </Button>
                            </CardContent>
                          </Card>
                        )}

                        <div className="grid grid-cols-4 gap-2">
                          {filteredConcepts.map((concept, index) => (
                            <Button
                              key={index}
                              onClick={() => setActiveConcept(index)}
                              variant={activeConcept === index ? "default" : "outline"}
                              className="h-auto py-2 px-1 flex flex-col items-center"
                              size="sm"
                            >
                              <div className="text-lg mb-1">{concept.icon}</div>
                              <div className="text-xs truncate">{concept.title}</div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risk Assessment mode */}
                    {mode === "risk" && !showRiskResult && (
                      <div>
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <ActivityIcon className="text-primary h-4 w-4" />
                          <span>Risk Tolerance Assessment</span>
                        </h3>

                        <p className="text-muted-foreground mb-6 text-sm">
                          Answer these questions to help determine your investment risk tolerance.
                        </p>

                        <Card className="mb-6">
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-4 text-sm">
                              Question {activeQuestion + 1} of {riskQuestions.length}:
                            </h4>

                            <p className="mb-6">{riskQuestions[activeQuestion].question}</p>

                            <div className="mb-4">
                              <Slider
                                value={[riskQuestions[activeQuestion].answer]}
                                min={riskQuestions[activeQuestion].min}
                                max={riskQuestions[activeQuestion].max}
                                step={1}
                                onValueChange={(value) => {
                                  const newQuestions = [...riskQuestions]
                                  newQuestions[activeQuestion].answer = value[0]
                                  setRiskQuestions(newQuestions)
                                }}
                              />

                              <div className="flex justify-between mt-2">
                                {riskQuestions[activeQuestion].labels.map((label, index) => (
                                  <div
                                    key={index}
                                    className={cn(
                                      "text-xs",
                                      index + 1 === riskQuestions[activeQuestion].answer
                                        ? "text-primary font-medium"
                                        : "text-muted-foreground",
                                    )}
                                  >
                                    {label}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-between">
                              <Button
                                onClick={() => setActiveQuestion((prev) => Math.max(0, prev - 1))}
                                disabled={activeQuestion === 0}
                                variant="outline"
                              >
                                Previous
                              </Button>

                              {activeQuestion < riskQuestions.length - 1 ? (
                                <Button onClick={() => setActiveQuestion((prev) => prev + 1)}>Next</Button>
                              ) : (
                                <Button onClick={handleRiskAssessment}>See Results</Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Risk Assessment Results */}
                    {mode === "risk" && showRiskResult && (
                      <div>
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <ActivityIcon className="text-primary h-4 w-4" />
                          <span>Your Risk Profile</span>
                        </h3>

                        <Card className="mb-6">
                          <CardContent className="p-4">
                            <div className="flex justify-center mb-6">
                              <div className="w-24 h-24 rounded-full border-4 border-primary flex items-center justify-center text-center">
                                <div>
                                  <div className="text-2xl font-bold">{Math.round(riskScore)}%</div>
                                  <div className="text-xs text-muted-foreground">Risk Score</div>
                                </div>
                              </div>
                            </div>

                            <h4 className="text-lg font-medium text-center mb-2">{getRiskProfile().name} Investor</h4>

                            <p className="text-center mb-6 text-sm">{getRiskProfile().description}</p>

                            <div className="mb-6">
                              <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500"
                                  style={{ width: `100%` }}
                                ></div>
                              </div>

                              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                <div>Conservative</div>
                                <div>Moderate</div>
                                <div>Aggressive</div>
                              </div>
                            </div>

                            <div className="bg-accent p-4 rounded-lg mb-6">
                              <h5 className="font-medium mb-2 text-sm">Recommended Asset Allocation:</h5>

                              {riskScore < 30 && (
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/20">
                                    <div className="font-medium text-sm">70% Bonds</div>
                                    <div className="text-xs text-muted-foreground">Treasury, Municipal, Corporate</div>
                                  </div>
                                  <div className="p-2 rounded bg-green-100 dark:bg-green-900/20">
                                    <div className="font-medium text-sm">20% Stocks</div>
                                    <div className="text-xs text-muted-foreground">Blue-chip, Dividend-paying</div>
                                  </div>
                                  <div className="p-2 rounded bg-amber-100 dark:bg-amber-900/20">
                                    <div className="font-medium text-sm">5% Real Estate</div>
                                    <div className="text-xs text-muted-foreground">REITs</div>
                                  </div>
                                  <div className="p-2 rounded bg-purple-100 dark:bg-purple-900/20">
                                    <div className="font-medium text-sm">5% Cash</div>
                                    <div className="text-xs text-muted-foreground">Money Market, CDs</div>
                                  </div>
                                </div>
                              )}

                              {riskScore >= 30 && riskScore < 50 && (
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/20">
                                    <div className="font-medium text-sm">50% Bonds</div>
                                    <div className="text-xs text-muted-foreground">Treasury, Municipal, Corporate</div>
                                  </div>
                                  <div className="p-2 rounded bg-green-100 dark:bg-green-900/20">
                                    <div className="font-medium text-sm">40% Stocks</div>
                                    <div className="text-xs text-muted-foreground">Blue-chip, Dividend, Growth</div>
                                  </div>
                                  <div className="p-2 rounded bg-amber-100 dark:bg-amber-900/20">
                                    <div className="font-medium text-sm">5% Real Estate</div>
                                    <div className="text-xs text-muted-foreground">REITs</div>
                                  </div>
                                  <div className="p-2 rounded bg-purple-100 dark:bg-purple-900/20">
                                    <div className="font-medium text-sm">5% Cash</div>
                                    <div className="text-xs text-muted-foreground">Money Market, CDs</div>
                                  </div>
                                </div>
                              )}

                              {riskScore >= 50 && riskScore < 70 && (
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="p-2 rounded bg-green-100 dark:bg-green-900/20">
                                    <div className="font-medium text-sm">60% Stocks</div>
                                    <div className="text-xs text-muted-foreground">
                                      Blue-chip, Growth, International
                                    </div>
                                  </div>
                                  <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/20">
                                    <div className="font-medium text-sm">30% Bonds</div>
                                    <div className="text-xs text-muted-foreground">Corporate, Municipal</div>
                                  </div>
                                  <div className="p-2 rounded bg-amber-100 dark:bg-amber-900/20">
                                    <div className="font-medium text-sm">5% Real Estate</div>
                                    <div className="text-xs text-muted-foreground">REITs</div>
                                  </div>
                                  <div className="p-2 rounded bg-red-100 dark:bg-red-900/20">
                                    <div className="font-medium text-sm">5% Alternative</div>
                                    <div className="text-xs text-muted-foreground">Commodities, Precious Metals</div>
                                  </div>
                                </div>
                              )}

                              {riskScore >= 70 && riskScore < 85 && (
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="p-2 rounded bg-green-100 dark:bg-green-900/20">
                                    <div className="font-medium text-sm">75% Stocks</div>
                                    <div className="text-xs text-muted-foreground">
                                      Growth, Small-cap, International
                                    </div>
                                  </div>
                                  <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/20">
                                    <div className="font-medium text-sm">15% Bonds</div>
                                    <div className="text-xs text-muted-foreground">Corporate, High-yield</div>
                                  </div>
                                  <div className="p-2 rounded bg-red-100 dark:bg-red-900/20">
                                    <div className="font-medium text-sm">5% Alternative</div>
                                    <div className="text-xs text-muted-foreground">Commodities, Precious Metals</div>
                                  </div>
                                  <div className="p-2 rounded bg-amber-100 dark:bg-amber-900/20">
                                    <div className="font-medium text-sm">5% Real Estate</div>
                                    <div className="text-xs text-muted-foreground">REITs</div>
                                  </div>
                                </div>
                              )}

                              {riskScore >= 85 && (
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="p-2 rounded bg-green-100 dark:bg-green-900/20">
                                    <div className="font-medium text-sm">85% Stocks</div>
                                    <div className="text-xs text-muted-foreground">
                                      Growth, Small-cap, Emerging Markets
                                    </div>
                                  </div>
                                  <div className="p-2 rounded bg-red-100 dark:bg-red-900/20">
                                    <div className="font-medium text-sm">10% Alternative</div>
                                    <div className="text-xs text-muted-foreground">
                                      Commodities, Crypto, Private Equity
                                    </div>
                                  </div>
                                  <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/20">
                                    <div className="font-medium text-sm">5% Bonds</div>
                                    <div className="text-xs text-muted-foreground">High-yield, International</div>
                                  </div>
                                  <div className="p-2 rounded bg-amber-100 dark:bg-amber-900/20">
                                    <div className="font-medium text-sm">0% Cash</div>
                                    <div className="text-xs text-muted-foreground">Fully invested</div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-between">
                              <Button
                                onClick={() => {
                                  setShowRiskResult(false)
                                  setActiveQuestion(0)
                                }}
                                variant="outline"
                              >
                                Retake Assessment
                              </Button>

                              <Button
                                onClick={() => {
                                  setMode("simulator")
                                  setConversation([
                                    ...conversation,
                                    {
                                      role: "assistant",
                                      content: `Based on your risk assessment, you have a ${getRiskProfile().name.toLowerCase()} risk profile. Would you like to try our investment simulator to practice building a portfolio that matches this risk level?`,
                                    },
                                  ])
                                }}
                              >
                                Try Simulator
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Investment Simulator mode */}
                    {mode === "simulator" && (
                      <div>
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <TrendingUpIcon className="text-primary h-4 w-4" />
                          <span>Investment Simulator</span>
                        </h3>

                        <p className="text-muted-foreground mb-4 text-sm">
                          Practice investing with $10,000 of virtual money without any real-world risk.
                        </p>

                        <Card className="mb-4">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-xs text-muted-foreground">Available Cash</div>
                                <div className="text-lg font-medium">${virtualCash.toFixed(2)}</div>
                              </div>

                              <Button
                                onClick={() => setShowPortfolioValue(!showPortfolioValue)}
                                variant="outline"
                                size="sm"
                              >
                                {showPortfolioValue ? "Hide Value" : "Show Value"}
                              </Button>

                              {showPortfolioValue && (
                                <div className="text-right">
                                  <div className="text-xs text-muted-foreground">Portfolio Value</div>
                                  <div className="text-lg font-medium">${portfolioValue.toFixed(2)}</div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Stock search */}
                        <div className="mb-4">
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              value={stockSearch}
                              onChange={(e) => setStockSearch(e.target.value)}
                              placeholder="Search for a stock (e.g., AAPL, Tesla)"
                              onKeyDown={(e) => e.key === "Enter" && handleSearchStocks()}
                            />
                            <Button onClick={handleSearchStocks} disabled={!stockSearch.trim()}>
                              Search
                            </Button>
                          </div>

                          {showStockSearch && stockResults.length > 0 && (
                            <Card className="mt-2">
                              <CardContent className="p-2 max-h-40 overflow-y-auto">
                                {stockResults.map((stock, index) => (
                                  <Button
                                    key={index}
                                    onClick={() => selectStock(stock)}
                                    variant="ghost"
                                    className="w-full justify-between"
                                  >
                                    <div>
                                      <div className="font-medium text-sm">{stock.symbol}</div>
                                      <div className="text-xs text-muted-foreground">{stock.name}</div>
                                    </div>
                                    <div className="text-right">
                                      <div>${stock.price.toFixed(2)}</div>
                                      <div
                                        className={stock.change >= 0 ? "text-success text-xs" : "text-error text-xs"}
                                      >
                                        {stock.change >= 0 ? "+" : ""}
                                        {stock.changePercent.toFixed(2)}%
                                      </div>
                                    </div>
                                  </Button>
                                ))}
                              </CardContent>
                            </Card>
                          )}
                        </div>

                        {/* Selected stock */}
                        {selectedStock && (
                          <Card className="mb-4">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center mb-4">
                                <div>
                                  <div className="font-medium text-sm">{selectedStock.symbol}</div>
                                  <div className="text-xs text-muted-foreground">{selectedStock.name}</div>
                                </div>
                                <div className="text-right">
                                  <div>${selectedStock.price.toFixed(2)}</div>
                                  <div
                                    className={
                                      selectedStock.change >= 0 ? "text-success text-xs" : "text-error text-xs"
                                    }
                                  >
                                    {selectedStock.change >= 0 ? "+" : ""}
                                    {selectedStock.changePercent.toFixed(2)}%
                                  </div>
                                </div>
                              </div>

                              <div className="mb-4">
                                <label className="block text-xs text-muted-foreground mb-1">
                                  Number of shares to buy:
                                </label>
                                <div className="flex items-center gap-2">
                                  <Slider
                                    value={[purchaseAmount]}
                                    min={1}
                                    max={Math.floor(virtualCash / selectedStock.price)}
                                    step={1}
                                    onValueChange={(value) => setPurchaseAmount(value[0])}
                                  />
                                  <Input
                                    type="number"
                                    min="1"
                                    max={Math.floor(virtualCash / selectedStock.price)}
                                    value={purchaseAmount}
                                    onChange={(e) => {
                                      const val = Number.parseInt(e.target.value)
                                      if (val > 0 && val <= Math.floor(virtualCash / selectedStock.price)) {
                                        setPurchaseAmount(val)
                                      }
                                    }}
                                    className="w-20 text-center"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-between items-center mb-4">
                                <div className="text-xs text-muted-foreground">Total Cost:</div>
                                <div className="font-medium">${(selectedStock.price * purchaseAmount).toFixed(2)}</div>
                              </div>

                              <div className="flex justify-between">
                                <Button onClick={() => setSelectedStock(null)} variant="outline">
                                  Cancel
                                </Button>
                                <Button onClick={handleBuyStock}>Buy Shares</Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Purchase confirmation */}
                        {showPurchaseConfirmation && (
                          <div className="bg-success/20 border border-success rounded-lg p-4 mb-4 text-success">
                            <div className="flex items-center gap-2 mb-2">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                ></path>
                              </svg>
                              <span className="font-medium">Purchase Successful!</span>
                            </div>
                            <p className="text-sm">
                              You bought {purchaseAmount} shares of {selectedStock?.symbol} for $
                              {(selectedStock?.price * purchaseAmount).toFixed(2)}.
                            </p>
                          </div>
                        )}

                        {/* Portfolio */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Your Portfolio</h4>
                            {virtualPortfolio.length > 0 && (
                              <Button onClick={resetSimulator} variant="link" className="text-xs text-primary">
                                Reset Simulator
                              </Button>
                            )}
                          </div>

                          {virtualPortfolio.length === 0 ? (
                            <Card>
                              <CardContent className="p-4 text-center">
                                <p className="text-muted-foreground mb-2">Your portfolio is empty</p>
                                <p className="text-sm">Search for stocks above to start investing</p>
                              </CardContent>
                            </Card>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full table-auto">
                                <thead className="bg-accent text-xs text-muted-foreground [&_th]:p-2">
                                  <tr>
                                    <th>Symbol</th>
                                    <th className="text-right">Shares</th>
                                    <th className="text-right">Price</th>
                                    <th className="text-right">Value</th>
                                    <th className="text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {virtualPortfolio.map((stock, index) => (
                                    <tr key={index} className="border-b border-border last:border-none">
                                      <td className="p-2 font-medium text-sm">{stock.symbol}</td>
                                      <td className="p-2 text-right text-sm">{stock.shares}</td>
                                      <td className="p-2 text-right text-sm">${stock.price.toFixed(2)}</td>
                                      <td className="p-2 text-right text-sm">
                                        ${(stock.price * stock.shares).toFixed(2)}
                                      </td>
                                      <td className="p-2 text-right">
<Button onClick={() => handleSellStock(index)} variant="outline" size="sm">
                                          Sell
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>   
                  </Tabs>                          
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
