import { NextResponse } from "next/server"
import { generateText } from "ai"
import { perplexity } from "@ai-sdk/perplexity"

// Cache to store insights to avoid repeated API calls
const insightCache: Record<string, { insight: string; timestamp: number }> = {}
// Cache expiration time: 6 hours
const CACHE_EXPIRATION = 6 * 60 * 60 * 1000

export async function POST(request: Request) {
  try {
    const { symbol, changePercent } = await request.json()

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    // Check if we have a cached insight that's still valid
    const cacheKey = `${symbol}-${Math.round(changePercent * 10) / 10}`
    const cachedInsight = insightCache[cacheKey]

    if (cachedInsight && Date.now() - cachedInsight.timestamp < CACHE_EXPIRATION) {
      return NextResponse.json({ insight: cachedInsight.insight })
    }

    // Get API key from environment variable
    const apiKey = process.env.PERPLEXITY_API_KEY

    if (!apiKey) {
      console.error("PERPLEXITY_API_KEY is not defined")
      return NextResponse.json({ insight: getFallbackInsight(symbol, changePercent) })
    }

    const performanceType = changePercent >= 0 ? "positive" : "negative"
    const performanceStrength = Math.abs(changePercent) > 2 ? "significant" : "slight"

    // Generate prompt for Perplexity
    const prompt = `
      You are a financial analyst providing a brief, one-sentence explanation for stock price movements.
      
      Stock: ${symbol}
      Performance: ${performanceType} (${changePercent.toFixed(2)}%)
      
      Provide a simple, beginner-friendly explanation (max 15 words) for why ${symbol} stock might be ${performanceType} today.
      Focus on the most likely recent news, market trends, or company events.
      Do not use technical jargon.
      Do not include phrases like "might be due to" or "could be because" - be direct.
      Do not mention the percentage change in your response.
      Start directly with the reason.
      
      Example good responses:
      - "New product announcement excited investors."
      - "Missed earnings expectations in quarterly report."
      - "CEO resignation created uncertainty."
      
      Your response:
    `

    // Call Perplexity API
    const { text } = await generateText({
      model: perplexity("sonar"),
      prompt,
      maxTokens: 100,
    })

    // Clean up the response
    let insight = text.trim()

    // Remove quotes if present
    insight = insight.replace(/^["']|["']$/g, "")

    // Ensure first letter is capitalized
    insight = insight.charAt(0).toUpperCase() + insight.slice(1)

    // Add period if missing
    if (!insight.endsWith(".") && !insight.endsWith("!") && !insight.endsWith("?")) {
      insight += "."
    }

    // Cache the result
    insightCache[cacheKey] = {
      insight,
      timestamp: Date.now(),
    }

    return NextResponse.json({ insight })
  } catch (error) {
    console.error("Error in stock insight API route:", error)
    return NextResponse.json({ error: "Failed to generate insight", insight: null }, { status: 500 })
  }
}

// Fallback insights when API is unavailable
function getFallbackInsight(symbol: string, changePercent: number): string {
  const positiveReasons = [
    "Strong quarterly earnings report.",
    "New product announcement excited investors.",
    "Positive analyst ratings boosted confidence.",
    "Strategic partnership announcement.",
    "Industry trends favoring company's market.",
    "Cost-cutting measures improved outlook.",
    "Successful product launch.",
    "Increased market share in core business.",
    "Favorable regulatory decision.",
    "Dividend increase announced.",
  ]

  const negativeReasons = [
    "Missed earnings expectations.",
    "Product recall affecting consumer confidence.",
    "Increased competition in key markets.",
    "Regulatory challenges announced.",
    "Executive leadership changes.",
    "Supply chain disruptions reported.",
    "Reduced growth forecast.",
    "Legal issues affecting company outlook.",
    "Industry-wide slowdown impacting revenue.",
    "Profit margin pressure from rising costs.",
  ]

  // Select a random reason based on performance
  const reasons = changePercent >= 0 ? positiveReasons : negativeReasons
  const randomIndex = Math.floor(Math.random() * reasons.length)

  return reasons[randomIndex]
}
