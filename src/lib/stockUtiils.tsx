/**
 * Returns an appropriate emoji based on stock performance
 */
export function getPerformanceEmoji(changePercent: number | undefined): string {
    if (!changePercent) return "❓"
  
    if (changePercent >= 5) return "🚀" // Significant positive change
    if (changePercent >= 2) return "📈" // Moderate positive change
    if (changePercent >= 0.5) return "✅" // Small positive change
    if (changePercent > -0.5) return "😐" // Minimal change
    if (changePercent > -2) return "⚠️" // Small negative change
    if (changePercent > -5) return "📉" // Moderate negative change
    return "🔻" // Significant negative change
  }
  
  /**
   * Returns a description of the stock performance
   */
  export function getPerformanceDescription(changePercent: number | undefined): string {
    if (!changePercent) return "Unknown"
  
    if (changePercent >= 5) return "Excellent"
    if (changePercent >= 2) return "Strong"
    if (changePercent >= 0.5) return "Good"
    if (changePercent > -0.5) return "Stable"
    if (changePercent > -2) return "Slight decline"
    if (changePercent > -5) return "Weak"
    return "Poor"
  }
  