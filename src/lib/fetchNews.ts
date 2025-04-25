// src/lib/fetchNews.ts
export async function fetchStockNews(symbol: string) {
    const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    const url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=2024-01-01&to=2025-12-31&token=${API_KEY}`;
  
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch news");
    return res.json();
}
  