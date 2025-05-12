"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
}

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeContextType = {
  theme: "light",
  setTheme: () => null,
}

const ThemeContext = createContext<ThemeContextType>(initialState)

export function ThemeProvider({ children, defaultTheme = "light" }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null
    if (savedTheme && (savedTheme === "dark" || savedTheme === "light")) {
      setTheme(savedTheme)
    } else {
      // Default to user's system preference
      const systemPreference = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      setTheme(systemPreference)
    }
  }, [])

  useEffect(() => {
    const root = window.document.documentElement

    // Remove all existing theme classes
    root.classList.remove("light", "dark")

    // Apply the current theme
    root.classList.add(theme)

    // Save theme to localStorage
    localStorage.setItem("theme", theme)
  }, [theme])

  const value = {
    theme,
    setTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
