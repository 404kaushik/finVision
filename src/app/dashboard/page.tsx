"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/Layout"
import { supabase } from "@/lib/supabase"
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
} from "react-icons/fa"
import CompanyChart from "@/components/CompanyChart"
import Confetti from "react-confetti"

interface Achievement {
  searches: boolean;
  saved: boolean;
  streak: boolean;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [searches, setSearches] = useState<any[]>([])
  const [savedCompanies, setSavedCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any>(null)
  const [activityData, setActivityData] = useState<any[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  
  const [achievements, setAchievements] = useState<Achievement>({
    searches: false, 
    saved: false, 
    streak: false
  })

  useEffect(() => {
    generateMockChartData()
    generateMockActivityData()
    fetchUserData()
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

  const generateMockChartData = () => {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const data = {
      labels,
      datasets: [
        {
          label: "Searches",
          data: [3, 5, 2, 8, 4, 6, 2],
          borderColor: "rgba(59, 130, 246, 1)",
          backgroundColor: "rgba(59, 130, 246, 0.5)",
        },
      ],
    }
    setChartData(data)
  }

  const generateMockActivityData = () => {
    const activities = [
      { type: "search", company: "Apple", time: "2 hours ago", emoji: "🔍" },
      { type: "save", company: "Microsoft", time: "1 day ago", emoji: "⭐" },
      { type: "search", company: "Tesla", time: "2 days ago", emoji: "🔍" },
      { type: "save", company: "Google", time: "3 days ago", emoji: "⭐" },
      { type: "search", company: "Amazon", time: "4 days ago", emoji: "🔍" },
    ]
    setActivityData(activities)
  }

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()

      if (userData?.user) {
        setUser(userData.user)

        // Fetch search history
        const { data: searchData } = await supabase
          .from("searches")
          .select("*")
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false })
          .limit(5)

        if (searchData) {
          setSearches(searchData)
        }

        // Fetch saved companies
        const { data: savedData } = await supabase
          .from("saved_companies")
          .select("*")
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false })

        if (savedData) {
          setSavedCompanies(savedData)
        }
      }
      
      // Set loading to false even if there's no user
      setLoading(false)
    } catch (error) {
      console.error("Error fetching user data:", error)
      setLoading(false)
    }
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

  /* Comment out the authentication check to allow viewing the dashboard without being logged in
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
            onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white hover:from-primary-hover hover:to-secondary rounded-full transition-colors hover-lift"
          >
            Sign In to Continue
          </button>
        </div>
      </Layout>
    )
  }
  */

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
      
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold gradient-text slide-in-left">
            Welcome Back, {user?.email?.split("@")[0] || "Guest"} 👋
          </h1>
          <div className="bg-card-bg p-2 rounded-lg border border-border slide-in-right">
            <div className="text-sm text-muted-foreground">
              Last login: {new Date().toLocaleDateString()}
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

          {/* Market Trends */}
          <div className="bg-card-bg p-6 rounded-lg shadow-lg border border-border hover-lift slide-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <FaChartBar />
              </div>
              <span>Market Trends</span>
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 hover:bg-card-hover rounded-lg transition-colors">
                <span>S&P 500</span>
                <div className="flex items-center gap-1 text-success">
                  <FaArrowUp />
                  <span>0.38%</span>
                  <span className="ml-1">🚀</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-card-hover rounded-lg transition-colors">
                <span>Nasdaq</span>
                <div className="flex items-center gap-1 text-success">
                  <FaArrowUp />
                  <span>0.54%</span>
                  <span className="ml-1">🔥</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-card-hover rounded-lg transition-colors">
                <span>Dow Jones</span>
                <div className="flex items-center gap-1 text-error">
                  <FaArrowDown />
                  <span>0.11%</span>
                  <span className="ml-1">📉</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-card-hover rounded-lg transition-colors">
                <span>Bitcoin</span>
                <div className="flex items-center gap-1 text-success">
                  <FaArrowUp />
                  <span>1.24%</span>
                  <span className="ml-1">💰</span>
                </div>
              </div>
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
              <span>Weekly Activity</span>
            </h2>
            {chartData && <CompanyChart title="" data={chartData} defaultType="bar" />}
          </div>
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                          <span className="text-lg">🔍</span>
                        </div>
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                          <span className="text-lg">⭐</span>
                        </div>
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

        {/* Recent Activity */}
        <div className="mt-8 bg-card-bg p-6 rounded-lg shadow-lg border border-border hover-lift slide-up">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-400/10 flex items-center justify-center text-blue-400">
              <FaBell />
            </div>
            <span>Recent Activity</span>
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