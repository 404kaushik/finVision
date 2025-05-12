"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Layout from "@/components/Layout"
import { supabase } from "@/utils/supabase/client"
import Link from "next/link"
import {
  FaHistory,
  FaStar,
  FaChartLine,
  FaSpinner,
  FaExternalLinkAlt,
  FaSearch,
  FaArrowUp,
  FaArrowDown,
  FaEllipsisH,
  FaTrophy,
  FaBell,
  FaRocket,
  FaChartBar,
  FaUser,
  FaSyncAlt,
} from "react-icons/fa"
import CompanyChart from "@/components/CompanyChart"
import Confetti from "react-confetti"
import { StockCarousel } from "@/components/StockCarousel"
import Image from "next/image"

interface Achievement {
  searches: boolean;
  saved: boolean;
  streak: boolean;
}

// Helper function to get emoji based on performance
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

export default function Dashboard() {
  const searchParams = useSearchParams()
  const companyName = searchParams.get("company")
  const [user, setUser] = useState<any>(null)
  const [searches, setSearches] = useState<any[]>([])
  const [savedCompanies, setSavedCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any>(null)
  const [activityData, setActivityData] = useState<any[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<any[]>([])
  const [refreshAnimation, setRefreshAnimation] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [companyLogos, setCompanyLogos] = useState<{[key: string]: string}>({})

  // Helper function to extract domain from company name for logo
  const getCompanyDomain = (companyName: string): string => {
    // Remove common business entity types and clean up for domain extraction
    const cleanName = companyName
      .toLowerCase()
      .replace(/inc\.?$|corp\.?$|corporation$|ltd\.?$|limited$|llc$/, '')
      .trim()
      .replace(/[^a-zA-Z0-9]/g, '')
    
    return cleanName
  }

  // Helper function to get company logo
  const getCompanyLogo = (companyName: string): string => {
    const domain = getCompanyDomain(companyName)
    return `https://logo.clearbit.com/${domain}.com`
  }
 
  
  const [achievements, setAchievements] = useState<Achievement>({
    searches: false, 
    saved: false, 
    streak: false
  })

  useEffect(() => {
    fetchMarketData()
    fetchUserData()
    
    // Set up auto-refresh every 60 seconds
    const interval = setInterval(fetchMarketData, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Check for achievements
    if (searches.length >= 5 && !achievements.searches) {
      setAchievements((prev: Achievement) => ({ ...prev, searches: true }))
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }

    if (savedCompanies.length >= 3 && !achievements.saved) {
      setAchievements((prev: Achievement) => ({ ...prev, saved: true }))
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }, [searches, savedCompanies, achievements])

  // Load company logos for saved companies
  useEffect(() => {
    if (savedCompanies.length > 0) {
      const logos: {[key: string]: string} = {}
      savedCompanies.forEach(company => {
        logos[company.company_name] = getCompanyLogo(company.company_name)
      })
      setCompanyLogos(logos)
    }
  }, [savedCompanies])

  // Load company logos for search history
  useEffect(() => {
    if (searches.length > 0) {
      const logos: {[key: string]: string} = { ...companyLogos }
      searches.forEach(search => {
        if (!logos[search.company_name]) {
          logos[search.company_name] = getCompanyLogo(search.company_name)
        }
      })
      setCompanyLogos(logos)
    }
  }, [searches])

  const fetchMarketData = async () => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY
      
      if (!API_KEY) {
        console.error("Finnhub API key is not defined")
        generateFallbackData()
        return
      }
      
      // Popular market indices and stocks to track
      const symbols = ["SPY", "QQQ", "DIA", "AAPL", "MSFT", "GOOGL", "AMZN"]
      
      const stockPromises = symbols.map(async (symbol) => {
        const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
        const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`
        
        try {
          const [quoteRes, profileRes] = await Promise.all([
            fetch(quoteUrl),
            fetch(profileUrl)
          ])
          
          if (!quoteRes.ok || !profileRes.ok) {
            throw new Error(`Failed to fetch data for ${symbol}`)
          }
          
          const quoteData = await quoteRes.json()
          const profileData = await profileRes.json()
          
          return {
            symbol: symbol,
            name: profileData.name || symbol,
            price: quoteData.c || 0, // Current price
            change: quoteData.d || 0, // Change
            changePercent: quoteData.dp || 0, // Change percent
            emoji: getPerformanceEmoji(quoteData.dp || 0)
          }
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error)
          return null
        }
      })
      
      const results = await Promise.allSettled(stockPromises)
      
      // Filter successful results
      const fetchedStocks = results
        .filter((result): result is PromiseFulfilledResult<any> => 
          result.status === 'fulfilled' && result.value !== null)
        .map(result => result.value)
      
      if (fetchedStocks.length > 0) {
        setMarketData(fetchedStocks)
        
        // Create chart data from fetched stocks
        const labels = fetchedStocks.map(stock => stock.symbol)
        const changes = fetchedStocks.map(stock => stock.changePercent)
        
        setChartData({
          labels,
          datasets: [
            {
              label: "Daily Change %",
              data: changes,
              borderColor: "rgba(59, 130, 246, 1)",
              backgroundColor: "rgba(59, 130, 246, 0.5)",
            },
          ],
        })
        
        // Generate activity data based on real market movements
        const newActivityData = fetchedStocks
          .filter(stock => Math.abs(stock.changePercent) > 1) // Only include stocks with significant movement
          .map(stock => {
            const isPositive = stock.changePercent > 0
            return {
              type: isPositive ? "gain" : "loss",
              company: stock.name,
              time: "today",
              emoji: stock.emoji,
              change: stock.changePercent.toFixed(2) + "%"
            }
          })
          .slice(0, 5) // Limit to 5 items
        
        if (newActivityData.length > 0) {
          setActivityData(newActivityData)
        }
        
        setLastUpdated(new Date())
      } else {
        generateFallbackData()
      }
      
      // Animate refresh button
      setRefreshAnimation(true)
      setTimeout(() => setRefreshAnimation(false), 1000)
      
    } catch (error) {
      console.error("Error fetching market data:", error)
      generateFallbackData()
    }
  }
  
  const generateFallbackData = () => {
    // Fallback data if API fails
    const fallbackMarketData = [
      { symbol: "SPY", name: "S&P 500 ETF", price: 478.34, change: 1.82, changePercent: 0.38, emoji: "📈" },
      { symbol: "QQQ", name: "Nasdaq ETF", price: 430.67, change: 2.33, changePercent: 0.54, emoji: "🔥" },
      { symbol: "DIA", name: "Dow Jones ETF", price: 385.03, change: -0.42, changePercent: -0.11, emoji: "📉" },
      { symbol: "AAPL", name: "Apple Inc.", price: 175.34, change: 2.45, changePercent: 1.42, emoji: "📈" },
      { symbol: "MSFT", name: "Microsoft Corp.", price: 340.67, change: -1.23, changePercent: -0.36, emoji: "⚠️" },
      { symbol: "GOOGL", name: "Alphabet Inc.", price: 131.86, change: 0.56, changePercent: 0.43, emoji: "✅" },
      { symbol: "AMZN", name: "Amazon.com Inc.", price: 127.74, change: -0.89, changePercent: -0.69, emoji: "📉" },
    ]
    
    setMarketData(fallbackMarketData)
    
    // Create chart data from fallback data
    const labels = fallbackMarketData.map(stock => stock.symbol)
    const changes = fallbackMarketData.map(stock => stock.changePercent)
    
    setChartData({
      labels,
      datasets: [
        {
          label: "Daily Change %",
          data: changes,
          borderColor: "rgba(59, 130, 246, 1)",
          backgroundColor: "rgba(59, 130, 246, 0.5)",
        },
      ],
    })
    
    // Generate activity data based on fallback market data
    const newActivityData = fallbackMarketData
      .filter(stock => Math.abs(stock.changePercent) > 0.3)
      .map(stock => {
        const isPositive = stock.changePercent > 0
        return {
          type: isPositive ? "gain" : "loss",
          company: stock.name,
          time: "today",
          emoji: stock.emoji,
          change: stock.changePercent.toFixed(2) + "%"
        }
      })
      .slice(0, 5)
    
    setActivityData(newActivityData)
    setLastUpdated(new Date())
  }

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()

      if (userData?.user) {
        setUser(userData.user)

        // Fetch full_name from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", userData.user.id) // match the user's ID
          .single(); // only expect one profile

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else if (profileData) {
          setUserFullName(profileData.full_name); // <-- you need a new state variable
        }

        // Fetch search history
        const { data: searchData, error: searchError } = await supabase
          .from("searches")
          .select("*")
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false })
          .limit(5)

        if (searchData) {
          setSearches(searchData)
        }

        if (searchError) {
          console.error("Error fetching search history:", searchError)
        }

        // Fetch saved companies
        const { data: savedData, error: savedError } = await supabase
          .from("saved_companies")
          .select("*")
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false })

        if (savedData) {
          setSavedCompanies(savedData)
        }

        if (savedError) {
          console.error("Error fetching saved companies:", savedError)
        }
      }
      // Set loading to false even if there's no user
      setLoading(false)
    } catch (error) {
      console.error("Error fetching user data:", error)
      setLoading(false)
    }
  }

  // Handle logo loading error by providing a fallback
  const handleLogoError = (companyName: string) => {
    return (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const target = event.target as HTMLImageElement;
      target.onerror = null; // Prevent infinite callback loop
      
      // Set a fallback logo - first letter of company name in a colored circle
      const logos = { ...companyLogos };
      const firstLetter = companyName.charAt(0).toUpperCase();
      
      // Remove from logos object to trigger fallback display
      logos[companyName] = "error";
      setCompanyLogos(logos);
    }
  }

  // Function to render company logo or fallback
  const renderCompanyLogo = (companyName: string) => {
    const logoUrl = companyLogos[companyName];
    
    if (logoUrl === "error") {
      // Render fallback with first letter of company
      const firstLetter = companyName.charAt(0).toUpperCase();
      return (
        <div 
          className="w-8 h-8 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-semibold"
        >
          {firstLetter}
        </div>
      );
    }
    
    // Render actual logo
    return (
      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
        <img 
          src={logoUrl}
          alt={`${companyName} logo`}
          className="w-6 h-6 object-contain"
          onError={handleLogoError(companyName)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <FaSpinner className="animate-spin text-3xl mb-4" />
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <div className="w-1 h-1 bg-primary rounded-full animate-ping"></div>
            </div>
          </div>
          <p className="text-xl">Loading your dashboard...</p>
          <p className="text-muted-foreground mt-2">Gathering your financial insights ✨</p>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-20 h-20 bg-card-bg rounded-full flex items-center justify-center mb-6 pulse">
            <FaUser className="text-3xl text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-4 gradient-text">Please sign in</h1>
          <p className="mb-6 text-center max-w-md text-muted-foreground">
            You need to be signed in to view your personalized dashboard and track your financial research.
          </p>
          <button
            onClick={() => window.location.href = "/login"}
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white hover:from-primary-hover hover:to-secondary rounded-full transition-colors hover-lift"
          >
            Sign In to Continue
          </button>
        </div>
      </Layout>
    )
  }
  

  return (
    <Layout>
      {showConfetti && (
        <div className="confetti-container">
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
          />
        </div>
      )}
      
      <div className="max-w-7xl mx-auto py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-5xl font-bold gradient-text slide-in-left">
            Welcome, {userFullName || "Guest"} 👋
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchMarketData}
              className="flex items-center gap-1 p-2 bg-card-bg hover:bg-card-hover rounded-lg transition-colors border border-border hover-lift"
              title="Refresh market data"
            >
              <FaSyncAlt className={refreshAnimation ? "animate-spin" : ""} />
            </button>
            <div className="bg-card-bg p-2 rounded-lg border border-border slide-in-right">
              <div className="text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        {(achievements.searches || achievements.saved || achievements.streak) && (
          <div className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border border-primary/20 slide-up">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaTrophy className="text-yellow-500" />
              <span>Recent Achievements</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.searches && (
                <div className="bg-card-bg p-3 rounded-lg border border-border flex items-center gap-3 hover-lift">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                    <FaSearch />
                  </div>
                  <div>
                    <h3 className="font-medium">Research Explorer</h3>
                    <p className="text-sm text-muted-foreground">Completed 5 company searches 🔍</p>
                  </div>
                </div>
              )}
              {achievements.saved && (
                <div className="bg-card-bg p-3 rounded-lg border border-border flex items-center gap-3 hover-lift">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                    <FaStar />
                  </div>
                  <div>
                    <h3 className="font-medium">Portfolio Builder</h3>
                    <p className="text-sm text-muted-foreground">Saved 3 companies to your list ⭐</p>
                  </div>
                </div>
              )}
              {achievements.streak && (
                <div className="bg-card-bg p-3 rounded-lg border border-border flex items-center gap-3 hover-lift">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                    <FaRocket />
                  </div>
                  <div>
                    <h3 className="font-medium">Consistent Analyst</h3>
                    <p className="text-sm text-muted-foreground">3-day research streak 🔥</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Activity Summary */}
          <div className="bg-card-bg p-6 rounded-lg shadow-lg border border-border hover-lift slide-up">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <FaChartLine />
              </div>
              <span>Activity Summary</span>
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔍</span>
                  <span>Total Searches</span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold text-xl">{searches.length}</span>
                  {searches.length > 0 && <span className="ml-2 text-success">+1</span>}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <span>Saved Companies</span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold text-xl">{savedCompanies.length}</span>
                  {savedCompanies.length > 0 && <span className="ml-2 text-success">+1</span>}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  <span>Last Activity</span>
                </div>
                <span>{searches.length > 0 ? new Date(searches[0].created_at).toLocaleDateString() : "N/A"}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-border">
                <Link href="/" className="text-primary hover:text-primary-hover flex items-center gap-1 text-sm">
                  <span>Start new research</span>
                  <FaExternalLinkAlt className="text-xs" />
                </Link>
              </div>
            </div>
          </div>

          {/* Market Trends - Now with real-time data */}
          <div className="bg-card-bg p-6 rounded-lg shadow-lg border border-border hover-lift slide-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <FaChartBar />
              </div>
              <span>Market Trends</span>
            </h2>
            <div className="space-y-3">
              {marketData.slice(0, 4).map((stock, index) => (
                <div key={stock.symbol} className="flex justify-between items-center p-2 hover:bg-card-hover rounded-lg transition-colors">
                  <span>{stock.name}</span>
                  <div className={`flex items-center gap-1 ${stock.changePercent >= 0 ? 'text-success' : 'text-error'}`}>
                    {stock.changePercent >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                    <span>{Math.abs(stock.changePercent).toFixed(2)}%</span>
                    <span className="ml-1">{stock.emoji}</span>
                  </div>
                </div>
              ))}
              <div className="mt-4">
                <Link href="/market" className="text-primary hover:text-primary-hover flex items-center gap-1">
                  <span>View full market data</span>
                  <FaExternalLinkAlt className="text-xs" />
                </Link>
              </div>
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="bg-card-bg p-6 rounded-lg shadow-lg border border-border hover-lift slide-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-400/10 flex items-center justify-center text-blue-400">
                <FaHistory />
              </div>
              <span>Market Performance</span>
            </h2>
            {chartData && <CompanyChart title="" data={chartData} defaultType="bar" />}
          </div>
        </div>

        {/* Stock Carousel - Top Performing Stocks */}
        <div className="mb-8">
          <StockCarousel
            title="Top Performing Stocks"
            description="Stocks with the highest positive change today"
            filter={(stock) => (stock.changePercent || 0) > 0}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Searches */}
          <div className="bg-card-bg p-6 rounded-lg shadow-lg border border-border hover-lift slide-in-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <FaHistory />
                </div>
                <h2 className="text-xl font-semibold">Recent Searches</h2>
              </div>
              <Link href="/" className="text-sm text-primary hover:text-primary-hover px-3 py-1 rounded-full border border-primary/30 hover:bg-primary/10 transition-colors">
                New Search
              </Link>
            </div>

            {searches.length > 0 ? (
              <ul className="space-y-3">
                {searches.map((search, index) => (
                  <li 
                    key={search.id} 
                    className="bg-card-hover p-3 rounded-lg hover:bg-opacity-80 transition-colors hover-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Link
                      href={`/research?company=${encodeURIComponent(search.company_name)}`}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        {companyLogos[search.company_name] ? 
                          renderCompanyLogo(search.company_name) :
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                            <span className="text-lg">🔍</span>
                          </div>
                        }
                        <span>{search.company_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {new Date(search.created_at).toLocaleDateString()}
                        </span>
                        <FaExternalLinkAlt className="text-xs text-muted-foreground" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bg-card-hover p-6 rounded-lg text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl">🔍</span>
                </div>
                <p className="text-muted-foreground mb-4">You haven't searched for any companies yet.</p>
                <Link
                  href="/"
                  className="inline-block px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white hover:from-primary-hover hover:to-secondary rounded-full transition-colors hover-lift"
                >
                  Start searching
                </Link>
              </div>
            )}
          </div>

          {/* Saved Companies */}
          <div className="bg-card-bg p-6 rounded-lg shadow-lg border border-border hover-lift slide-in-right">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <FaStar />
                </div>
                <h2 className="text-xl font-semibold">Saved Companies</h2>
              </div>
              <Link href="/saved" className="text-sm text-primary hover:text-primary-hover px-3 py-1 rounded-full border border-primary/30 hover:bg-primary/10 transition-colors">
                View all
              </Link>
            </div>

            {savedCompanies.length > 0 ? (
              <ul className="space-y-3">
                {savedCompanies.slice(0, 5).map((company, index) => (
                  <li 
                    key={company.id} 
                    className="bg-card-hover p-3 rounded-lg hover:bg-opacity-80 transition-colors hover-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Link
                      href={`/research?company=${encodeURIComponent(company.company_name)}`}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                      {companyLogos[company.company_name] ? 
                          renderCompanyLogo(company.company_name) :
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                            <span className="text-lg">⭐</span>
                          </div>
                        }
                        <span>{company.company_name}</span>
                      </div>
                      <div className="flex items-center">
                        <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                          <FaEllipsisH />
                        </button>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bg-card-hover p-6 rounded-lg text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
                  <span className="text-3xl">⭐</span>
                </div>
                <p className="text-muted-foreground mb-4">You haven't saved any companies yet.</p>
                <Link
                  href="/"
                  className="inline-block px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white hover:from-primary-hover hover:to-secondary rounded-full transition-colors hover-lift"
                >
                  Start searching
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity - Now with real market movements */}
        <div className="mt-8 bg-card-bg p-6 rounded-lg shadow-lg border border-border hover-lift slide-up">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-400/10 flex items-center justify-center text-blue-400">
              <FaBell />
            </div>
            <span>Market Activity</span>
          </h2>
          <div className="space-y-4">
            {activityData.map((activity, index) => (
              <div 
                key={index} 
                className="flex items-start gap-4 p-3 bg-card-hover rounded-lg hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`p-2 rounded-full ${activity.type === "search" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}
                >
                  <span className="text-lg">{activity.emoji}</span>
                </div>
                <div className="flex-1">
                  <p>
                    You {activity.type === "search" ? "searched for" : "saved"}{" "}
                    <span className="font-medium">{activity.company}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
                <Link
                  href={`/research?company=${encodeURIComponent(activity.company)}`}
                  className="text-primary hover:text-primary-hover"
                >
                  <FaExternalLinkAlt />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}