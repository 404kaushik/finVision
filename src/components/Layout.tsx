"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import {
  FaChartLine,
  FaBell,
  FaSearch,
  FaHome,
  FaSave,
  FaChartBar,
  FaUserCircle,
  FaGraduationCap,
} from "react-icons/fa"
import ThemeToggle from "./ThemeToggle"
import LoginButton from "./LoginLogoutButton"
import { useState, useEffect } from "react"

type LayoutProps = {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [scrolled, setScrolled] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
          scrolled ? "bg-background/90 shadow-lg border-border" : "bg-background/50 border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <FaChartLine className="text-primary text-2xl group-hover:opacity-0 transition-opacity duration-300" />
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-2xl">✨</span>
              </span>
            </div>
            <span className="text-xl font-bold gradient-text group-hover:scale-105 transition-transform duration-300">
              FinInsight
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="hover:text-primary transition-colors flex items-center gap-2 hover-lift px-3 py-1 rounded-full"
            >
              <FaHome />
              <span>Home</span>
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-primary transition-colors flex items-center gap-2 hover-lift px-3 py-1 rounded-full"
            >
              <FaChartBar />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/saved"
              className="hover:text-primary transition-colors flex items-center gap-2 hover-lift px-3 py-1 rounded-full"
            >
              <FaSave />
              <span>Saved</span>
            </Link>
            <Link
              href="/market"
              className="hover:text-primary transition-colors flex items-center gap-2 hover-lift px-3 py-1 rounded-full"
            >
              <FaChartLine />
              <span>Market</span>
            </Link>
            <Link
              href="/learn"
              className="hover:text-primary transition-colors flex items-center gap-2 hover-lift px-3 py-1 rounded-full"
            >
              <FaGraduationCap />
              <span>Learn</span>
            </Link>
            
            <LoginButton />
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <button className="p-2 rounded-full hover:bg-card-hover transition-colors relative">
              <FaBell />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <Link
              href="/profile"
              className="p-2 rounded-full bg-card-bg hover:bg-card-hover transition-colors hover-lift"
            >
              <FaUserCircle className="text-xl" />
            </Link>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-full hover:bg-card-hover transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-card-bg border-b border-border slide-down">
            <div className="container mx-auto py-3 px-4 flex flex-col space-y-3">
              <Link
                href="/"
                className="flex items-center gap-2 p-2 hover:bg-card-hover rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <FaHome />
                <span>Home</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 p-2 hover:bg-card-hover rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <FaChartBar />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/saved"
                className="flex items-center gap-2 p-2 hover:bg-card-hover rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <FaSave />
                <span>Saved</span>
              </Link>
              <Link
                href="/market"
                className="flex items-center gap-2 p-2 hover:bg-card-hover rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <FaChartLine />
                <span>Market</span>
              </Link>
              <Link
                href="/search"
                className="flex items-center gap-2 p-2 hover:bg-card-hover rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <FaSearch />
                <span>Search</span>
              </Link>
              <Link
                href="/learn"
                className="flex items-center gap-2 p-2 hover:bg-card-hover rounded-lg transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <FaGraduationCap />
                <span>Learn</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="bg-background/90 py-6 mt-auto border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="slide-in-left">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaChartLine className="text-primary" />
                <span className="gradient-text">FinInsight</span>
              </h3>
              <p className="text-muted-foreground">Advanced financial research powered by AI ✨</p>
            </div>
            <div className="slide-in-left" style={{ animationDelay: "0.1s" }}>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <span>🏠</span>
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <span>📊</span>
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/saved"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <span>⭐</span>
                    <span>Saved Research</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div className="slide-in-left" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <span>📜</span>
                    <span>Terms of Service</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <span>🔒</span>
                    <span>Privacy Policy</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-border text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} FinInsight. Created with ❤️ for hackathon purposes.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout