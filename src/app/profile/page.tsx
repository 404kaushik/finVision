"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/Layout"
import { useAuth } from "@/context/AuthContext"
import { FaUser, FaCog, FaSignOutAlt, FaChartLine, FaStar, FaCrown, FaCcAmazonPay, FaUserShield, FaTrash } from "react-icons/fa"
import { supabase } from "@/utils/supabase/client"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

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
        .from("saved_research")
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

  const handleSignOut = () => {
    signOut()
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin animation-delay-150"></div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="min-h-screen ">
          {/* Animated background elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="text-center mb-12 animate-fade-in-up">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
                Your Profile
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Manage your account, track your progress, and unlock new possibilities
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <Card className="group relative overflow-hidden border-0 shadow-2xl bg-white/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
                  <CardContent className="relative p-8">
                    <div className="text-center">
                      {/* Avatar with animation */}
                      <div className="relative mx-auto mb-6">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1 group-hover:scale-110 transition-transform duration-300">
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-4xl text-gray-600">
                            <FaUser />
                          </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        </div>
                      </div>

                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {user?.email?.split("@")[0] || "User"}
                      </h2>
                      <p className="text-gray-600 mb-6">{user?.email}</p>

                      <div className="flex flex-col gap-3">
                        <Button variant="outline" className="group hover:bg-blue-50 transition-colors duration-300">
                          <FaCog className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
                          Settings
                        </Button>
                        <Button 
                          variant="outline" 
                          className="group hover:bg-red-50 transition-colors duration-300"
                          onClick={() => window.location.href = "/profile/delete-account"}
                        >
                          <FaTrash className="mr-2 group-hover:text-red-500 transition-colors duration-300" />
                          Delete Account
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleSignOut}
                          className="group hover:bg-red-600 transition-colors duration-300"
                        >
                          <FaSignOutAlt className="mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stats and Activity */}
              <div className="lg:col-span-2 space-y-8">
                {/* Statistics Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm font-medium mb-2">Total Searches</p>
                          <p className="text-4xl font-bold">{stats.searches}</p>
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <FaChartLine className="text-2xl" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Progress value={Math.min((stats.searches / 10) * 100, 100)} className="h-2 bg-blue-400" />
                        <p className="text-xs text-blue-100 mt-2">{Math.max(10 - stats.searches, 0)} searches remaining today</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm font-medium mb-2">Saved Companies</p>
                          <p className="text-4xl font-bold">{stats.saved}</p>
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <FaStar className="text-2xl" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Progress value={(stats.saved / 5) * 100} className="h-2 bg-purple-400" />
                        <p className="text-xs text-purple-100 mt-2">{Math.max(5 - stats.saved, 0)} slots remaining</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Subscription Card */}
                <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl font-bold mb-2">Free Plan</CardTitle>
                        <CardDescription className="text-slate-300">
                          Perfect for getting started with company research
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        <FaUserShield className="mr-1" />
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-semibold mb-4 text-lg">Current Features</h4>
                        <ul className="space-y-3">
                          <li className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            </div>
                            <span>10 searches per day</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            </div>
                            <span>Basic financial analysis</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            </div>
                            <span>Save up to 5 companies</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-4 text-lg">Upgrade Benefits</h4>
                        <ul className="space-y-3 mb-6">
                          <li className="flex items-center gap-3 text-slate-300">
                            <FaCcAmazonPay className="text-yellow-400" />
                            <span>Unlimited searches</span>
                          </li>
                          <li className="flex items-center gap-3 text-slate-300">
                            <FaCrown className="text-yellow-400" />
                            <span>Advanced analytics</span>
                          </li>
                          <li className="flex items-center gap-3 text-slate-300">
                            <FaStar className="text-yellow-400" />
                            <span>Unlimited saved companies</span>
                          </li>
                        </ul>
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                          <FaCrown className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
                          Upgrade to Pro
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}