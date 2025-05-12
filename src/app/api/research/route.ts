// app/api/research/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/utils/supabase/client"

import axios from "axios"

const API_KEY = process.env.PERPLEXITY_API_KEY

const researchCache = new Map<string, any>()

export async function POST(req: NextRequest) {
  try {
    const { companyName, forceRefresh } = await req.json()
    
    // First, check if the result is already cached in memory
    if (!forceRefresh && researchCache.has(companyName)) {
      console.log("Returning in-memory cached research for:", companyName)
      return NextResponse.json({
        ...researchCache.get(companyName),
        fromCache: true,
        cacheSource: "memory"
      })
    }

    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: `You are a financial analyst providing detailed research about companies.
            Format your response as a JSON object with the following structure:
            {
              "overview": "A comprehensive overview of the company",
              "metrics": [
                {"name": "Revenue Growth", "value": "X%", "score": 75},
                {"name": "Profit Margin", "value": "Y%", "score": 60},
                {"name": "Market Share", "value": "Z%", "score": 80},
                {"name": "P/E Ratio", "value": "N", "score": 65},
                {"name": "Debt-to-Equity", "value": "M", "score": 70}
              ],
              "analysis": "Detailed analysis of the company's performance, market position, and financial health",
              "outlook": "Future outlook and predictions",
              "competitors": ["Competitor 1", "Competitor 2", "Competitor 3"],
              "risks": ["Risk 1", "Risk 2", "Risk 3"],
              "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"]
            }
            
            Ensure all data is accurate and up-to-date. If you don't have specific information, provide reasonable estimates based on industry standards and recent trends.`,
          },
          {
            role: "user",
            content: `Provide a comprehensive analysis of ${companyName}, including recent performance, market trends, financial health, competitive position, and future outlook.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    )

    researchCache.set(companyName, response.data)

    return NextResponse.json(response.data)
  } catch (err: any) {
    console.error("Error fetching research:", err.response?.data || err.message)
    return NextResponse.json({ error: "Failed to fetch research" }, { status: 500 })
  }
}
