// src/app/api/stock-quote/route.ts
import { NextResponse } from "next/server";
import { generateText } from "ai";
import { perplexity } from "@ai-sdk/perplexity";
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
    // Check if we have cached data in the database
    const { data: existingData, error: fetchError } = await supabase
      .from("stock_data")
      .select("*")
      .eq("symbol", symbol)
      .single();

    // If we have valid cached data that's not expired, return it
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

    // No valid cache, fetch from Perplexity API
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      console.error("PERPLEXITY_API_KEY is not defined");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Generate prompt for Perplexity
    const prompt = `
      You are a financial data provider. Return the current stock information for ${symbol} in JSON format.
      
      Include the following information:
      - Current price (c)
      - Daily change amount (d)
      - Daily change percentage (dp)
      - Previous close price (pc)
      - Company name
      - Company logo URL if available
      
      Return ONLY a valid JSON object with this structure:
      {
        "quote": {
          "c": number,
          "d": number,
          "dp": number,
          "pc": number
        },
        "profile": {
          "name": "Company Full Name",
          "logo": "URL to company logo or null"
        }
      }
      
      Use real-time data if possible. Do not include any explanations, just the JSON.
    `;

    // Call Perplexity API
    const { text } = await generateText({
      model: perplexity("sonar"),
      prompt,
      maxTokens: 500,
    });

    // Parse the response
    let stockData;
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        stockData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to extract JSON from response");
      }
    } catch (parseError) {
      console.error("Error parsing Perplexity response:", parseError);
      return NextResponse.json(
        { error: "Failed to parse stock data" },
        { status: 500 }
      );
    }

    // Save to database
    const { error: upsertError } = await supabase
      .from("stock_data")
      .upsert({
        symbol: symbol,
        data: JSON.stringify(stockData),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (upsertError) {
      console.error("Error saving to database:", upsertError);
    }

    return NextResponse.json(stockData);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}