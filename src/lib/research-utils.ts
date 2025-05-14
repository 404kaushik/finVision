export const getSentimentEmoji = (sentiment: number): string => {
  if (sentiment >= 80) return "🚀"
  if (sentiment >= 60) return "😄"
  if (sentiment >= 40) return "🙂"
  if (sentiment >= 20) return "😐"
  if (sentiment >= 0) return "��"
  return "😨"
}

export const getPerformanceEmoji = (changePercent: number): string => {
  if (changePercent >= 5) return "🚀"
  if (changePercent >= 2) return "🔥"
  if (changePercent >= 0.5) return "📈"
  if (changePercent > 0) return "✅"
  if (changePercent > -0.5) return "⚠️"
  if (changePercent > -2) return "📉"
  if (changePercent > -5) return "❄️"
  return "💥"
}

export const getMetricExplanation = (metricName: string, score: number): string => {
  const goodScore = score > 60
  const averageScore = score > 40 && score <= 60

  switch (metricName) {
    case "Revenue Growth":
      return goodScore
        ? "The company is growing its sales at a healthy rate, which is positive."
        : averageScore
          ? "The company's sales are growing at an average pace compared to similar companies."
          : "The company's sales growth is slower than expected, which could be concerning."

    case "Profit Margin":
      return goodScore
        ? "For every dollar of sales, the company keeps a good amount as profit."
        : averageScore
          ? "The company's profit margin is average for its industry."
          : "The company keeps less profit from each sale than similar companies."

    case "Market Share":
      return goodScore
        ? "The company has a strong position in its market compared to competitors."
        : averageScore
          ? "The company has an average share of its market."
          : "The company has a smaller portion of the market than leading competitors."

    case "P/E Ratio":
      return goodScore
        ? "Investors are willing to pay a premium for the company's earnings, showing confidence."
        : averageScore
          ? "The stock is priced reasonably compared to the company's earnings."
          : "The stock may be undervalued compared to the company's earnings."

    case "Debt-to-Equity":
      return goodScore
        ? "The company has a healthy balance between debt and equity financing."
        : averageScore
          ? "The company has an average amount of debt for its industry."
          : "The company has more debt than ideal, which could be risky."

    default:
      return goodScore
        ? "This metric shows positive performance."
        : averageScore
          ? "This metric shows average performance."
          : "This metric shows below-average performance."
  }
}

export const getInvestmentSummary = (research: any): string => {
  // Count positive and negative metrics
  let positiveCount = 0
  let negativeCount = 0

  if (research.metrics && research.metrics.length > 0) {
    research.metrics.forEach((metric: any) => {
      if (metric.score > 60) positiveCount++
      else if (metric.score < 40) negativeCount++
    })
  }

  // Count risks and opportunities
  const risksCount = research.risks?.length || 0
  const opportunitiesCount = research.opportunities?.length || 0

  // Generate summary based on counts
  if (positiveCount > negativeCount && opportunitiesCount > risksCount) {
    return `Based on our analysis, ${research.companyName || "this company"} shows strong performance metrics and more opportunities than risks. Many investors would consider this a potentially attractive investment, though all investments carry risk.`
  } else if (positiveCount > negativeCount) {
    return `${research.companyName || "This company"} has several positive performance indicators, but also faces some significant risks. It might be worth considering as part of a diversified portfolio, but be aware of the potential challenges.`
  } else if (opportunitiesCount > risksCount) {
    return `While some current metrics for ${research.companyName || "this company"} are concerning, there appear to be good opportunities for future growth. This might be considered a higher-risk investment with potential for reward.`
  } else {
    return `Our analysis shows some concerns with ${research.companyName || "this company"}'s current performance and future outlook. More cautious investors might want to watch this stock for improvements before investing.`
  }
} 