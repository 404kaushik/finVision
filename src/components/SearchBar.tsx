"use client"

import type React from "react"
import { useState, useRef } from "react"
import { SearchIcon, XIcon, ClockIcon, StarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { motion } from "framer-motion"

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
  { name: "Samsung", emoji: "📱" },
  { name: "IBM", emoji: "🖥️" },
  { name: "Intel", emoji: "🔧" },
  { name: "Oracle", emoji: "🌀" },
  { name: "Adobe", emoji: "🎨" },
  { name: "PayPal", emoji: "💳" },
  { name: "Visa", emoji: "💳" },
  { name: "Mastercard", emoji: "💳" },
  { name: "Disney", emoji: "🏰" },
  { name: "Coca-Cola", emoji: "🥤" },
  { name: "Starbucks", emoji: "☕" },
  { name: "McDonald's", emoji: "🍔" },
  { name: "Nike", emoji: "👟" },
  { name: "Adidas", emoji: "🥾" },
  { name: "Walmart", emoji: "🏪" },
  { name: "Uber", emoji: "🚕" },
  { name: "Airbnb", emoji: "🏠" },
  { name: "Zoom", emoji: "🎥" },
  { name: "Salesforce", emoji: "☁️" },
  { name: "Shopify", emoji: "🛒" },
  { name: "Spotify", emoji: "🎵" },
  { name: "Twitter", emoji: "🐦" },
  { name: "LinkedIn", emoji: "💼" },
  { name: "Snapchat", emoji: "👻" },
  { name: "Pinterest", emoji: "📌" },
  { name: "Toyota", emoji: "🚗" },
  { name: "Volkswagen", emoji: "🚗" },
  { name: "BMW", emoji: "🚗" },
  { name: "Mercedes-Benz", emoji: "🚗" },
  { name: "Shell", emoji: "⛽" },
  { name: "ExxonMobil", emoji: "⛽" },
  { name: "Chevron", emoji: "⛽" },
  { name: "Berkshire Hathaway", emoji: "🏦" },
  { name: "Bank of America", emoji: "🏦" },
  { name: "HSBC", emoji: "🏦" },
  { name: "American Express", emoji: "💳" },
  { name: "Cisco", emoji: "🛡️" },
  { name: "SAP", emoji: "📊" },
  { name: "Siemens", emoji: "⚙️" },
  { name: "Lyft", emoji: "🚘" },
  { name: "Alibaba", emoji: "🛍️" },
  { name: "Tencent", emoji: "🌐" },
  { name: "Boeing", emoji: "✈️" },
  { name: "Pfizer", emoji: "💉" },
  { name: "SpaceX", emoji: "🚀" },
];

const recentSearches = [
  { name: "Apple", emoji: "🍎" },
  { name: "Tesla", emoji: "🚗" },
  { name: "Amazon", emoji: "📦" },
]

const SearchBar = ({ onSearch, isLoading = false }: SearchBarProps) => {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !isLoading) {
      onSearch(query.trim())
      setOpen(false)
    }
  }

  const handleSelect = (company: string) => {
    setQuery(company)
    onSearch(company)
    setOpen(false)
  }

  return (
    <div className="search-bar w-full max-w-xl mx-auto">
      <Popover open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSubmit} className="relative">
          <PopoverTrigger asChild>
            <div className="relative group">
              <motion.div
                className="absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary/20 to-primary/10 blur-sm transition-opacity duration-500"
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
              <div className="relative flex items-center">
                <Input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for a company (e.g., Apple, Tesla)"
                  className="w-full py-6 pl-12 pr-4 rounded-xl border-border bg-background shadow-sm focus-visible:ring-1 focus-visible:ring-primary"
                  disabled={isLoading}
                />
                <div className="absolute left-4 text-muted-foreground">
                  <SearchIcon className={`h-5 w-5 ${isLoading ? "text-primary animate-pulse" : ""}`} />
                </div>
                {query && (
                  <Button
                    type="button"
                    onClick={() => setQuery("")}
                    size="icon"
                    variant={"ghost"}
                    className="absolute right-14 cursor-pointer"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  variant="default"
                  className="absolute right-2 rounded-lg hover:cursor-pointer"
                  size="sm"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <SearchIcon className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[calc(100vw-2rem)] max-w-xl" align="start">
            <Command>
              <CommandInput placeholder="Search for a company..." value={query} onValueChange={setQuery} />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {recentSearches.length > 0 && (
                  <CommandGroup heading="Recent Searches">
                    {recentSearches.map((item, index) => (
                      <CommandItem key={`recent-${index}`} value={item.name} onSelect={() => handleSelect(item.name)}>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-lg mr-2">{item.emoji}</span>
                          <span>{item.name}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                <CommandGroup heading="Popular Companies">
                  {popularCompanies
                    .filter((company) => company.name.toLowerCase().includes(query.toLowerCase()) || query === "")
                    .map((item, index) => (
                      <CommandItem key={`popular-${index}`} value={item.name} onSelect={() => handleSelect(item.name)}>
                        <div className="flex items-center gap-2">
                          <StarIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-lg mr-2">{item.emoji}</span>
                          <span>{item.name}</span>
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </form>
      </Popover>
    </div>
  )
}

export default SearchBar