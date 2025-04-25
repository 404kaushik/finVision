"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/Layout"
import { useAuth } from "@/context/AuthContext"
import { FaUser, FaCog, FaSignOutAlt, FaSpinner, FaChartLine, FaStar } from "react-icons/fa"
import { supabase } from "@/lib/supabase"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    searches: 0,
    saved: 0,
  })

  useEffect(() => {
    if (user) {
      fetchUserStats()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchUserStats = async () => {
    setLoading(true)
    try {
      // Get search count
      const { count: searchCount } = await supabase
        .from("searches")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      // Get saved companies count
      const { count: savedCount } = await supabase
        .from("saved_companies")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      setStats({
        searches: searchCount || 0,
        saved: savedCount || 0,
      })
    } catch (error) {
      console.error("Error fetching user stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

          {loading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="animate-spin text-3xl" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {/* User Info */}
              <div className="md:col-span-1">
                <div className="bg-card-bg p-6 rounded-lg shadow-lg border border-border">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-card-hover flex items-center justify-center text-4xl mb-4">
                      <FaUser />
                    </div>
                    <h2 className="text-xl font-semibold">{user?.email?.split("@")[0] || "User"}</h2>
                    <p className="text-muted-foreground mb-4">{user?.email}</p>
                    <div className="flex space-x-2 mt-2">
                      <button className="px-4 py-2 bg-card-hover hover:bg-opacity-80 rounded-lg transition-colors flex items-center gap-2">
                        <FaCog />
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={() => signOut()}
                        className="px-4 py-2 bg-error/10 text-error hover:bg-error/20 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <FaSignOutAlt />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats and Activity */}
              <div className="md:col-span-2">
                <div className="bg-card-bg p-6 rounded-lg shadow-lg border border-border mb-6">
                  <h3 className="text-xl font-semibold mb-4">Account Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-card-hover rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FaChartLine className="text-primary" />
                        <h4 className="font-medium">Total Searches</h4>
                      </div>
                      <p className="text-3xl font-bold">{stats.searches}</p>
                    </div>
                    <div className="p-4 bg-card-hover rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FaStar className="text-secondary" />
                        <h4 className="font-medium">Saved Companies</h4>
                      </div>
                      <p className="text-3xl font-bold">{stats.saved}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card-bg p-6 rounded-lg shadow-lg border border-border">
                  <h3 className="text-xl font-semibold mb-4">Subscription</h3>
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                    <h4 className="font-medium text-lg mb-2">Free Plan</h4>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-success"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>10 searches per day</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-success"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Basic financial analysis</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-success"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Save up to 5 companies</span>
                      </li>
                    </ul>
                    <button className="w-full py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:from-primary-hover hover:to-secondary transition-colors">
                      Upgrade to Pro
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
