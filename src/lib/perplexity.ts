import { getCompanyImages } from "./getCompanyImages"

const API_KEY = process.env.PERPLEXITY_API_KEY

export async function getCompanyResearch(companyName: string, forceRefresh = false) {
  try {
    // Pass forceRefresh parameter to control whether to use cached data
    const res = await fetch("/api/research", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ companyName, forceRefresh }),
    })

    if (!res.ok) throw new Error("Failed to fetch research")
    return res.json()
  } catch (error) {
    console.error("Error fetching company research:", error)
    throw error
  }
}

export async function getStockInsight(symbol: string, changePercent: number, forceRefresh = false) {
  try {
    const res = await fetch("/api/stock-insight", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symbol, changePercent, forceRefresh }),
    })

    if (!res.ok) throw new Error("Failed to fetch stock insight")
    return res.json()
  } catch (error) {
    console.error("Error fetching stock insight:", error)
    return { insight: null }
  }
}

export async function getBeginnerFriendlyResearch(companyName: string) {
  try {
    const res = await fetch("/api/beginner-research", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ companyName }),
    })

    if (!res.ok) throw new Error("Failed to fetch beginner research")
    const beginnerData = await res.json()

    // After parsing beginnerData
    if (beginnerData.products && Array.isArray(beginnerData.products)) {
      for (const product of beginnerData.products) {
        if (!product.image) {
          // Fetch an image for the product name
          const imgs = await getCompanyImages(product.name);
          if (imgs && imgs.length > 0) {
            product.image = imgs[0].url;
          }
        }
      }
    }

    return beginnerData
  } catch (error) {
    console.error("Error fetching beginner research:", error)
    throw error
  }
}

