import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import axios from "axios";

// In-memory cache for quick responses
const memoryCache: Record<string, { answer: string, timestamp: number, images?: any[] }> = {};
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

// Function to extract keywords from a question for image search
function extractKeywords(question: string, companyName: string): string {
  // Basic NLP to extract important keywords
  const lowercaseQuestion = question.toLowerCase();
  
  // Check for product-related questions
  if (lowercaseQuestion.includes("product") || 
      lowercaseQuestion.includes("offer") || 
      lowercaseQuestion.includes("sell") ||
      lowercaseQuestion.includes("service")) {
    return `${companyName} products`;
  }
  
  // Check for leadership questions
  if (lowercaseQuestion.includes("ceo") || 
      lowercaseQuestion.includes("founder") || 
      lowercaseQuestion.includes("executive") ||
      lowercaseQuestion.includes("leadership")) {
    return `${companyName} CEO leadership team`;
  }
  
  // Check for office/headquarters questions
  if (lowercaseQuestion.includes("office") || 
      lowercaseQuestion.includes("headquarters") || 
      lowercaseQuestion.includes("location") ||
      lowercaseQuestion.includes("building")) {
    return `${companyName} headquarters building`;
  }
  
  // Default to just the company name
  return companyName;
}

// Function to fetch images from Unsplash
async function fetchImages(searchQuery: string) {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
  
  try {
    const res = await axios.get("https://api.unsplash.com/search/photos", {
      params: {
        query: searchQuery,
        per_page: 3,
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    return res.data.results.map((img: any) => ({
      id: img.id,
      alt: img.alt_description || searchQuery,
      url: img.urls.regular,
      link: img.links.html,
      thumb: img.urls.thumb,
    }));
  } catch (err) {
    console.error("Error fetching images:", err);
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sectionTitle, sectionContext, question, companyName } = await req.json();

    // Validate required fields
    if (!sectionTitle || !sectionContext || !question || !companyName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user from Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if we have a cached response in Supabase
    const { data: existingData } = await supabase
      .from("saved_research")
      .select("chat_responses")
      .eq("user_id", user.id)
      .eq("company_name", companyName.toLowerCase())
      .single();

    if (existingData?.chat_responses?.[sectionTitle]) {
      const sectionResponses = existingData.chat_responses[sectionTitle];
      const cachedResponse = sectionResponses.find(
        (item: any) => item.question.toLowerCase() === question.toLowerCase()
      );

      if (cachedResponse) {
        return NextResponse.json({
          answer: cachedResponse.answer,
          images: cachedResponse.images || [],
          fromCache: true
        });
      }
    }

    // If no cached response, call Perplexity API
    const prompt = `
      You are a financial research assistant. The user is viewing a section titled "${sectionTitle}" with the following context:
      ${sectionContext}

      The user asks: "${question}"

      Provide a clear, concise, and helpful answer, referencing the context above if possible.
    `.trim();

    const perplexityRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: "You are a helpful financial research assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: 300,
      }),
    });

    if (!perplexityRes.ok) {
      throw new Error("Perplexity API error");
    }

    const perplexityData = await perplexityRes.json();
    const answer = perplexityData.choices?.[0]?.message?.content || "No answer found.";

    // Fetch images related to the question
    const searchQuery = extractKeywords(question, companyName);
    const images = await fetchImages(searchQuery);

    // Save the new response to Supabase
    const newResponse = {
      question,
      answer,
      images,
      timestamp: new Date().toISOString()
    };

    // Update the chat_responses in Supabase
    const existingResponses = existingData?.chat_responses || {};
    const updatedResponses = {
      ...existingResponses,
      [sectionTitle]: [
        ...(existingResponses[sectionTitle] || []),
        newResponse
      ]
    };

    await supabase
      .from("saved_research")
      .upsert({
        user_id: user.id,
        company_name: companyName.toLowerCase(),
        chat_responses: updatedResponses,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,company_name'
      });

    return NextResponse.json({ answer, images });
  } catch (error) {
    console.error("Error in section-help API:", error);
    return NextResponse.json(
      { error: "Failed to get answer from Perplexity." },
      { status: 500 }
    );
  }
}
