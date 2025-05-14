import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileTextIcon, BarChart2Icon, LightbulbIcon, AlertTriangleIcon, StarIcon, ZapIcon, DollarSignIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { getSentimentEmoji, getMetricExplanation, getInvestmentSummary } from "@/lib/research-utils"

interface OverviewTabProps {
  research: any
  companyName: string
  overviewRef: any
  metricsRef: any
  analysisRef: any
  overviewInView: boolean
  metricsInView: boolean
  analysisInView: boolean
}

export function OverviewTab({ 
  research, 
  companyName, 
  overviewRef, 
  metricsRef, 
  analysisRef, 
  overviewInView, 
  metricsInView, 
  analysisInView 
}: OverviewTabProps) {
  return (
    <div className="space-y-8 mt-6">
      {/* Overview Section */}
      <div ref={overviewRef}>
        <AnimatePresence>
          {overviewInView && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="overflow-hidden border">
                <CardHeader className="pb-3 bg-muted/30">
                  <CardTitle className="flex items-center gap-2">
                    <FileTextIcon className="h-5 w-5 text-primary" />
                    <span>What is {companyName}?</span>
                  </CardTitle>
                  <CardDescription>A simple explanation of what this company does</CardDescription>
                </CardHeader>
                <CardContent className="p-2">
                  <p className="leading-relaxed text-lg">
                    {research.overview || research.summary || "No overview available"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rest of the overview sections... */}
      {/* Copy the remaining sections from the original file */}
    </div>
  )
} 