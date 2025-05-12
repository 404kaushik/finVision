import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"
import { getCompanyImages } from "@/lib/getCompanyImages"
const API_KEY = process.env.PERPLEXITY_API_KEY

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80"; // A generic fallback image

// Simple in-memory cache
const researchCache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function POST(req: NextRequest) {
  try {
    const { companyName } = await req.json()

    console.log("Received company name:", companyName)

    let beginnerData: any = null;
    
    // Check if we have cached data for this company
    const cacheKey = companyName.toLowerCase().trim();
    const cachedResult = researchCache[cacheKey];
    
    if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_EXPIRY) {
      console.log(`Using cached data for ${companyName}`);
      beginnerData = cachedResult.data;
    } else {
      console.log(`No cache found or cache expired for ${companyName}, fetching fresh data`);
      
      // Single step: Use sonar-deep-research for everything
      try {
        const response = await axios.post(
          "https://api.perplexity.ai/chat/completions",
          {
            model: "sonar-deep-research",
            messages: [
              {
                role: "system",
                content: `You are a friendly financial analyst. 
                Provide a comprehensive, beginner-friendly investment overview of a company as a JSON object with the following structure:
                {
                  "companyName": "Full company name",
                  "ticker": "Stock ticker symbol",
                  "simpleSummary": "A 2-3 sentence summary of what the company does in very simple terms",
                  "howItMakesMoney": [
                    {"label": "Product/Service", "percent": 60, "color": "#4ade80"},
                    {"label": "Other", "percent": 40, "color": "#fbbf24"}
                  ],
                  "visualMetaphor": "A fun, visual analogy for the business model (e.g., 'Apple is like a digital shopping mall').",
                  "whatMakesSpecial": "A unique, simple explanation of what makes this company stand out.",
                  "beginnerFAQ": [
                    {"q": "Is this company risky?", "a": "It's less risky than most because..."},
                    {"q": "Can I lose money?", "a": "Yes, but here's how to think about it..."}
                  ],
                  "visualTimeline": [
                    {"year": 2000, "event": "Founded", "image": "https://..."},
                    {"year": 2020, "event": "Major milestone", "image": "https://..."}
                  ],
                  "stockSentiment": {"emoji": "🚀", "summary": "Investors are excited about its growth."},
                  "visualRiskMeter": {"score": 30, "color": "#fbbf24", "explanation": "Low risk, stable earnings."},
                  "beginnerExplanation": "A paragraph explaining the company to someone who knows nothing about investing or the industry",
                  "whyConsider": ["Reason 1", "Reason 2", "Reason 3"],
                  "whyAvoid": ["Risk 1", "Risk 2", "Risk 3"],
                  "financialHealth": {
                    "score": 85,
                    "explanation": "Simple explanation of financial health"
                  },
                  "growthPotential": {
                    "score": 75,
                    "explanation": "Simple explanation of growth potential"
                  },
                  "stability": {
                    "score": 80,
                    "explanation": "Simple explanation of stability"
                  },
                  "competitiveAdvantage": "Simple explanation of the company's competitive advantage",
                  "industryPosition": "Leader/Challenger/Niche player/etc.",
                  "beginnerVerdict": "Strong Buy/Buy/Hold/Sell/Strong Sell with a simple explanation",
                  "simpleAnalogy": "An analogy that helps explain the company's business model",
                  "recentNews": ["News item 1", "News item 2"],
                  "commonMisconceptions": ["Misconception 1", "Misconception 2"],
                  "products": [
                    {
                      "name": "Product Name",
                      "image": "https://image-url.com",
                      "sales": 1000000,
                      "profit": 500000,
                      "businessLine": "Business Line Name"
                    }
                  ],
                  "swot": {
                    "strengths": ["Strength 1", "Strength 2"],
                    "weaknesses": ["Weakness 1", "Weakness 2"],
                    "opportunities": ["Opportunity 1", "Opportunity 2"],
                    "threats": ["Threat 1", "Threat 2"]
                  }
                }
                Ensure all explanations are jargon-free and accessible to someone with no financial background.
                Use analogies and simple examples where possible.
                For 'products', include the top 3 best-selling and most profitable products or business lines, with a high-quality image URL for each.
                For 'swot', provide at least 2 points for each category.
                Avoid generic text.
                `
              },
              {
                role: "user",
                content: `Research ${companyName} and provide the information in the specified JSON format.`,
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
            timeout: 6000000,
          }
        )

        const rawContent = response.data.choices?.[0]?.message?.content?.trim()
        if (!rawContent) {
          throw new Error("Empty response received.")
        }

        let extractedJson = rawContent
        const jsonMatch = rawContent.match(/```json\s*({[\s\S]*?})\s*```/)
        if (jsonMatch) {
          extractedJson = jsonMatch[1]
        }

        try {
          beginnerData = JSON.parse(extractedJson)
          
          // Store in cache
          researchCache[cacheKey] = {
            data: beginnerData,
            timestamp: Date.now()
          };
          
        } catch (parseErr: any) {
          console.warn("⚠️ Failed to parse JSON:", parseErr)
          beginnerData = null
        }
      } catch (err: any) {
        console.error("❌ Research error:", err.response?.data || err.message)
        return NextResponse.json({ error: "Failed to fetch research data" }, { status: 500 })
      }
    }

    // --- Fetch Unsplash images for each product if needed ---
    if (beginnerData?.products && Array.isArray(beginnerData.products)) {
      for (const product of beginnerData.products) {
        if (
          !product.image ||
          !product.image.startsWith("http") ||
          product.image.includes("image-url.com")
        ) {
          // Fetch an image for the product name
          const imgs = await getCompanyImages(product.name);
          if (imgs && imgs.length > 0) {
            product.image = imgs[0].url;
          } else {
            product.image = FALLBACK_IMAGE;
          }
        }
      }
    }

    // --- Company-wide images (for the Images tab) ---
    const images = await getCompanyImages(companyName);

    return NextResponse.json({ ...beginnerData, images });
  } catch (err: any) {
    console.error("🚨 Unhandled error:", err.response?.data || err.message)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}