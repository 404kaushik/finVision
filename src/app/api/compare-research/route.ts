// src/app/api/compare-research/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const company = searchParams.get('company')
  const userId = searchParams.get('userId')
  const investmentAmount = searchParams.get('investmentAmount') || '1000'

  if (!company || !userId) {
    return NextResponse.json({ error: 'Company and userId parameters are required' }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    // Get the saved research data
    const { data: savedResearch, error: researchError } = await supabase
      .from('saved_research')
      .select('created_research_at, created_deepresearch_at, research_data')
      .eq('user_id', userId)
      .eq('company_name', company.toLowerCase())
      .single()

    if (researchError) throw researchError
    if (!savedResearch) {
      return NextResponse.json({ error: 'No saved research found' }, { status: 404 })
    }

    // Get comparison analysis from Perplexity
    const prompt = `Analyze ${company}'s performance since ${new Date(savedResearch.created_research_at).toLocaleDateString()} to today's date. 
    If someone invested $${investmentAmount} from ${new Date(savedResearch.created_research_at).toLocaleDateString()} to today's date, what would their investment be worth now? 
    Explain this in simple terms for someone new to investing.

    IMPORTANT: Respond ONLY with a JSON object in this exact format:
    {
      "initialValue": number,
      "currentValue": number,
      "percentChange": number,
      "marketComparison": string,
      "explanation": string
    }`

    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful financial advisor who explains complex investment concepts in simple terms. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!perplexityResponse.ok) {
      throw new Error('Failed to get analysis from Perplexity')
    }

    const perplexityData = await perplexityResponse.json()
    let data
    try {
      data = JSON.parse(perplexityData.choices[0].message.content)
    } catch (error) {
      console.error('Failed to parse Perplexity response:', perplexityData.choices[0].message.content)
      throw new Error('Invalid response format from Perplexity')
    }

    return NextResponse.json({
      ...data,
      researchDate: savedResearch.created_research_at,
      deepResearchDate: savedResearch.created_deepresearch_at,
      investmentAmount: parseFloat(investmentAmount)
    })
  } catch (error) {
    console.error('Error in compare research API:', error)
    return NextResponse.json({ error: 'Failed to compare research' }, { status: 500 })
  }
}