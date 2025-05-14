export interface ResearchData {
  overview?: string
  summary?: string
  metrics?: Array<{
    name: string
    score: number
    value: string
    emoji?: string
  }>
  analysis?: string
  outlook?: string
  risks?: string[]
  opportunities?: string[]
}

export interface FinancialData {
  marketData: Record<string, string>
  ratios: Record<string, string>
  financials: Record<string, string>
  profile: {
    industry: string
    sector: string
    exchange: string
    ipo: string
    logo: string | null
    weburl: string
    description: string
  }
}

export interface NewsItem {
  headline: string
  summary: string
  url: string
  datetime: string
  source: string
  image?: string
  sentiment?: {
    label: string
    emoji: string
  }
} 