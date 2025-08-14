"use client"

import Layout from "@/components/Layout"
import { motion } from "framer-motion"
import { Users, Target, Award, TrendingUp, Shield, Lightbulb } from "lucide-react"

export default function About() {
  const features = [
    {
      icon: TrendingUp,
      title: "AI-Powered Analysis",
      description: "Advanced artificial intelligence algorithms analyze market trends and company performance to provide accurate insights."
    },
    {
      icon: Shield,
      title: "Reliable Data",
      description: "We source data from trusted financial institutions and real-time market feeds to ensure accuracy and reliability."
    },
    {
      icon: Lightbulb,
      title: "Educational Focus",
      description: "Our platform is designed to educate users about financial markets and investment strategies, not to provide financial advice."
    },
    {
      icon: Users,
      title: "User-Centric Design",
      description: "Built with user experience in mind, making complex financial data accessible to investors of all levels."
    }
  ]

  const team = [
    {
      name: "Development Team",
      role: "Full-Stack Development",
      description: "Experienced developers passionate about fintech and creating innovative solutions for investors."
    },
    {
      name: "Research Team",
      role: "Financial Analysis",
      description: "Financial experts who ensure our algorithms and data analysis methods meet industry standards."
    },
    {
      name: "Design Team",
      role: "User Experience",
      description: "UX/UI specialists focused on making financial data intuitive and accessible to all users."
    }
  ]

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              About FinVision
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Empowering investors with AI-driven financial insights and educational resources to make informed investment decisions.
            </p>
          </div>

          {/* Mission Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card rounded-lg p-8 space-y-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Target className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Our Mission</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              At FinVision, we believe that everyone should have access to high-quality financial research and market insights. 
              Our mission is to democratize financial information by providing AI-powered analysis tools that help investors 
              understand market trends, company performance, and investment opportunities.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We are committed to transparency, accuracy, and education. Our platform serves as a learning hub where users 
              can explore financial concepts, analyze market data, and develop their investment knowledge in a safe, 
              educational environment.
            </p>
          </motion.section>

          {/* Features Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-bold text-center">What Makes Us Different</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="bg-card rounded-lg p-6 space-y-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Team Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-bold text-center">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="bg-card rounded-lg p-6 text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto flex items-center justify-center">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-primary font-medium">{member.role}</p>
                  </div>
                  <p className="text-muted-foreground">{member.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Values Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-card rounded-lg p-8 space-y-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold">Our Values</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Transparency</h3>
                <p className="text-muted-foreground">
                  We believe in complete transparency about our data sources, methodologies, and limitations. 
                  Users always know where information comes from and how it's processed.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Education First</h3>
                <p className="text-muted-foreground">
                  Our primary goal is education, not profit. We provide tools and information to help users 
                  learn about investing and make their own informed decisions.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Accuracy</h3>
                <p className="text-muted-foreground">
                  We strive for the highest level of accuracy in our data and analysis, using multiple 
                  sources and validation methods to ensure reliability.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Accessibility</h3>
                <p className="text-muted-foreground">
                  Financial information should be accessible to everyone, regardless of their experience level. 
                  We design our platform to be intuitive and educational.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Disclaimer */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-3 text-yellow-800 dark:text-yellow-200">Important Notice</h3>
            <p className="text-yellow-700 dark:text-yellow-300">
              FinVision is an educational platform designed to help users learn about financial markets and investment concepts. 
              The information provided on this platform is for educational purposes only and should not be considered as 
              financial advice, investment recommendations, or trading suggestions. Always consult with qualified financial 
              professionals before making investment decisions.
            </p>
          </motion.section>
        </motion.div>
      </div>
    </Layout>
  )
}