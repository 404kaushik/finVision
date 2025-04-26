"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { FaSearch, FaTimes, FaHistory, FaStar } from "react-icons/fa"

type SearchBarProps = {
  onSearch: (companyName: string) => void
  isLoading?: boolean
}

const popularCompanies = [
  { name: "Apple", emoji: "🍎" },
  { name: "Microsoft", emoji: "🪟" },
  { name: "Google", emoji: "🔍" },
  { name: "Amazon", emoji: "📦" },
  { name: "Tesla", emoji: "🚗" },
  { name: "Meta", emoji: "👓" },
  { name: "Netflix", emoji: "🎬" },
  { name: "Nvidia", emoji: "🎮" },
  { name: "JPMorgan Chase", emoji: "🏦" },
  { name: "Bank of America", emoji: "💰" },
  { name: "Walmart", emoji: "🛒" },
  { name: "Disney", emoji: "🏰" },
  { name: "Coca-Cola", emoji: "🥤" },
  { name: "Pepsi", emoji: "🥫" },
]

const recentSearches = [
  { name: "Apple", emoji: "🍎" },
  { name: "Tesla", emoji: "🚗" },
  { name: "Amazon", emoji: "📦" },
]

const SearchBar = ({ onSearch, isLoading = false }: SearchBarProps) => {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [showRecent, setShowRecent] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Filter suggestions based on query
    if (query.trim()) {
      const filtered = popularCompanies.filter((company) => company.name.toLowerCase().includes(query.toLowerCase()))
      setSuggestions(filtered)
      setShowRecent(false)
    } else {
      setSuggestions([])
      setShowRecent(true)
    }
    setActiveSuggestion(-1)
  }, [query])

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !isLoading) {
      onSearch(query.trim())
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    onSearch(suggestion)
    setShowSuggestions(false)
  }

  const clearSearch = () => {
    setQuery("")
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard navigation in suggestions
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveSuggestion((prev) =>
        prev < (showRecent ? recentSearches.length - 1 : suggestions.length - 1) ? prev + 1 : prev,
      )
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === "Enter" && activeSuggestion >= 0) {
      e.preventDefault()
      const selected = showRecent ? recentSearches[activeSuggestion].name : suggestions[activeSuggestion].name
      handleSuggestionClick(selected)
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  return (
    <div className="w-full px-4 sm:px-2">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto mt-6 relative">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search for a company (e.g., Apple, Tesla)"
            className="w-full py-3 px-4 pl-12 rounded-full bg-card-bg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all text-foreground"
            disabled={isLoading}
          />
          <div className="absolute left-4 text-muted-foreground">
            <FaSearch className={`text-lg ${isLoading ? "animate-pulse text-primary" : ""}`} />
          </div>
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-20 sm:right-24 text-muted-foreground hover:text-foreground transition-colors"
            >
              <FaTimes />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className={`absolute right-2 bg-gradient-to-r from-primary to-secondary text-white px-3 sm:px-4 py-2 rounded-full font-medium text-sm sm:text-base ${
              isLoading || !query.trim()
                ? "opacity-50 cursor-not-allowed"
                : "hover:shadow-md hover:opacity-90 hover:scale-105 transition-all duration-200"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-1 sm:mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="hidden sm:inline">Searching...</span>
              </span>
            ) : (
              <span className="flex items-center">
                <span className="hidden sm:inline">Search</span>
                <FaSearch className="sm:hidden" />
              </span>
            )}
          </button>
        </div>

        {showSuggestions && (suggestions.length > 0 || showRecent) && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 mt-2 w-full bg-card-bg border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto scale-in origin-top transition-all duration-200"
          >
            {showRecent && recentSearches.length > 0 && (
              <div className="p-2">
                <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground">
                  <FaHistory className="text-primary" />
                  <span className="font-medium">Recent Searches</span>
                </div>
                {recentSearches.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(item.name)}
                    className={`px-4 py-2 hover:bg-card-hover cursor-pointer transition-colors rounded-md flex items-center justify-between ${
                      activeSuggestion === index ? "bg-card-hover" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.emoji}</span>
                      <span>{item.name}</span>
                    </div>
                    <FaSearch className="text-muted-foreground text-sm" />
                  </div>
                ))}
                {suggestions.length > 0 && <div className="border-t border-border my-2"></div>}
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="p-2">
                {!showRecent && (
                  <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground">
                    <FaStar className="text-yellow-400" />
                    <span className="font-medium">Popular Companies</span>
                  </div>
                )}
                {suggestions.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(item.name)}
                    className={`px-4 py-2 hover:bg-card-hover cursor-pointer transition-colors rounded-md flex items-center justify-between ${
                      activeSuggestion === (showRecent ? index + recentSearches.length : index) ? "bg-card-hover" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.emoji}</span>
                      <span>{item.name}</span>
                    </div>
                    <FaSearch className="text-muted-foreground text-sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  )
}

export default SearchBar