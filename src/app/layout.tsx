import type React from "react"
import "./globals.css"
import { Inter, Poppins } from "next/font/google"
import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/context/ThemeContext"
import { Toaster } from "sonner"
import { TutorialProvider } from '@/context/TutorialContext';
// import Tutorial from '@/components/Tutorial';
import WelcomeModal from '@/components/WelcomeModal';
import HelpButton from '@/components/HelpButton';

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
  title: "Finance Research App",
  description: "Deep research into company performance based on current trends",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable} font-sans`} suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <TutorialProvider>
              {children}
              {/* <Tutorial /> */}
              <WelcomeModal />
              <HelpButton />
            </TutorialProvider>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
