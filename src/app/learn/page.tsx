"use client"

import { useState, useEffect } from "react"
import Layout from "@/components/Layout"
import InvestmentAssistant from "@/components/InvestmentAssistant"
import { motion } from "framer-motion"
import { FaChartLine, FaRobot, FaArrowRight, FaRegLightbulb, FaRegQuestionCircle } from "react-icons/fa"
import { RiMentalHealthLine } from "react-icons/ri"

export default function LearnPage() {
  const [showAssistant, setShowAssistant] = useState(false)

  useEffect(() => {
    // Show the assistant automatically after 2 seconds
    const timer = setTimeout(() => {
      setShowAssistant(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-4 gradient-text"
          >
            Learn to Invest with Confidence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Our AI-powered Investment Assistant helps beginners understand the stock market through interactive
            learning, personalized guidance, and risk-free practice.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card-bg p-8 rounded-xl border border-border hover-lift"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
              <FaRobot className="text-3xl" />
            </div>

            <h2 className="text-2xl font-bold mb-4">AI-Powered Assistant</h2>

            <p className="text-muted-foreground mb-6">
              Get personalized guidance from our AI assistant that explains complex financial concepts in simple terms.
              Ask questions in plain language and receive clear, jargon-free answers.
            </p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Ask any investing question in simple language</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Get explanations tailored to your knowledge level</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Available 24/7 to answer your questions</span>
              </li>
            </ul>

            <button
              onClick={() => setShowAssistant(true)}
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <span>Try the AI Assistant</span>
              <FaArrowRight className="text-sm" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-card-bg p-8 rounded-xl border border-border hover-lift"
          >
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-6">
              <FaChartLine className="text-3xl" />
            </div>

            <h2 className="text-2xl font-bold mb-4">Risk-Free Practice</h2>

            <p className="text-muted-foreground mb-6">
              Practice investing with our virtual portfolio simulator. Start with $10,000 in virtual cash and learn how
              to build a portfolio without risking real money.
            </p>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-secondary mt-1">•</span>
                <span>Buy and sell virtual stocks with real-time data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary mt-1">•</span>
                <span>Track performance and learn from your decisions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary mt-1">•</span>
                <span>Gain confidence before investing real money</span>
              </li>
            </ul>

            <button
              onClick={() => setShowAssistant(true)}
              className="flex items-center gap-2 text-secondary hover:underline"
            >
              <span>Try the Simulator</span>
              <FaArrowRight className="text-sm" />
            </button>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-card-bg p-6 rounded-lg border border-border hover-lift"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
              <FaRegLightbulb className="text-xl" />
            </div>

            <h3 className="text-xl font-bold mb-2">Learn Key Concepts</h3>

            <p className="text-muted-foreground mb-4">
              Master essential investing terms and concepts with our interactive learning modules.
            </p>

            <button
              onClick={() => setShowAssistant(true)}
              className="text-blue-500 hover:underline text-sm flex items-center gap-1"
            >
              <span>Explore concepts</span>
              <FaArrowRight className="text-xs" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-card-bg p-6 rounded-lg border border-border hover-lift"
          >
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-4">
              <RiMentalHealthLine className="text-xl" />
            </div>

            <h3 className="text-xl font-bold mb-2">Discover Your Risk Profile</h3>

            <p className="text-muted-foreground mb-4">
              Take our assessment to understand your risk tolerance and get personalized investment recommendations.
            </p>

            <button
              onClick={() => setShowAssistant(true)}
              className="text-green-500 hover:underline text-sm flex items-center gap-1"
            >
              <span>Take assessment</span>
              <FaArrowRight className="text-xs" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-card-bg p-6 rounded-lg border border-border hover-lift"
          >
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
              <FaRegQuestionCircle className="text-xl" />
            </div>

            <h3 className="text-xl font-bold mb-2">Get Personalized Answers</h3>

            <p className="text-muted-foreground mb-4">
              Ask specific questions about investing strategies, terms, or market trends and get clear explanations.
            </p>

            <button
              onClick={() => setShowAssistant(true)}
              className="text-purple-500 hover:underline text-sm flex items-center gap-1"
            >
              <span>Ask a question</span>
              <FaArrowRight className="text-xs" />
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-xl border border-primary/20 text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Ready to Start Your Investment Journey?</h2>

          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our Investment Assistant is designed to help beginners understand the stock market and build confidence
            through personalized guidance and risk-free practice.
          </p>

          <button
            onClick={() => setShowAssistant(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full hover:from-primary-hover hover:to-secondary transition-colors hover-lift"
          >
            Launch Investment Assistant
          </button>
        </motion.div>
      </div>

      {/* Pass the showAssistant state to the component */}
      {showAssistant && <InvestmentAssistant initiallyOpen={true} />}
    </Layout>
  )
}