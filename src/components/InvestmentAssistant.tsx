"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaRobot,
  FaChartLine,
  FaGraduationCap,
  FaCoins,
  FaChevronRight,
  FaChevronLeft,
  FaTimes,
  FaRegLightbulb,
  FaRegQuestionCircle,
  FaRegCommentDots,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa"
import { RiMentalHealthLine } from "react-icons/ri"
import { BsGraphUp } from "react-icons/bs"
import { GiTakeMyMoney } from "react-icons/gi"

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
      icon: <FaChartLine className="text-blue-500" />,
    },
    {
      title: "Dividend",
      description:
        "A dividend is a payment made by a company to its shareholders, usually as a distribution of profits.",
      example: "If a company pays a $2 dividend per share and you own 10 shares, you'll receive $20 in dividends.",
      icon: <FaCoins className="text-yellow-500" />,
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
      icon: <FaChartLine className="text-green-500" />,
    },
    {
      title: "Bear Market",
      description: "A bear market is a market condition in which prices are falling or expected to fall.",
      example:
        "During the 2008 financial crisis, the stock market entered a bear market with stocks falling more than 20%.",
      icon: <FaChartLine className="text-red-500" />,
    },
    {
      title: "Diversification",
      description:
        "Diversification is a risk management strategy that mixes a variety of investments within a portfolio.",
      example:
        "Instead of investing all your money in one company, you might invest in 20 different companies across various industries.",
      icon: <RiMentalHealthLine className="text-blue-500" />,
    },
    {
      title: "ETF",
      description:
        "An Exchange-Traded Fund (ETF) is a type of investment fund that tracks an index, sector, commodity, or other asset.",
      example:
        "Instead of buying shares in individual tech companies, you could buy a tech sector ETF that includes many tech companies.",
      icon: <FaCoins className="text-yellow-500" />,
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
          content: "Sorry, I encountered an error while processing your request. Please try again later." 
        }
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const fetchPerplexityResponse = async (query: string) => {
    try {
      // Add finance-specific context to the query
      const enhancedQuery = `As a financial advisor, please answer this investment-related question to user's in a beginner friendly manner and use simple language and don't yap: ${query}`
      
      const response = await fetch('/api/response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        color: "yellow",
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
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center shadow-lg z-50"
          onClick={() => setIsOpen(true)}
        >
          <FaRobot className="text-2xl" />
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
              width: isMinimized ? "300px" : "500px",
              height: isMinimized ? "80px" : "600px",
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 bg-card-bg border border-border rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <FaRobot className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Investment Assistant</h3>
                  {!isMinimized && <p className="text-white/80 text-sm">Your personal guide to investing</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  {isMinimized ? <FaChevronUp /> : <FaChevronDown />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Mode tabs */}
                <div className="flex border-b border-border">
                  <button
                    onClick={() => setMode("chat")}
                    className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
                      mode === "chat" ? "bg-card-hover text-primary" : "hover:bg-card-hover"
                    }`}
                  >
                    <FaRegCommentDots />
                    <span>Chat</span>
                  </button>
                  <button
                    onClick={() => {
                      setMode("learn")
                      setShowConcepts(false)
                    }}
                    className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
                      mode === "learn" ? "bg-card-hover text-primary" : "hover:bg-card-hover"
                    }`}
                  >
                    <FaGraduationCap />
                    <span>Learn</span>
                  </button>
                  <button
                    onClick={() => {
                      setMode("simulator")
                      calculatePortfolioValue()
                    }}
                    className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
                      mode === "simulator" ? "bg-card-hover text-primary" : "hover:bg-card-hover"
                    }`}
                  >
                    <FaChartLine />
                    <span>Simulator</span>
                  </button>
                  <button
                    onClick={() => {
                      setMode("risk")
                      setShowRiskResult(false)
                    }}
                    className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
                      mode === "risk" ? "bg-card-hover text-primary" : "hover:bg-card-hover"
                    }`}
                  >
                    <RiMentalHealthLine />
                    <span>Risk</span>
                  </button>
                </div>

                {/* Content area */}
                <div className="flex-1 overflow-y-auto p-4">
                  {/* Chat mode */}
                  {mode === "chat" && (
                    <div className="h-full flex flex-col">
                      <div className="flex-1 overflow-y-auto mb-4 px-2">
                        {conversation.map((msg, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 * (index % 3) }}
                            className={`mb-4 ${msg.role === "user" ? "ml-auto max-w-[80%]" : "mr-auto max-w-[80%]"}`}
                          >
                            <div className="flex items-start gap-2">
                              {msg.role === "assistant" && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0 mt-1">
                                  <FaRobot className="text-white text-sm" />
                                </div>
                              )}
                              <div
                                className={`p-4 rounded-lg shadow-sm ${
                                  msg.role === "user"
                                    ? "bg-gradient-to-r from-primary to-secondary text-white rounded-tr-none"
                                    : "bg-card-hover rounded-tl-none border border-border"
                                }`}
                              >
                                {msg.role === "assistant" ? (
                                  <div>
                                    {msg.content.split('\n').map((paragraph, i) => {
                                      // Check if paragraph contains a stock symbol pattern like $AAPL
                                      const hasStockSymbol = /\$[A-Z]{1,5}/.test(paragraph);
                                      
                                      // Check if paragraph mentions percentage
                                      const hasPercentage = /\d+(\.\d+)?%/.test(paragraph);
                                      
                                      // Check if paragraph is about market trends
                                      const isTrend = /trend|bull|bear|market|growth|decline/.test(paragraph.toLowerCase());
                                      
                                      return (
                                        <div key={i} className="mb-2">
                                          {hasStockSymbol ? (
                                            <div className="flex items-center gap-2 font-medium">
                                              <FaChartLine className="text-primary" />
                                              <span dangerouslySetInnerHTML={{ 
                                                __html: paragraph.replace(/\$([A-Z]{1,5})/g, '<span class="text-primary font-bold">$$$1</span>') 
                                              }} />
                                            </div>
                                          ) : hasPercentage ? (
                                            <div className="flex items-center gap-2 font-medium">
                                              <BsGraphUp className={paragraph.includes('-') ? "text-red-500" : "text-green-500"} />
                                              <span dangerouslySetInnerHTML={{ 
                                                __html: paragraph.replace(/(\d+(\.\d+)?%)/g, '<span class="font-bold">$1</span>') 
                                              }} />
                                            </div>
                                          ) : isTrend ? (
                                            <div className="flex items-center gap-2 font-medium">
                                              <FaRegLightbulb className="text-yellow-500" />
                                              {paragraph}
                                            </div>
                                          ) : (
                                            <p>{paragraph}</p>
                                          )}
                                        </div>
                                      );
                                    })}
                                    
                                    {/* Add a "Learn more" button for longer responses */}
                                    {msg.content.length > 100 && (
                                      <div className="mt-3 pt-2 border-t border-border">
                                        <button 
                                          onClick={() => {
                                            setMode("learn");
                                            setConceptSearchTerm(msg.content.split(' ').slice(0, 3).join(' '));
                                          }}
                                          className="text-sm text-primary flex items-center gap-1 hover:underline"
                                        >
                                          <FaGraduationCap />
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
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
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
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0 mt-1">
                                <FaRobot className="text-white text-sm" />
                              </div>
                              <div className="p-4 rounded-lg bg-card-hover rounded-tl-none border border-border shadow-sm">
                                <div className="flex gap-2 items-center">
                                  <div className="flex space-x-1">
                                    <motion.div
                                      animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 1, 0.5]
                                      }}
                                      transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        repeatType: "loop"
                                      }}
                                      className="w-2 h-2 rounded-full bg-primary"
                                    />
                                    <motion.div
                                      animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 1, 0.5]
                                      }}
                                      transition={{
                                        duration: 1.5,
                                        delay: 0.2,
                                        repeat: Infinity,
                                        repeatType: "loop"
                                      }}
                                      className="w-2 h-2 rounded-full bg-primary"
                                    />
                                    <motion.div
                                      animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 1, 0.5]
                                      }}
                                      transition={{
                                        duration: 1.5,
                                        delay: 0.4,
                                        repeat: Infinity,
                                        repeatType: "loop"
                                      }}
                                      className="w-2 h-2 rounded-full bg-primary"
                                    />
                                  </div>
                                  <span className="text-sm text-muted-foreground ml-1">Researching financial insights...</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                      
                      <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        onSubmit={(e) => {
                          e.preventDefault()
                          handleSendMessage()
                        }}
                        className="flex gap-2 relative"
                      >
                        <input
                          type="text"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Ask about investing..."
                          className="flex-1 bg-card-hover rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary border border-border shadow-sm transition-all"
                          disabled={isTyping}
                        />
                        <button
                          type="submit"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!message.trim() || isTyping}
                        >
                          <motion.div
                            whileHover={{ rotate: 45 }}
                            transition={{ duration: 0.2 }}
                          >
                            <FaChevronRight />
                          </motion.div>
                        </button>
                      </motion.form>
                    </div>
                  )}
                  {/* Simulator mode */}

                  {/* Learn mode */}
                  {mode === "learn" && !showConcepts && (
                    <div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FaGraduationCap className="text-primary" />
                        <span>Learning Center</span>
                      </h3>

                      <p className="text-muted-foreground mb-6">
                        New to investing? Start here to learn the basics and build your knowledge.
                      </p>

                      <div className="grid grid-cols-1 gap-4 mb-6">
                        <button
                          onClick={() => {
                            setShowConcepts(true)
                            setActiveConcept(0)
                          }}
                          className="p-4 bg-card-hover rounded-lg hover:bg-opacity-80 transition-colors flex items-center gap-4 hover-lift text-left"
                        >
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <FaRegLightbulb className="text-xl" />
                          </div>
                          <div>
                            <h4 className="font-medium">Stock Market Concepts</h4>
                            <p className="text-sm text-muted-foreground">Learn key terms and concepts for beginners</p>
                          </div>
                        </button>

                        <button
                          onClick={() => setMode("risk")}
                          className="p-4 bg-card-hover rounded-lg hover:bg-opacity-80 transition-colors flex items-center gap-4 hover-lift text-left"
                        >
                          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                            <RiMentalHealthLine className="text-xl" />
                          </div>
                          <div>
                            <h4 className="font-medium">Understand Your Risk Profile</h4>
                            <p className="text-sm text-muted-foreground">
                              Discover your investment style and risk tolerance
                            </p>
                          </div>
                        </button>

                        <button
                          onClick={() => setMode("simulator")}
                          className="p-4 bg-card-hover rounded-lg hover:bg-opacity-80 transition-colors flex items-center gap-4 hover-lift text-left"
                        >
                          <div className="w-12 h-12 rounded-full bg-blue-400/20 flex items-center justify-center text-blue-400">
                            <FaChartLine className="text-xl" />
                          </div>
                          <div>
                            <h4 className="font-medium">Practice with Virtual Money</h4>
                            <p className="text-sm text-muted-foreground">
                              Try investing without risk using our simulator
                            </p>
                          </div>
                        </button>

                        <button
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
                          className="p-4 bg-card-hover rounded-lg hover:bg-opacity-80 transition-colors flex items-center gap-4 hover-lift text-left"
                        >
                          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                            <FaRegQuestionCircle className="text-xl" />
                          </div>
                          <div>
                            <h4 className="font-medium">Ask Basic Questions</h4>
                            <p className="text-sm text-muted-foreground">
                              Get simple explanations to your investing questions
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Concepts mode (part of Learn) */}
                  {mode === "learn" && showConcepts && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => setShowConcepts(false)}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <FaChevronLeft className="text-xs" />
                          <span>Back to Learning Center</span>
                        </button>

                        <div className="text-sm text-muted-foreground">
                          {activeConcept + 1} of {filteredConcepts.length}
                        </div>
                      </div>

                      <div className="mb-4">
                        <input
                          type="text"
                          value={conceptSearchTerm}
                          onChange={(e) => setConceptSearchTerm(e.target.value)}
                          placeholder="Search concepts..."
                          className="w-full px-4 py-2 rounded-lg bg-card-hover border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {filteredConcepts.length > 0 ? (
                        <div className="bg-card-hover rounded-lg p-6 mb-4">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              {filteredConcepts[activeConcept].icon}
                            </div>
                            <h3 className="text-xl font-bold">{filteredConcepts[activeConcept].title}</h3>
                          </div>

                          <p className="mb-4">{filteredConcepts[activeConcept].description}</p>

                          <div className="bg-card-bg p-4 rounded-lg mb-4">
                            <h4 className="font-medium mb-2">Example:</h4>
                            <p className="text-muted-foreground">{filteredConcepts[activeConcept].example}</p>
                          </div>

                          <div className="flex justify-between">
                            <button
                              onClick={() => setActiveConcept((prev) => Math.max(0, prev - 1))}
                              disabled={activeConcept === 0}
                              className="px-3 py-1 rounded-lg bg-card-bg hover:bg-opacity-80 transition-colors disabled:opacity-50"
                            >
                              <FaChevronLeft />
                            </button>

                            <button
                              onClick={() =>
                                setActiveConcept((prev) => Math.min(filteredConcepts.length - 1, prev + 1))
                              }
                              disabled={activeConcept === filteredConcepts.length - 1}
                              className="px-3 py-1 rounded-lg bg-card-bg hover:bg-opacity-80 transition-colors disabled:opacity-50"
                            >
                              <FaChevronRight />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-card-hover rounded-lg p-6 mb-4 text-center">
                          <p className="text-muted-foreground">No concepts found matching "{conceptSearchTerm}"</p>
                          <button
                            onClick={() => setConceptSearchTerm("")}
                            className="mt-2 text-primary hover:underline"
                          >
                            Clear search
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-4 gap-2">
                        {filteredConcepts.map((concept, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveConcept(index)}
                            className={`p-2 rounded-lg text-center transition-colors ${
                              activeConcept === index ? "bg-primary text-white" : "bg-card-bg hover:bg-card-hover"
                            }`}
                          >
                            <div className="text-lg mb-1">{concept.icon}</div>
                            <div className="text-xs truncate">{concept.title}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk Assessment mode */}
                  {mode === "risk" && !showRiskResult && (
                    <div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <RiMentalHealthLine className="text-primary" />
                        <span>Risk Tolerance Assessment</span>
                      </h3>

                      <p className="text-muted-foreground mb-6">
                        Answer these questions to help determine your investment risk tolerance.
                      </p>

                      <div className="bg-card-hover rounded-lg p-6 mb-6">
                        <h4 className="font-medium mb-4">
                          Question {activeQuestion + 1} of {riskQuestions.length}:
                        </h4>

                        <p className="mb-6">{riskQuestions[activeQuestion].question}</p>

                        <div className="mb-4">
                          <input
                            type="range"
                            min={riskQuestions[activeQuestion].min}
                            max={riskQuestions[activeQuestion].max}
                            value={riskQuestions[activeQuestion].answer}
                            onChange={(e) => {
                              const newQuestions = [...riskQuestions]
                              newQuestions[activeQuestion].answer = Number.parseInt(e.target.value)
                              setRiskQuestions(newQuestions)
                            }}
                            className="w-full h-2 bg-card-bg rounded-lg appearance-none cursor-pointer"
                          />

                          <div className="flex justify-between mt-2">
                            {riskQuestions[activeQuestion].labels.map((label, index) => (
                              <div
                                key={index}
                                className={`text-xs ${
                                  index + 1 === riskQuestions[activeQuestion].answer
                                    ? "text-primary font-medium"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {label}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <button
                            onClick={() => setActiveQuestion((prev) => Math.max(0, prev - 1))}
                            disabled={activeQuestion === 0}
                            className="px-4 py-2 rounded-lg bg-card-bg hover:bg-opacity-80 transition-colors disabled:opacity-50"
                          >
                            Previous
                          </button>

                          {activeQuestion < riskQuestions.length - 1 ? (
                            <button
                              onClick={() => setActiveQuestion((prev) => prev + 1)}
                              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
                            >
                              Next
                            </button>
                          ) : (
                            <button
                              onClick={handleRiskAssessment}
                              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
                            >
                              See Results
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Risk Assessment Results */}
                  {mode === "risk" && showRiskResult && (
                    <div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <RiMentalHealthLine className="text-primary" />
                        <span>Your Risk Profile</span>
                      </h3>

                      <div className="bg-card-hover rounded-lg p-6 mb-6">
                        <div className="flex justify-center mb-6">
                          <div className="w-32 h-32 rounded-full border-8 border-primary flex items-center justify-center text-center">
                            <div>
                              <div className="text-3xl font-bold">{Math.round(riskScore)}%</div>
                              <div className="text-sm text-muted-foreground">Risk Score</div>
                            </div>
                          </div>
                        </div>

                        <h4 className="text-xl font-bold text-center mb-2">{getRiskProfile().name} Investor</h4>

                        <p className="text-center mb-6">{getRiskProfile().description}</p>

                        <div className="mb-6">
                          <div className="h-2 w-full bg-card-bg rounded-full overflow-hidden">
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

                        <div className="bg-card-bg p-4 rounded-lg mb-6">
                          <h5 className="font-medium mb-2">Recommended Asset Allocation:</h5>

                          {riskScore < 30 && (
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/20">
                                <div className="font-medium">70% Bonds</div>
                                <div className="text-xs text-muted-foreground">Treasury, Municipal, Corporate</div>
                              </div>
                              <div className="p-2 rounded bg-green-100 dark:bg-green-900/20">
                                <div className="font-medium">20% Stocks</div>
                                <div className="text-xs text-muted-foreground">Blue-chip, Dividend-paying</div>
                              </div>
                              <div className="p-2 rounded bg-yellow-100 dark:bg-yellow-900/20">
                                <div className="font-medium">5% Real Estate</div>
                                <div className="text-xs text-muted-foreground">REITs</div>
                              </div>
                              <div className="p-2 rounded bg-purple-100 dark:bg-purple-900/20">
                                <div className="font-medium">5% Cash</div>
                                <div className="text-xs text-muted-foreground">Money Market, CDs</div>
                              </div>
                            </div>
                          )}

                          {riskScore >= 30 && riskScore < 50 && (
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/20">
                                <div className="font-medium">50% Bonds</div>
                                <div className="text-xs text-muted-foreground">Treasury, Municipal, Corporate</div>
                              </div>
                              <div className="p-2 rounded bg-green-100 dark:bg-green-900/20">
                                <div className="font-medium">40% Stocks</div>
                                <div className="text-xs text-muted-foreground">Blue-chip, Dividend, Growth</div>
                              </div>
                              <div className="p-2 rounded bg-yellow-100 dark:bg-yellow-900/20">
                                <div className="font-medium">5% Real Estate</div>
                                <div className="text-xs text-muted-foreground">REITs</div>
                              </div>
                              <div className="p-2 rounded bg-purple-100 dark:bg-purple-900/20">
                                <div className="font-medium">5% Cash</div>
                                <div className="text-xs text-muted-foreground">Money Market, CDs</div>
                              </div>
                            </div>
                          )}

                          {riskScore >= 50 && riskScore < 70 && (
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 rounded bg-green-100 dark:bg-green-900/20">
                                <div className="font-medium">60% Stocks</div>
                                <div className="text-xs text-muted-foreground">Blue-chip, Growth, International</div>
                              </div>
                              <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/20">
                                <div className="font-medium">30% Bonds</div>
                                <div className="text-xs text-muted-foreground">Corporate, Municipal</div>
                              </div>
                              <div className="p-2 rounded bg-yellow-100 dark:bg-yellow-900/20">
                                <div className="font-medium">5% Real Estate</div>
                                <div className="text-xs text-muted-foreground">REITs</div>
                              </div>
                              <div className="p-2 rounded bg-red-100 dark:bg-red-900/20">
                                <div className="font-medium">5% Alternative</div>
                                <div className="text-xs text-muted-foreground">Commodities, Precious Metals</div>
                              </div>
                            </div>
                          )}

                          {riskScore >= 70 && riskScore < 85 && (
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 rounded bg-green-100 dark:bg-green-900/20">
                                <div className="font-medium">75% Stocks</div>
                                <div className="text-xs text-muted-foreground">Growth, Small-cap, International</div>
                              </div>
                              <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/20">
                                <div className="font-medium">15% Bonds</div>
                                <div className="text-xs text-muted-foreground">Corporate, High-yield</div>
                              </div>
                              <div className="p-2 rounded bg-red-100 dark:bg-red-900/20">
                                <div className="font-medium">5% Alternative</div>
                                <div className="text-xs text-muted-foreground">Commodities, Precious Metals</div>
                              </div>
                              <div className="p-2 rounded bg-yellow-100 dark:bg-yellow-900/20">
                                <div className="font-medium">5% Real Estate</div>
                                <div className="text-xs text-muted-foreground">REITs</div>
                              </div>
                            </div>
                          )}

                          {riskScore >= 85 && (
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 rounded bg-green-100 dark:bg-green-900/20">
                                <div className="font-medium">85% Stocks</div>
                                <div className="text-xs text-muted-foreground">Growth, Small-cap, Emerging Markets</div>
                              </div>
                              <div className="p-2 rounded bg-red-100 dark:bg-red-900/20">
                                <div className="font-medium">10% Alternative</div>
                                <div className="text-xs text-muted-foreground">Commodities, Crypto, Private Equity</div>
                              </div>
                              <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/20">
                                <div className="font-medium">5% Bonds</div>
                                <div className="text-xs text-muted-foreground">High-yield, International</div>
                              </div>
                              <div className="p-2 rounded bg-yellow-100 dark:bg-yellow-900/20">
                                <div className="font-medium">0% Cash</div>
                                <div className="text-xs text-muted-foreground">Fully invested</div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between">
                          <button
                            onClick={() => {
                              setShowRiskResult(false)
                              setActiveQuestion(0)
                            }}
                            className="px-4 py-2 rounded-lg bg-card-bg hover:bg-opacity-80 transition-colors"
                          >
                            Retake Assessment
                          </button>

                          <button
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
                            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
                          >
                            Try Simulator
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Investment Simulator mode */}
                  {mode === "simulator" && (
                    <div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FaChartLine className="text-primary" />
                        <span>Investment Simulator</span>
                      </h3>

                      <p className="text-muted-foreground mb-4">
                        Practice investing with $10,000 of virtual money without any real-world risk.
                      </p>

                      <div className="bg-card-hover rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sm text-muted-foreground">Available Cash</div>
                            <div className="text-xl font-bold">${virtualCash.toFixed(2)}</div>
                          </div>

                          <button
                            onClick={() => setShowPortfolioValue(!showPortfolioValue)}
                            className="px-3 py-1 rounded-lg bg-card-bg hover:bg-opacity-80 transition-colors text-sm"
                          >
                            {showPortfolioValue ? "Hide Value" : "Show Value"}
                          </button>

                          {showPortfolioValue && (
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Portfolio Value</div>
                              <div className="text-xl font-bold">${portfolioValue.toFixed(2)}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stock search */}
                      <div className="mb-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={stockSearch}
                            onChange={(e) => setStockSearch(e.target.value)}
                            placeholder="Search for a stock (e.g., AAPL, Tesla)"
                            className="flex-1 px-4 py-2 rounded-lg bg-card-bg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                            onKeyDown={(e) => e.key === "Enter" && handleSearchStocks()}
                          />
                          <button
                            onClick={handleSearchStocks}
                            disabled={!stockSearch.trim()}
                            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
                          >
                            Search
                          </button>
                        </div>

                        {showStockSearch && stockResults.length > 0 && (
                          <div className="mt-2 bg-card-bg rounded-lg border border-border p-2 max-h-40 overflow-y-auto">
                            {stockResults.map((stock, index) => (
                              <button
                                key={index}
                                onClick={() => selectStock(stock)}
                                className="w-full p-2 hover:bg-card-hover rounded-lg transition-colors flex justify-between items-center text-left"
                              >
                                <div>
                                  <div className="font-medium">{stock.symbol}</div>
                                  <div className="text-xs text-muted-foreground">{stock.name}</div>
                                </div>
                                <div className="text-right">
                                  <div>${stock.price.toFixed(2)}</div>
                                  <div className={stock.change >= 0 ? "text-success text-xs" : "text-error text-xs"}>
                                    {stock.change >= 0 ? "+" : ""}
                                    {stock.changePercent.toFixed(2)}%
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Selected stock */}
                      {selectedStock && (
                        <div className="bg-card-hover rounded-lg p-4 mb-4">
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <div className="font-medium">{selectedStock.symbol}</div>
                              <div className="text-sm text-muted-foreground">{selectedStock.name}</div>
                            </div>
                            <div className="text-right">
                              <div>${selectedStock.price.toFixed(2)}</div>
                              <div
                                className={selectedStock.change >= 0 ? "text-success text-xs" : "text-error text-xs"}
                              >
                                {selectedStock.change >= 0 ? "+" : ""}
                                {selectedStock.changePercent.toFixed(2)}%
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm text-muted-foreground mb-1">Number of shares to buy:</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="1"
                                max={Math.floor(virtualCash / selectedStock.price)}
                                value={purchaseAmount}
                                onChange={(e) => setPurchaseAmount(Number.parseInt(e.target.value))}
                                className="flex-1 h-2 bg-card-bg rounded-lg appearance-none cursor-pointer"
                              />
                              <input
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
                                className="w-20 px-2 py-1 rounded-lg bg-card-bg border border-border focus:outline-none text-center"
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center mb-4">
                            <div className="text-sm text-muted-foreground">Total Cost:</div>
                            <div className="font-bold">${(selectedStock.price * purchaseAmount).toFixed(2)}</div>
                          </div>

                          <div className="flex justify-between">
                            <button
                              onClick={() => setSelectedStock(null)}
                              className="px-4 py-2 rounded-lg bg-card-bg hover:bg-opacity-80 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleBuyStock}
                              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
                            >
                              Buy Shares
                            </button>
                          </div>
                        </div>
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
                          <p>
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
                            <button onClick={resetSimulator} className="text-sm text-primary hover:underline">
                              Reset Simulator
                            </button>
                          )}
                        </div>

                        {virtualPortfolio.length === 0 ? (
                          <div className="bg-card-bg rounded-lg p-4 text-center">
                            <p className="text-muted-foreground mb-2">Your portfolio is empty</p>
                            <p className="text-sm">Search for stocks above to start investing</p>
                          </div>
                        ) : (
                          <div className="bg-card-bg rounded-lg overflow-hidden">
                            <table className="w-full">
                              <thead className="bg-card-hover text-sm">
                                <tr>
                                  <th className="p-2 text-left">Symbol</th>
                                  <th className="p-2 text-right">Shares</th>
                                  <th className="p-2 text-right">Price</th>
                                  <th className="p-2 text-right">Value</th>
                                  <th className="p-2 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {virtualPortfolio.map((stock, index) => (
                                  <tr key={index} className="border-t border-border">
                                    <td className="p-2">
                                      <div className="font-medium">{stock.symbol}</div>
                                    </td>
                                    <td className="p-2 text-right">{stock.shares}</td>
                                    <td className="p-2 text-right">${stock.price.toFixed(2)}</td>
                                    <td className="p-2 text-right">${(stock.price * stock.shares).toFixed(2)}</td>
                                    <td className="p-2 text-right">
                                      <button
                                        onClick={() => handleSellStock(index)}
                                        className="px-2 py-1 rounded bg-card-hover hover:bg-opacity-80 transition-colors text-xs"
                                      >
                                        Sell
                                      </button>
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
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
