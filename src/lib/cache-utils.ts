import { createClient } from "@/utils/supabase/server"

// Cache types
export type CacheType = "stock-insight" | "company-research" | "market-data"

// Function to get cached data
export async function getCachedData<T>(cacheKey: string, cacheType: CacheType): Promise<T | null> {
  try {
    const supabase = await createClient()

    // Query the cache table for the specific key and type
    const { data, error } = await supabase
      .from("market_cache")
      .select("data, expires_at")
      .eq("cache_key", cacheKey)
      .eq("cache_type", cacheType)
      .single()

    if (error || !data) {
      console.log(`Cache miss for ${cacheType}:${cacheKey}`)
      return null
    }

    // Check if the cache has expired
    const expiresAt = new Date(data.expires_at)
    if (expiresAt < new Date()) {
      console.log(`Cache expired for ${cacheType}:${cacheKey}`)

      // Delete the expired cache entry
      await supabase.from("market_cache").delete().eq("cache_key", cacheKey).eq("cache_type", cacheType)

      return null
    }

    console.log(`Cache hit for ${cacheType}:${cacheKey}`)
    return data.data as T
  } catch (error) {
    console.error("Error getting cached data:", error)
    return null
  }
}

// Function to set cached data with expiration
export async function setCachedData<T>(
  cacheKey: string,
  cacheType: CacheType,
  data: T,
  expirationHours = 24,
): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Calculate expiration time
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + expirationHours)

    // Upsert the cache entry
    const { error } = await supabase.from("market_cache").upsert(
      {
        cache_key: cacheKey,
        cache_type: cacheType,
        data,
        expires_at: expiresAt.toISOString(),
      },
      {
        onConflict: "cache_key",
      },
    )

    if (error) {
      console.error("Error setting cached data:", error)
      return false
    }

    console.log(`Cache set for ${cacheType}:${cacheKey}, expires at ${expiresAt.toLocaleString()}`)
    return true
  } catch (error) {
    console.error("Error setting cached data:", error)
    return false
  }
}

// Function to force refresh cached data
export async function invalidateCache(cacheKey: string, cacheType: CacheType): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("market_cache").delete().eq("cache_key", cacheKey).eq("cache_type", cacheType)

    if (error) {
      console.error("Error invalidating cache:", error)
      return false
    }

    console.log(`Cache invalidated for ${cacheType}:${cacheKey}`)
    return true
  } catch (error) {
    console.error("Error invalidating cache:", error)
    return false
  }
}

// Function to get cache status
export async function getCacheStatus(): Promise<{
  totalEntries: number
  insightEntries: number
  researchEntries: number
  marketDataEntries: number
  oldestEntry: string | null
  newestEntry: string | null
}> {
  try {
    const supabase = await createClient()

    // Get total count
    const { count: totalCount } = await supabase.from("market_cache").select("*", { count: "exact", head: true })

    // Get count by type
    const { data: typeCounts } = await supabase.from("market_cache").select("cache_type")

    const insightCount = typeCounts?.filter((item) => item.cache_type === "stock-insight").length || 0
    const researchCount = typeCounts?.filter((item) => item.cache_type === "company-research").length || 0
    const marketDataCount = typeCounts?.filter((item) => item.cache_type === "market-data").length || 0

    // Get oldest and newest entries
    const { data: oldestData } = await supabase
      .from("market_cache")
      .select("created_at")
      .order("created_at", { ascending: true })
      .limit(1)

    const { data: newestData } = await supabase
      .from("market_cache")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)

    return {
      totalEntries: totalCount || 0,
      insightEntries: insightCount,
      researchEntries: researchCount,
      marketDataEntries: marketDataCount,
      oldestEntry: oldestData && oldestData.length > 0 ? new Date(oldestData[0].created_at).toLocaleString() : null,
      newestEntry: newestData && newestData.length > 0 ? new Date(newestData[0].created_at).toLocaleString() : null,
    }
  } catch (error) {
    console.error("Error getting cache status:", error)
    return {
      totalEntries: 0,
      insightEntries: 0,
      researchEntries: 0,
      marketDataEntries: 0,
      oldestEntry: null,
      newestEntry: null,
    }
  }
}
