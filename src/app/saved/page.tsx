"use client"

import { useEffect, useState } from "react"
import Layout from "@/components/Layout"
import { supabase } from "@/utils/supabase/client"
import Link from "next/link"
import { FaStar, FaTrash, FaSpinner, FaSearch, FaSortAmountDown, FaExternalLinkAlt, FaEllipsisH } from "react-icons/fa"
import ProtectedRoute from "@/components/ProtectedRoute"
import Confetti from "@/components/Confetti"

type SortOption = "newest" | "oldest" | "name_asc" | "name_desc"

export default function SavedCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState<SortOption>("newest")
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState<string | null>(null)

  useEffect(() => {
    fetchSavedCompanies()
  }, [])

  useEffect(() => {
    // Filter companies based on search term
    const filtered = companies.filter((company) =>
      company.company_name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Sort companies based on sort option
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "name_asc":
          return a.company_name.localeCompare(b.company_name)
        case "name_desc":
          return b.company_name.localeCompare(a.company_name)
        default:
          return 0
      }
    })

    setFilteredCompanies(sorted)
  }, [companies, searchTerm, sortOption])

  const fetchSavedCompanies = async () => {
    setLoading(true)
    try {
      const { data: user } = await supabase.auth.getUser()

      if (user?.user) {
        const { data, error } = await supabase
          .from("saved_companies")
          .select("*")
          .eq("user_id", user.user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        // Add emojis to companies
        const companiesWithEmojis = (data || []).map((company) => {
          // Generate a consistent emoji based on company name
          const firstChar = company.company_name.charAt(0).toLowerCase()
          let emoji = "⭐"

          if (["a", "b", "c"].includes(firstChar)) emoji = "🚀"
          else if (["d", "e", "f"].includes(firstChar)) emoji = "📈"
          else if (["g", "h", "i"].includes(firstChar)) emoji = "💰"
          else if (["j", "k", "l"].includes(firstChar)) emoji = "📊"
          else if (["m", "n", "o"].includes(firstChar)) emoji = "🔍"
          else if (["p", "q", "r"].includes(firstChar)) emoji = "💎"
          else if (["s", "t", "u"].includes(firstChar)) emoji = "🏆"
          else if (["v", "w", "x", "y", "z"].includes(firstChar)) emoji = "🌟"

          return {
            ...company,
            emoji,
          }
        })

        setCompanies(companiesWithEmojis)
        setFilteredCompanies(companiesWithEmojis)
      }
    } catch (error) {
      console.error("Error fetching saved companies:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteCompany = async (id: string) => {
    setDeleting(id)
    try {
      const { error } = await supabase.from("saved_companies").delete().eq("id", id)

      if (error) throw error
      setCompanies(companies.filter((company) => company.id !== id))
    } catch (error) {
      console.error("Error deleting company:", error)
    } finally {
      setDeleting(null)
    }
  }

  const handleSort = (option: SortOption) => {
    setSortOption(option)
    setShowSortMenu(false)
  }

  const handleCompanyClick = (companyName: string) => {
    setSelectedCompany(companyName)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  const toggleDropdown = (id: string) => {
    if (showDropdown === id) {
      setShowDropdown(null)
    } else {
      setShowDropdown(id)
    }
  }

  return (
    <ProtectedRoute>
      <Layout>
        <Confetti active={showConfetti} />

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 slide-in-left">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                <FaStar className="animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold gradient-text">Saved Companies</h1>
            </div>

            <div className="flex items-center gap-2 slide-in-right">
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="p-2 bg-card-bg hover:bg-card-hover rounded-lg transition-colors border border-border flex items-center gap-2 hover-lift"
                >
                  <FaSortAmountDown />
                  <span className="hidden sm:inline">Sort</span>
                </button>

                {showSortMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-card-bg border border-border rounded-lg shadow-lg z-10 scale-in">
                    <button
                      onClick={() => handleSort("newest")}
                      className={`w-full text-left px-4 py-2 hover:bg-card-hover transition-colors ${sortOption === "newest" ? "text-primary" : ""}`}
                    >
                      <span className="mr-2">🕒</span> Newest first
                    </button>
                    <button
                      onClick={() => handleSort("oldest")}
                      className={`w-full text-left px-4 py-2 hover:bg-card-hover transition-colors ${sortOption === "oldest" ? "text-primary" : ""}`}
                    >
                      <span className="mr-2">📅</span> Oldest first
                    </button>
                    <button
                      onClick={() => handleSort("name_asc")}
                      className={`w-full text-left px-4 py-2 hover:bg-card-hover transition-colors ${sortOption === "name_asc" ? "text-primary" : ""}`}
                    >
                      <span className="mr-2">🔤</span> Name (A-Z)
                    </button>
                    <button
                      onClick={() => handleSort("name_desc")}
                      className={`w-full text-left px-4 py-2 hover:bg-card-hover transition-colors ${sortOption === "name_desc" ? "text-primary" : ""}`}
                    >
                      <span className="mr-2">🔡</span> Name (Z-A)
                    </button>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search saved..."
                  className="pl-10 pr-4 py-2 bg-card-bg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center">
                <FaSpinner className="animate-spin text-3xl mb-4" />
                <p className="text-muted-foreground">Loading your saved companies...</p>
              </div>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="bg-card-bg p-8 rounded-lg text-center border border-border slide-up">
              {searchTerm ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-card-hover flex items-center justify-center">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <p className="text-xl mb-4">No companies match your search</p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="inline-block px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-full transition-colors hover-lift"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-card-hover flex items-center justify-center">
                    <span className="text-3xl">⭐</span>
                  </div>
                  <p className="text-xl mb-4">You haven't saved any companies yet</p>
                  <Link
                    href="/"
                    className="inline-block px-6 py-2 bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary text-white rounded-full transition-colors hover-lift"
                  >
                    Start searching
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCompanies.map((company, index) => (
                <div
                  key={company.id}
                  className="bg-card-bg p-4 rounded-lg shadow-lg hover:bg-card-hover transition-colors border border-border flex justify-between items-center hover-lift slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Link
                    href={`/research?company=${encodeURIComponent(company.company_name)}`}
                    className="flex-grow p-2 flex items-center gap-3"
                    onClick={() => handleCompanyClick(company.company_name)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center text-2xl">
                      {company.emoji}
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">{company.company_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Saved on {new Date(company.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/research?company=${encodeURIComponent(company.company_name)}`}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors"
                      aria-label="View company research"
                    >
                      <FaExternalLinkAlt />
                    </Link>

                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(company.id)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="More options"
                      >
                        <FaEllipsisH />
                      </button>

                      {showDropdown === company.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-card-bg border border-border rounded-lg shadow-lg z-10 scale-in">
                          <Link
                            href={`/research?company=${encodeURIComponent(company.company_name)}`}
                            className="w-full text-left px-4 py-2 hover:bg-card-hover transition-colors flex items-center gap-2"
                          >
                            <FaExternalLinkAlt className="text-primary" />
                            <span>View Research</span>
                          </Link>
                          <button
                            onClick={() => deleteCompany(company.id)}
                            disabled={deleting === company.id}
                            className="w-full text-left px-4 py-2 hover:bg-card-hover transition-colors flex items-center gap-2 text-error"
                          >
                            {deleting === company.id ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
