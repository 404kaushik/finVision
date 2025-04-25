import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { query } = await request.json()
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Get API key from environment variable
    const apiKey = process.env.PERPLEXITY_API_KEY
    
    if (!apiKey) {
      console.error('PERPLEXITY_API_KEY is not defined')
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      )
    }

    // Call Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful financial advisor specializing in investments, stocks, and personal finance. Provide accurate, educational responses about investment concepts, strategies, and market information. Focus on educational content rather than specific investment advice.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Perplexity API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to get response from Perplexity' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const answer = data.choices[0]?.message?.content || 'No answer found'

    return NextResponse.json({ answer })
  } catch (error) {
    console.error('Error in Perplexity API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// import { type NextRequest, NextResponse } from "next/server"
// import axios from "axios"

// const API_KEY = process.env.PERPLEXITY_API_KEY

// export async function POST(req: NextRequest) {
//   try {
//     const { query } = await req.json()

//     const response = await axios.post(
//       "https://api.perplexity.ai/chat/completions",
//       {
//         model: "sonar-pro",
//         messages: [
//           {
//             role: "system",
//             content: "You are a financial advisor helping users understand investing concepts in simple terms."
//           },
//           {
//             role: "user",
//             content: query
//           }
//         ],
//         temperature: 0.7,
//         max_tokens: 2000,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     )

//     return NextResponse.json({ answer: response.data.choices[0].message.content })
//   } catch (err: any) {
//     console.error("Error fetching response:", err.response?.data || err.message)
//     return NextResponse.json({ error: "Failed to fetch response" }, { status: 500 })
//   }
// }