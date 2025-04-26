"use client"

import { useState, useEffect, useRef, RefObject } from "react"
import Layout from "@/components/Layout"
import SearchBar from "@/components/SearchBar"
import { StockCarousel } from "@/components/StockCarousel"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion"
import { 
  FaChartLine, 
  FaClock, 
  FaLightbulb, 
  FaChartBar, 
  FaGlobe, 
  FaRobot, 
  FaArrowRight, 
  FaGraduationCap,
  FaSearch
} from "react-icons/fa"
import Image from "next/image"

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
  
  // Scroll progress for parallax effects
  const { scrollYProgress } = useScroll()
  const smoothScrollProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const heroOpacity = useTransform(smoothScrollProgress, [0, 0.2], [1, 0])
  const heroY = useTransform(smoothScrollProgress, [0, 0.2], [0, -100])
  
  // Floating particles state
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, color: string}>>([])
  
  // Generate floating particles
  useEffect(() => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981']
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 2,
      color: colors[Math.floor(Math.random() * colors.length)]
    }))
    setParticles(newParticles)
  }, [])

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
  
  // New 3D card hover effect
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [cardHover, setCardHover] = useState(false)
  
  const handleCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardHover) return
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateXVal = (y - centerY) / 10
    const rotateYVal = (centerX - x) / 10
    setRotateX(rotateXVal)
    setRotateY(rotateYVal)
  }

  return (
    <Layout>
      {/* Custom cursor effect - now with trailing effect */}
      <div className="fixed pointer-events-none w-8 h-8 bg-primary rounded-full opacity-20 blur-sm z-50 transform -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{ left: cursorPosition.x, top: cursorPosition.y, transition: "transform 0.15s cubic-bezier(0.17, 0.67, 0.83, 0.67)" }} />
      <div className="fixed pointer-events-none w-4 h-4 bg-secondary rounded-full opacity-30 z-50 transform -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{ left: cursorPosition.x, top: cursorPosition.y, transition: "transform 0.1s cubic-bezier(0.17, 0.67, 0.83, 0.67)" }} />
      
      {/* Floating particles background */}
      <div className="fixed inset-0 overflow-hidden z-0 opacity-40">
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              filter: `blur(${particle.size > 6 ? 2 : 1}px)`
            }}
            animate={{
              x: [
                Math.random() * 50 - 25,
                Math.random() * 50 - 25,
                Math.random() * 50 - 25
              ],
              y: [
                Math.random() * 50 - 25,
                Math.random() * 50 - 25,
                Math.random() * 50 - 25
              ],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Gradient mesh background */}
      <div className="fixed inset-0 overflow-hidden z-0 opacity-30">
        <div className="absolute -top-64 -left-32 w-[40vw] h-[40vw] bg-gradient-to-r from-primary to-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-32 w-[35vw] h-[35vw] bg-gradient-to-l from-secondary to-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 left-1/4 w-[30vw] h-[30vw] bg-gradient-to-tr from-blue-400 to-primary rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section with parallax effect */}
        <motion.div 
          className="flex flex-col items-center justify-center min-h-screen text-center px-4 pt-16 pb-32 overflow-hidden"
          style={{ opacity: heroOpacity, y: heroY }}
        >
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1 
              className="text-6xl md:text-8xl font-bold mb-6 relative z-10 tracking-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.span 
                className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-secondary inline-block"
                animate={{ 
                  backgroundPosition: ['0% center', '100% center', '0% center'],
                }}
                transition={{ 
                  duration: 10, 
                  repeat: Infinity,
                  repeatType: "mirror"
                }}
                style={{
                  backgroundSize: '200% auto',
                }}
              >
                Financial Research
              </motion.span>
              <br />
              <motion.span 
                className="bg-clip-text text-transparent bg-gradient-to-r from-secondary via-blue-400 to-primary inline-block"
                animate={{ 
                  backgroundPosition: ['0% center', '100% center', '0% center'],
                }}
                transition={{ 
                  duration: 10, 
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 0.5
                }}
                style={{
                  backgroundSize: '200% auto',
                }}
              >
                Reimagined
              </motion.span>
            </motion.h1>

            {/* Animated 3D circles behind the title */}
            <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <motion.div 
                className="w-[30vw] h-[30vw] rounded-full border-2 border-primary/30 opacity-20"
                initial={{ scale: 0, rotateZ: 0 }}
                animate={{ scale: 1, opacity: [0, 0.2], rotateZ: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-secondary/30 opacity-15"
                initial={{ scale: 0, rotateZ: 0 }}
                animate={{ scale: 1.3, opacity: [0, 0.15], rotateZ: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-blue-400/30 opacity-10"
                initial={{ scale: 0, rotateZ: 0 }}
                animate={{ scale: 1.6, opacity: [0, 0.1], rotateZ: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Get comprehensive insights on companies in seconds. 
            <motion.span 
              className="relative ml-2 font-medium text-primary"
              whileHover={{ scale: 1.05 }}
            >
              Save hours 
              <motion.span 
                className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 1 }}
              />
            </motion.span> of research with our AI-powered analysis.
          </motion.p>

          <motion.div
            className="w-full max-w-xl relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {/* Glowing search bar */}
            <div className="relative group">
              <motion.div 
                className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-1000"
                animate={{ 
                  backgroundPosition: ['0% center', '100% center', '0% center'],
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity,
                  repeatType: "mirror"
                }}
                style={{
                  backgroundSize: '200% auto',
                }}
              />
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            </div>
            
            {/* Floating elements decoration with 3D effect */}
            <motion.div 
              className="absolute -top-16 -right-16 text-primary opacity-20 text-6xl hidden md:block" 
              animate={{ 
                y: [0, -15, 0], 
                rotateY: [0, 180, 360],
                z: [0, 30, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <FaChartLine />
            </motion.div>
            <motion.div 
              className="absolute -bottom-20 -left-16 text-secondary opacity-20 text-6xl hidden md:block" 
              animate={{ 
                y: [0, 15, 0], 
                rotateY: [0, -180, -360],
                z: [0, 30, 0]
              }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <FaLightbulb />
            </motion.div>
          </motion.div>
          
          {/* Modern scroll indicator */}
          <motion.div 
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <motion.div 
              className="flex flex-col items-center gap-2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            >
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Scroll to explore</span>
              <motion.div 
                className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2 relative overflow-hidden"
              >
                <motion.div 
                  className="w-1.5 h-1.5 bg-primary rounded-full absolute"
                  animate={{ 
                    y: [0, 20, 0],
                    opacity: [1, 0.3, 1]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    repeatType: "loop", 
                    ease: "easeInOut" 
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
                
        {/* Features Section with 3D cards */}
        <motion.div 
          ref={featuresRef}
          variants={containerVariants}
          initial="hidden"
          animate={featuresVisible ? "visible" : "hidden"}
          className="px-4 py-20 md:py-32 bg-card-bg/30 backdrop-blur-lg relative"
        >
          <div className="max-w-6xl mx-auto">
            <motion.div 
              variants={itemVariants}
              className="text-center mb-20"
            >
              <motion.div 
                className="inline-block mb-4 relative"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <span className="relative z-10 text-2xl">✨</span>
              </motion.div>
              <h2 
                className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
              >
                Why Choose FinInsight?
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-10 md:gap-16">
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
                  onMouseMove={handleCardMove}
                  onMouseEnter={() => setCardHover(true)}
                  onMouseLeave={() => {
                    setCardHover(false)
                    setRotateX(0)
                    setRotateY(0)
                  }}
                  style={{
                    perspective: 1000,
                    transformStyle: "preserve-3d",
                    transform: cardHover ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` : "none",
                    transition: "transform 0.1s ease"
                  }}
                  className="relative overflow-hidden rounded-2xl p-8 bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl group"
                >
                  {/* 3D card effect with dynamic lighting */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,_rgba(255,255,255,0.15),_transparent_70%)]" />
                  
                  <motion.div 
                    className={`text-${feature.color} text-4xl mb-8 relative`}
                    animate={{ 
                      rotateY: [0, 360],
                      z: [0, 30, 0]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {feature.icon}
                    <motion.div 
                      className={`absolute -inset-4 bg-${feature.color}/20 rounded-full blur-xl opacity-0 group-hover:opacity-100`}
                      animate={{ 
                        scale: [0.8, 1.2, 0.8],
                        opacity: [0, 0.5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </motion.div>
                  
                  <h3 className={`text-2xl font-semibold mb-4 text-${feature.color} group-hover:translate-z-10`} style={{ transform: "translateZ(20px)" }}>
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed" style={{ transform: "translateZ(10px)" }}>
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

        {/* New Features Section with interactive cards */}
        <motion.div 
          ref={newFeaturesRef}
          variants={containerVariants}
          initial="hidden"
          animate={newFeaturesVisible ? "visible" : "hidden"}
          className="px-4 py-20 md:py-32 relative"
        >
          <div className="max-w-6xl mx-auto">
            <motion.div variants={itemVariants} className="text-center mb-20">
              <div className="inline-flex items-center justify-center mb-6">
                <motion.div 
                  className="relative"
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <motion.div 
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.span 
                    className="relative inline-block text-4xl"
                    animate={{ 
                      rotateY: [0, 360],
                      z: [0, 50, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    🚀
                  </motion.span>
                </motion.div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-secondary">
                New in Version 7
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
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
                  icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>,
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
                  whileHover={{ y: -10, scale: 1.03 }}
                  className={`rounded-2xl p-8 group relative overflow-hidden backdrop-blur-sm border border-white/10 shadow-lg`}
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))`,
                  }}
                >
                  {/* Animated gradient background */}
                  <motion.div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
                    style={{
                      background: `linear-gradient(135deg, rgba(${feature.color === 'primary' ? '99,102,241' : feature.color === 'secondary' ? '139,92,246' : feature.color === 'blue-400' ? '59,130,246' : feature.color === 'purple-400' ? '139,92,246' : feature.color === 'pink-500' ? '236,72,153' : '16,185,129'},0.1), rgba(${feature.color === 'primary' ? '99,102,241' : feature.color === 'secondary' ? '139,92,246' : feature.color === 'blue-400' ? '59,130,246' : feature.color === 'purple-400' ? '139,92,246' : feature.color === 'pink-500' ? '236,72,153' : '16,185,129'},0.05))`,
                    }}
                  />
                  
                  {/* Glowing orb */}
                  <motion.div 
                    className="absolute -right-10 -top-10 w-20 h-20 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle, rgba(${feature.color === 'primary' ? '99,102,241' : feature.color === 'secondary' ? '139,92,246' : feature.color === 'blue-400' ? '59,130,246' : feature.color === 'purple-400' ? '139,92,246' : feature.color === 'pink-500' ? '236,72,153' : '16,185,129'},1), transparent 70%)`,
                    }}
                  />
                  
                  <div className="flex items-start gap-5">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      className={`p-4 rounded-xl text-${feature.color}`}
                      style={{
                        background: `linear-gradient(135deg, rgba(${feature.color === 'primary' ? '99,102,241' : feature.color === 'secondary' ? '139,92,246' : feature.color === 'blue-400' ? '59,130,246' : feature.color === 'purple-400' ? '139,92,246' : feature.color === 'pink-500' ? '236,72,153' : '16,185,129'},0.2), rgba(${feature.color === 'primary' ? '99,102,241' : feature.color === 'secondary' ? '139,92,246' : feature.color === 'blue-400' ? '59,130,246' : feature.color === 'purple-400' ? '139,92,246' : feature.color === 'pink-500' ? '236,72,153' : '16,185,129'},0.1))`,
                      }}
                    >
                      <motion.div
                        animate={{ 
                          rotateY: [0, 360],
                          z: [0, 20, 0]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
                        style={{ transformStyle: "preserve-3d" }}
                        className="text-xl"
                      >
                        {feature.icon}
                      </motion.div>
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        </div>
      </Layout>
  )
}