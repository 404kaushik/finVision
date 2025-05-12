"use client"

import type React from "react"
import { ThemeProvider } from "@/context/ThemeContext"
import ThemeToggle from "@/components/ThemeToggle"
import LoginButton from "./LoginLogoutButton"
import { StockTickerHeader } from "@/components/StockTickerHeader"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  HomeIcon,
  BarChart2Icon,
  SearchIcon,
  BookOpenIcon,
  SaveIcon,
  UserIcon,
  TrendingUpIcon,
  CoinsIcon,
  CircleDollarSign,
  Book,
} from "lucide-react"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname()

  const navItems = [
    { name: "Home", href: "/", icon: <HomeIcon className="h-5 w-5" /> },
    { name: "Dashboard", href: "/dashboard", icon: <BarChart2Icon className="h-5 w-5" /> },
    { name: "Research", href: "/research", icon: <Book className="h-5 w-5" /> },
    { name: "Market", href: "/market", icon: <CircleDollarSign className="market-section h-5 w-5" /> },
    { name: "Learn", href: "/learn", icon: <BookOpenIcon className="h-5 w-5" /> },
    { name: "Saved", href: "/saved", icon: <SaveIcon className="h-5 w-5" /> },
    { name: "Crypto", href: "/crypto", icon: <CoinsIcon className="crypto-section h-5 w-5" /> },
    { name: "Profile", href: "/profile", icon: <UserIcon className="h-5 w-5" /> },
  ]

  return (
    <ThemeProvider>
        <div className="min-h-screen flex flex-col">    
          <div className="flex flex-1">
            {/* Sidebar Navigation */}
            <aside className="hidden md:flex flex-col w-16 lg:w-64 border-r shrink-0 h-screen fixed z-30">
              <div className="p-4 h-16 flex items-center justify-center lg:justify-start border-b bg-background">
                <Link href="/" className="flex items-center gap-2">
                  <TrendingUpIcon className="h-6 w-6 text-primary" />
                  <span className="font-bold text-xl hidden lg:inline-block">FinVision</span>
                </Link>
              </div>
              <nav className="flex-1 py-6 px-2 overflow-y-auto">
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                          pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {item.icon}
                        <span className="hidden lg:inline-block">{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="p-4 border-t flex justify-center lg:justify-between">
                <LoginButton />
                <ThemeToggle />
              </div>
            </aside>

            {/* Mobile Navigation */}
            <div className="fixed bottom-0 left-0 right-0 z-10 bg-background border-t md:hidden">
              <nav className="flex justify-around py-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center p-2 rounded-md text-xs",
                      pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.icon}
                    <span className="mt-1">{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Stock Ticker Header */}
            <div className="fixed top-0 right-0 left-0 md:left-16 lg:left-64 z-20 bg-background">
              <StockTickerHeader />
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto pb-16 md:pb-0 lg:ml-64 lg:p-8">{children}</main>
          </div>
        </div>

    </ThemeProvider>
  )
}