import type React from "react"
import "./globals.css"
import { Inter, Poppins } from "next/font/google"
import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/context/ThemeContext"
import { Toaster } from "sonner"
import Script from "next/script"

// Use Poppins as the main font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

// Keep Inter as a fallback
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata = {
  title: {
    default: "FinVision - AI-Powered Financial Research & Education Platform",
    template: "%s | FinVision"
  },
  description: "Empowering investors with AI-driven financial insights, market analysis, and educational resources. Learn about stocks, crypto, and investment strategies with our comprehensive research platform.",
  keywords: ["financial research", "stock analysis", "investment education", "market insights", "AI finance", "crypto analysis", "investment tools", "financial learning", "NVIDIA stock", "Tesla analysis", "Apple investment", "tech stocks 2024"],
  authors: [{ name: "FinVision Team" }],
  creator: "FinVision",
  publisher: "FinVision",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://finvision.app',
    title: 'FinVision - AI-Powered Financial Research & Education Platform',
    description: 'Empowering investors with AI-driven financial insights, market analysis, and educational resources.',
    siteName: 'FinVision',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinVision - AI-Powered Financial Research & Education Platform',
    description: 'Empowering investors with AI-driven financial insights, market analysis, and educational resources.',
  },
  verification: {
    google: 'your-google-verification-code-here',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable} font-sans`} suppressHydrationWarning>
      <head>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8795119933898026"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
              {children}                                          
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
