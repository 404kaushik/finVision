import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSignIcon, PieChartIcon, FileTextIcon, BarChart2Icon, GlobeIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import CompanyChart from "@/components/CompanyChart"
import { financialTerms } from "@/lib/financial-terms"

interface FinancialsTabProps {
  financialData: any
  loading: boolean
  chartData: any
}

export function FinancialsTab({ financialData, loading, chartData }: FinancialsTabProps) {
  if (loading) {
    return <div className="flex items-center justify-center p-8"><Loader2Icon className="h-8 w-8 animate-spin" /></div>
  }

  if (!financialData) {
    return <div className="p-8 text-center text-gray-500">No financial data available</div>
  }

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSignIcon className="h-5 w-5" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(financialData.marketData).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <p className="text-sm text-gray-500">{key}</p>
                <p className="text-lg font-semibold">{String(value)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rest of the financials sections... */}
      {/* Copy the remaining sections from the original file */}
    </div>
  )
} 