import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getCompanySymbol(companyName: string) {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(companyName)}&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`
    )
    const data = await response.json()
    return { symbol: data.result?.[0]?.symbol || null }
  } catch (error) {
    console.error('Error fetching company symbol:', error)
    return { symbol: null }
  }
}