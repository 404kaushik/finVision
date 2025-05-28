// app/api/crypto/insights/route.ts
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { symbol, name, changePercent } = await request.json()

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY

    if (!PERPLEXITY_API_KEY) {
      return NextResponse.json({ error: "Perplexity API key is not configured" }, { status: 500 })
    }

    // Determine if crypto is booming or dipping
    const trend = changePercent > 5 ? "booming" : changePercent < -5 ? "dipping" : "fluctuating"
    const trendText = changePercent > 0 ? `gaining ${Math.abs(changePercent).toFixed(2)}%` : `declining ${Math.abs(changePercent).toFixed(2)}%`

    // Create a detailed prompt for Perplexity
    const prompt = `Analyze the recent market performance of ${name} (${symbol}) cryptocurrency. The price is currently ${trendText}. 

Please provide:
1. Key factors driving the current price movement
2. Recent news, partnerships, or developments affecting ${name}
3. Technical analysis insights
4. Market sentiment and social media buzz
5. Regulatory or macroeconomic factors
6. Short-term outlook (next 1-4 weeks)

Focus on the most recent and relevant information from the past 7 days. Be concise but comprehensive.`

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            {
              role: 'system',
              content: 'You are a cryptocurrency market analyst providing concise, data-driven insights. Focus on recent developments and provide actionable analysis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.2,
          top_p: 0.9,
          return_citations: true,
          search_domain_filter: ['coindesk.com', 'cointelegraph.com', 'decrypt.co', 'theblock.co', 'bloomberg.com', 'reuters.com'],
          search_recency_filter: 'week'
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Perplexity API error:', errorData)
        return NextResponse.json({ 
          error: "Failed to get AI insights",
          details: errorData 
        }, { status: response.status })
      }

      const data = await response.json()
      
      const aiInsight = data.choices?.[0]?.message?.content || "Unable to generate insights at this time."
      const citations = data.citations || []

      // Structure the response
      const insights = {
        symbol,
        name,
        trend,
        changePercent,
        analysis: aiInsight,
        citations,
        timestamp: new Date().toISOString(),
        summary: generateSummary(aiInsight, trend, changePercent)
      }

      return NextResponse.json({ insights })

    } catch (perplexityError) {
      console.error('Error calling Perplexity API:', perplexityError)
      
      // Fallback analysis if Perplexity fails
      const fallbackInsights = generateFallbackInsights(symbol, name, changePercent, trend)
      
      return NextResponse.json({ 
        insights: fallbackInsights,
        fallback: true 
      })
    }

  } catch (error) {
    console.error("Error in crypto insights API route:", error)
    return NextResponse.json({ error: "Failed to generate cryptocurrency insights" }, { status: 500 })
  }
}

function generateSummary(analysis: string, trend: string, changePercent: number): string {
  const trendEmoji = changePercent > 5 ? "🚀" : changePercent < -5 ? "📉" : "📊"
  const changeText = changePercent > 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`
  
  // Extract first sentence or main point from analysis
  const firstSentence = analysis.split('.')[0] + '.'
  
  return `${trendEmoji} Currently ${trend} (${changeText}). ${firstSentence}`
}

function generateFallbackInsights(symbol: string, name: string, changePercent: number, trend: string) {
  const trendEmoji = changePercent > 5 ? "🚀" : changePercent < -5 ? "📉" : "📊"
  const changeText = changePercent > 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`
  
  let analysis = `${name} (${symbol}) is currently ${trend} with a ${changeText} change. `
  
  if (changePercent > 5) {
    analysis += `This significant upward movement could be driven by positive market sentiment, increased trading volume, or recent positive developments in the project. Factors to consider include broader crypto market trends, Bitcoin's performance, regulatory news, and any recent partnerships or technological updates.`
  } else if (changePercent < -5) {
    analysis += `This notable decline might be attributed to profit-taking, broader market correction, regulatory concerns, or specific challenges facing the project. It's important to monitor market sentiment, trading volumes, and any recent news that might be impacting investor confidence.`
  } else {
    analysis += `The price is showing relatively stable movement, which could indicate consolidation phase, balanced buying and selling pressure, or waiting for market catalysts. This stability might present opportunities for both buyers and sellers depending on their strategies.`
  }

  analysis += ` Always conduct thorough research and consider multiple factors before making investment decisions.`

  return {
    symbol,
    name,
    trend,
    changePercent,
    analysis,
    citations: [],
    timestamp: new Date().toISOString(),
    summary: `${trendEmoji} Currently ${trend} (${changeText}). ${analysis.split('.')[1] + '.'}`
  }
}