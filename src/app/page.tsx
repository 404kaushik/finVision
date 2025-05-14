"use client"

import { useState } from "react"
import Layout from "@/components/Layout"
import SearchBar from "@/components/SearchBar"
import { StockTickerHeader } from "@/components/StockTickerHeader"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ClockIcon, LightbulbIcon, BarChart2Icon, ArrowRightIcon, ChevronDownIcon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StockCarousel } from "@/components/StockCarousel"

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSearch = (companyName: string) => {
    setIsLoading(true)
    router.push(`/research?company=${encodeURIComponent(companyName)}`)
  }

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  return (
    <>
      {/* <StockTickerHeader /> */}
      <Layout>
        <div className="relative z-10">
          {/* Hero Section */}
          <section 
            className="flex flex-col items-center justify-center min-h-[90vh] text-center px-4 py-16 relative overflow-hidden"
            // style={{
            //   backgroundImage: "url('/buildings.png')",
            //   backgroundSize: 'cover',
            //   backgroundPosition: 'center',
            //   backgroundRepeat: 'no-repeat'
            // }}
          >
            {/* Abstract background elements */}
            <div className="absolute inset-0 overflow-hidden opacity-10 dark:opacity-20 pointer-events-none">
              <motion.div
                className="absolute top-[10%] right-[15%] w-64 h-64 rounded-full bg-primary/30 blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              />
              <motion.div
                className="absolute bottom-[20%] left-[10%] w-80 h-80 rounded-full bg-primary/20 blur-3xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 1 }}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto relative z-10"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="mb-8 flex justify-center"
              >
                <div className="relative w-16 h-16 md:w-20 md:h-20">
                  <div className="absolute inset-0 bg-primary/10 rounded-full flex items-center justify-center">
                    <BarChart2Icon className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-full border border-primary/30"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                  />
                </div>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-6xl font-bold mb-6 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="text-primary">Financial Research</span>
                <br />
                <span>Reimagined</span>
              </motion.h1>

              <motion.p
                className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Get comprehensive insights on companies in seconds.
                <span className="relative ml-2 font-medium text-primary">
                  Save hours
                  <motion.span
                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 1 }}
                  />
                </span>{" "}
                of research with our AI-powered analysis.
              </motion.p>

              <motion.div
                className="w-full max-w-xl mx-auto relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="relative group">
                  <motion.div
                    className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/30 rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-1000"
                    animate={{
                      background: [
                        "linear-gradient(to right, rgba(0, 122, 255, 0.5), rgba(0, 122, 255, 0.3))",
                        "linear-gradient(to right, rgba(0, 122, 255, 0.3), rgba(0, 122, 255, 0.5))",
                        "linear-gradient(to right, rgba(0, 122, 255, 0.5), rgba(0, 122, 255, 0.3))",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                  />
                  <SearchBar onSearch={handleSearch} isLoading={isLoading} />
                </div>
              </motion.div>

              <motion.div
                className="mt-12 flex flex-wrap justify-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <div className="text-xs text-muted-foreground px-3 py-1 rounded-full border border-border">
                  AI-Powered
                </div>
                <div className="text-xs text-muted-foreground px-3 py-1 rounded-full border border-border">
                  Real-time Data
                </div>
                <div className="text-xs text-muted-foreground px-3 py-1 rounded-full border border-border">
                  Beginner Friendly
                </div>
                <div className="text-xs text-muted-foreground px-3 py-1 rounded-full border border-border">
                  Comprehensive Analysis
                </div>
              </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <motion.button
                onClick={scrollToFeatures}
                className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", ease: "easeInOut" }}
              >
                <span className="text-xs uppercase tracking-widest">Explore</span>
                <ChevronDownIcon className="h-5 w-5" />
              </motion.button>
            </motion.div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-24 md:py-32">
            <div className="max-w-6xl mx-auto px-4">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="text-center mb-20"
              >
                <motion.div variants={itemVariants} className="inline-block mb-4">
                  <div className="w-12 h-1 bg-primary mx-auto mb-6"></div>
                </motion.div>
                <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4">
                  Why Choose FinInsight?
                </motion.h2>
                <motion.p variants={itemVariants} className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Our platform combines cutting-edge AI with financial expertise to deliver insights that matter.
                </motion.p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <BarChart2Icon className="h-6 w-6" />,
                    title: "Data-Driven Insights",
                    description: "Get comprehensive financial analysis backed by real-time market data",
                  },
                  {
                    icon: <ClockIcon className="h-6 w-6" />,
                    title: "Save Valuable Time",
                    description: "Research that would take hours condensed into seconds",
                  },
                  {
                    icon: <LightbulbIcon className="h-6 w-6" />,
                    title: "Smart Analysis",
                    description: "AI-powered recommendations and insights based on current market trends",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    className="bg-card p-8 rounded-xl border border-border hover:border-primary/20 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary/20 transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Stock Carousel Section */}
          <section className="py-16 bg-accent/30">
            <div className="max-w-6xl mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <StockCarousel title="Market Trends" description="Stay updated with the latest market movements" />
              </motion.div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-24">
            <div className="max-w-6xl mx-auto px-4">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="text-center mb-16"
              >
                <motion.div variants={itemVariants} className="inline-block mb-4">
                  <div className="w-12 h-1 bg-primary mx-auto mb-6"></div>
                </motion.div>
                <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4">
                  How It Works
                </motion.h2>
                <motion.p variants={itemVariants} className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Simple steps to get the financial insights you need
                </motion.p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8 relative">
                {/* Connecting line */}
                <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0"></div>

                {[
                  {
                    step: "01",
                    icon: <SearchIcon className="h-6 w-6" />,
                    title: "Search",
                    description: "Enter a company name or ticker symbol in the search bar",
                  },
                  {
                    step: "02",
                    icon: <BarChart2Icon className="h-6 w-6" />,
                    title: "Analyze",
                    description: "Our AI analyzes financial data, news, and market trends",
                  },
                  {
                    step: "03",
                    icon: <LightbulbIcon className="h-6 w-6" />,
                    title: "Discover",
                    description: "Get comprehensive insights and make informed decisions",
                  },
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="bg-card p-8 rounded-xl border border-border relative z-10"
                  >
                    <div className="absolute -top-4 left-8 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                      {step.step}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-medium mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 bg-accent/30">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-card p-10 rounded-2xl border border-border relative overflow-hidden"
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>

                <div className="relative z-10">
                  <h2 className="text-3xl font-bold mb-4">Ready to transform your financial research?</h2>
                  <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Start exploring companies and get AI-powered insights in seconds.
                  </p>
                  <Button size="lg" className="px-8 group">
                    Get Started
                    <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </Layout>
    </>
  )
}
