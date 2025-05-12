"use client"

import { useEffect, useState } from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
        <span className="sr-only">Toggle theme</span>
        <div className="h-4 w-4 bg-muted rounded-full" />
      </Button>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full w-9 h-9 relative"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            <span className="sr-only">Toggle theme</span>
            <div className="relative w-4 h-4">
              {theme === "dark" ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <MoonIcon className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <SunIcon className="h-4 w-4" />
                </motion.div>
              )}
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch to {theme === "dark" ? "light" : "dark"} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
