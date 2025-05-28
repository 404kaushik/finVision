// src/app/api/stock-quote/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/client";

// Cache expiration time: 6 hours in milliseconds
const CACHE_EXPIRATION = 6 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    // Check for cached data
    const { data: existingData, error: fetchError } = await supabase
      .from("stock_data")
      .select("*")
      .eq("symbol", symbol)
      .single();

    if (existingData && !fetchError) {
      const cachedTime = new Date(existingData.updated_at).getTime();
      const now = Date.now();

      if (now - cachedTime < CACHE_EXPIRATION) {
        console.log(`Returning cached data for ${symbol}`);
        return NextResponse.json({
          ...JSON.parse(existingData.data),
          fromCache: true,
        });
      }
    }

    // Fetch from Finnhub
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!apiKey) {
      console.error("FINNHUB_API_KEY is not defined");
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const [quoteRes, profileRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`),
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`),
    ]);

    if (!quoteRes.ok || !profileRes.ok) {
      return NextResponse.json({ error: "Failed to fetch data from Finnhub" }, { status: 500 });
    }

    const quote = await quoteRes.json();
    const profile = await profileRes.json();

    const stockData = {
      quote: {
        c: quote.c,  // Current price
        d: quote.d,  // Change
        dp: quote.dp, // Change %
        pc: quote.pc // Previous close
      },
      profile: {
        name: profile.name || symbol,
        logo: profile.logo || null
      }
    };

    // Save to Supabase
    const { error: upsertError } = await supabase
      .from("stock_data")
      .upsert({
        symbol: symbol,
        data: JSON.stringify(stockData),
        updated_at: new Date().toISOString(),
      }, 
      { onConflict: 'symbol', ignoreDuplicates: false })
      .select();

    if (upsertError) {
      console.error("Error saving to database:", upsertError);
    }

    return NextResponse.json(stockData);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}
