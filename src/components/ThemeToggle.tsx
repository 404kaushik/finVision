"use client"

import { useTheme } from "@/context/ThemeContext"
import { FaMoon, FaSun } from "react-icons/fa"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-blue-700" />}
    </button>
  )
}
