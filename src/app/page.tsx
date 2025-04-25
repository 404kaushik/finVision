"use client"

import { useState, useEffect, useRef, RefObject } from "react"
import Layout from "@/components/Layout"
import SearchBar from "@/components/SearchBar"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FaChartLine, 
  FaClock, 
  FaLightbulb, 
  FaChartBar, 
  FaGlobe, 
  FaRobot, 
  FaArrowRight, 
  FaGraduationCap 
} from "react-icons/fa"

// Custom hook for intersection observer
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = {}
): [RefObject<T>, boolean] {
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting)
    }, options)

    const current = ref.current
    if (current) observer.observe(current)

    return () => {
      if (current) observer.unobserve(current)
    }
  }, [options])

  return [ref as RefObject<T>, isVisible]
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [featuresRef, featuresVisible] = useIntersectionObserver({ threshold: 0.1 })
  const [newFeaturesRef, newFeaturesVisible] = useIntersectionObserver({ threshold: 0.1 })
  const [ctaRef, ctaVisible] = useIntersectionObserver({ threshold: 0.1 })
  const router = useRouter()

  // Track mouse position for custom cursor and hover effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleSearch = (companyName: string) => {
    setIsLoading(true)
    router.push(`/research?company=${encodeURIComponent(companyName)}`)
  }

  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  const featureCardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5 }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
      transition: { duration: 0.2 }
    }
  }

  return (
    <Layout>
      {/* Custom cursor effect */}
      <div className="fixed pointer-events-none w-6 h-6 bg-primary rounded-full opacity-30 blur-sm z-50 transform -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{ left: cursorPosition.x, top: cursorPosition.y, transition: "transform 0.1s" }} />
      
      {/* Background gradient elements */}
      <div className="fixed inset-0 overflow-hidden z-0 opacity-30">
        <div className="absolute -top-64 -left-32 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 pt-16 pb-32 overflow-hidden">
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 relative z-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-secondary">
                Financial Research
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary via-blue-400 to-primary">
                Reimagined
              </span>
            </motion.h1>

            {/* Animated circles behind the title */}
            <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <motion.div 
                className="w-64 h-64 rounded-full border border-primary opacity-20"
                initial={{ scale: 0 }}
                animate={{ scale: 1, opacity: [0, 0.2] }}
                transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
              />
              <motion.div 
                className="absolute top-0 left-0 w-full h-full rounded-full border border-secondary opacity-15"
                initial={{ scale: 0 }}
                animate={{ scale: 1.3, opacity: [0, 0.15] }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              />
              <motion.div 
                className="absolute top-0 left-0 w-full h-full rounded-full border border-blue-400 opacity-10"
                initial={{ scale: 0 }}
                animate={{ scale: 1.6, opacity: [0, 0.1] }}
                transition={{ duration: 1.5, delay: 0.7, ease: "easeOut" }}
              />
            </div>
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Get comprehensive insights on companies in seconds. 
            <span className="relative ml-2">
              Save hours 
              <motion.span 
                className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 1 }}
              />
            </span> of research with our AI-powered analysis.
          </motion.p>

          <motion.div
            className="w-full max-w-lg relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            
            {/* Floating elements decoration */}
            <motion.div 
              className="absolute -top-12 -right-12 text-primary opacity-20 text-5xl hidden md:block" 
              animate={{ 
                y: [0, -10, 0], 
                rotate: [0, 5, 0] 
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <FaChartLine />
            </motion.div>
            <motion.div 
              className="absolute -bottom-16 -left-12 text-secondary opacity-20 text-5xl hidden md:block" 
              animate={{ 
                y: [0, 10, 0], 
                rotate: [0, -5, 0] 
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <FaLightbulb />
            </motion.div>
          </motion.div>
          
          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <motion.div 
              className="w-8 h-12 rounded-full border-2 border-muted-foreground flex justify-center pt-2"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            >
              <div className="w-1 h-3 bg-muted-foreground rounded-full"></div>
            </motion.div>
          </motion.div>
        </div>

        {/* Features Section with staggered reveal */}
        <motion.div 
          ref={featuresRef}
          variants={containerVariants}
          initial="hidden"
          animate={featuresVisible ? "visible" : "hidden"}
          className="px-4 py-20 md:py-32 bg-card-bg/30 backdrop-blur-lg relative"
        >
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
            >
              Why Choose FinInsight?
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {[
                {
                  icon: <FaChartLine />,
                  title: "Data-Driven Insights",
                  description: "Get comprehensive financial analysis backed by real-time market data",
                  color: "primary"
                },
                {
                  icon: <FaClock />,
                  title: "Save Valuable Time",
                  description: "Research that would take hours condensed into seconds",
                  color: "secondary"
                },
                {
                  icon: <FaLightbulb />,
                  title: "Smart Analysis",
                  description: "AI-powered recommendations and insights based on current market trends",
                  color: "blue-400"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={featureCardVariants}
                  whileHover="hover"
                  className="relative overflow-hidden rounded-2xl p-8 bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl group"
                >
                  {/* Glass morphism card effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <motion.div 
                    className={`text-${feature.color} text-3xl mb-6 relative`}
                    animate={{ rotate: [0, 5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                  >
                    {feature.icon}
                    <div className={`absolute -inset-2 bg-${feature.color}/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  </motion.div>
                  
                  <h3 className={`text-2xl font-semibold mb-4 text-${feature.color}`}>
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <motion.div 
                    className={`absolute bottom-0 left-0 h-1 bg-${feature.color}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                    viewport={{ once: true }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* New Features Section */}
        <motion.div 
          ref={newFeaturesRef}
          variants={containerVariants}
          initial="hidden"
          animate={newFeaturesVisible ? "visible" : "hidden"}
          className="px-4 py-20 md:py-32 relative"
        >
          <div className="max-w-6xl mx-auto">
            <motion.div variants={itemVariants} className="text-center mb-16">
              <div className="inline-flex items-center justify-center mb-4">
                <motion.span 
                  className="relative inline-block text-3xl"
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                >
                  🚀
                </motion.span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-secondary">
                New in Version 7
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-8">
              {[
                {
                  icon: <FaChartBar />,
                  title: "Advanced Charts",
                  description: "Interactive visualizations with multiple chart types and real-time data",
                  color: "primary"
                },
                {
                  icon: <FaGlobe />,
                  title: "Market Overview",
                  description: "Comprehensive market data with real-time updates and trends",
                  color: "secondary"
                },
                {
                  icon: <FaRobot />,
                  title: "Enhanced AI Analysis",
                  description: "More detailed and accurate AI-powered insights and predictions",
                  color: "blue-400"
                },
                {
                  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>,
                  title: "Dark/Light Mode",
                  description: "Choose between dark and light themes for comfortable viewing",
                  color: "purple-400"
                },
                {
                  icon: <FaGraduationCap />,
                  title: "Investment Assistant",
                  description: "AI-powered guide for beginners with virtual portfolio simulator",
                  color: "pink-500"
                },
                {
                  icon: <FaArrowRight />,
                  title: "Real-time Alerts",
                  description: "Get notified instantly about important market changes",
                  color: "green-500"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className={`rounded-2xl p-6 group relative overflow-hidden bg-gradient-to-br from-${feature.color}/10 to-transparent backdrop-blur-sm border border-white/10 shadow-lg`}
                >
                  <motion.div 
                    className="absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-br from-transparent to-white/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  
                  <div className="flex items-start gap-5">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      className={`p-3 bg-${feature.color}/20 rounded-xl text-${feature.color}`}
                    >
                      {feature.icon}
                    </motion.div>
                    
                    <div>
                      <h3 className={`text-xl font-semibold mb-2 group-hover:text-${feature.color} transition-colors`}>
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  <motion.div
                    className={`absolute bottom-0 left-0 h-1 bg-${feature.color}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                    viewport={{ once: true }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Interactive Call to Action */}
        <motion.div 
          ref={ctaRef}
          variants={containerVariants}
          initial="hidden"
          animate={ctaVisible ? "visible" : "hidden"}
          className="px-4 py-20 md:py-32 bg-card-bg/30 backdrop-blur-lg relative"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
            >
              Ready to Transform Your Financial Research?
            </motion.h2>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
            >
              Join thousands of investors making smarter decisions with FinInsight's powerful AI-driven analysis
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col md:flex-row gap-6 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden group px-8 py-4 rounded-full text-white font-medium flex items-center justify-center gap-3"
                onClick={() => router.push("/dashboard")}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:scale-105"></span>
                <span className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.8),_transparent_70%)] transition-opacity duration-300"></span>
                <span className="relative z-10">Get Started Now</span>
                <motion.span 
                  className="relative z-10"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                >
                  <FaArrowRight />
                </motion.span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden group px-8 py-4 rounded-full font-medium flex items-center justify-center gap-3 border border-primary text-primary"
                onClick={() => router.push("/learn")}
              >
                <span className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-all duration-300"></span>
                <span className="relative z-10">Try Investment Assistant</span>
                <motion.span 
                  className="relative z-10"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                >
                  <FaGraduationCap />
                </motion.span>
              </motion.button>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="mt-12 flex justify-center items-center gap-2"
            >
              <span className="inline-block h-2 w-2 bg-green-500 rounded-full"></span>
              <span className="text-muted-foreground">
                <span className="text-green-500 font-medium">2,431</span> investors joined this week
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}