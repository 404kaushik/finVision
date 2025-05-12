"use client"

import type React from "react"

import { useState } from "react"
import Layout from "@/components/Layout"
import BeginnerResearch from "@/components/BeginnerResearch"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { FaSearch, FaLightbulb, FaChartLine, FaGraduationCap, FaArrowRight } from "react-icons/fa"
import { RiMentalHealthLine } from "react-icons/ri"

export default function BeginnerGuidePage() {
  const [companyName, setCompanyName] = useState("")
  const [searchedCompany, setSearchedCompany] = useState("")
  const [showExamples, setShowExamples] = useState(true)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (companyName.trim()) {
      setSearchedCompany(companyName)
      setShowExamples(false)
    }
  }

  const handleExampleClick = (company: string) => {
    setCompanyName(company)
    setSearchedCompany(company)
    setShowExamples(false)
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Investment Guide for Beginners</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get simple, jargon-free explanations about companies and whether they might be good investments for someone
            new to the stock market.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
            <Input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter a company name (e.g., Apple, Tesla, Amazon)"
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!companyName.trim()}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary"
            >
              <FaSearch className="mr-2" />
              Research
            </Button>
          </form>
        </motion.div>

        {searchedCompany ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <BeginnerResearch
              companyName={searchedCompany}
              onClose={() => {
                setSearchedCompany("")
                setShowExamples(true)
              }}
            />
          </motion.div>
        ) : showExamples ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FaLightbulb className="text-primary" />
                <span>Popular Companies to Explore</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Apple", "Tesla", "Amazon", "Microsoft", "Google", "Netflix", "Meta", "Nvidia"].map((company) => (
                  <Card
                    key={company}
                    className="hover:shadow-md transition-shadow cursor-pointer hover-lift"
                    onClick={() => handleExampleClick(company)}
                  >
                    <CardContent className="p-4 flex items-center justify-center h-24">
                      <span className="text-lg font-medium">{company}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-card-bg p-6 rounded-lg border border-border hover-lift">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <FaGraduationCap className="text-xl" />
                </div>
                <h3 className="text-xl font-bold mb-2">Beginner-Friendly</h3>
                <p className="text-muted-foreground mb-4">
                  Get explanations that make sense even if you've never invested before. No confusing jargon or complex
                  terms.
                </p>
              </div>

              <div className="bg-card-bg p-6 rounded-lg border border-border hover-lift">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-4">
                  <FaChartLine className="text-xl" />
                </div>
                <h3 className="text-xl font-bold mb-2">Clear Insights</h3>
                <p className="text-muted-foreground mb-4">
                  Understand a company's financial health, growth potential, and risks in simple, straightforward terms.
                </p>
              </div>

              <div className="bg-card-bg p-6 rounded-lg border border-border hover-lift">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                  <RiMentalHealthLine className="text-xl" />
                </div>
                <h3 className="text-xl font-bold mb-2">Pros & Cons</h3>
                <p className="text-muted-foreground mb-4">
                  Get a balanced view with clear reasons to consider investing and potential risks to be aware of.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-xl border border-primary/20 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Your Investment Journey?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our beginner-friendly research tool helps you understand companies and make more informed investment
                decisions, even if you're completely new to investing.
              </p>
              <Button
                onClick={() => setCompanyName("Apple")}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary text-white px-6 py-6 rounded-full hover-lift flex items-center gap-2 h-auto"
              >
                <span>Try with Apple</span>
                <FaArrowRight />
              </Button>
            </div>
          </motion.div>
        ) : null}
      </div>
    </Layout>
  )
}
