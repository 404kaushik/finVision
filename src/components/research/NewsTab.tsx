import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NewspaperIcon, ExternalLinkIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NewsTabProps {
  companyName: string
  companyNews: any[]
  newsLoading: boolean
}

export function NewsTab({ companyName, companyNews, newsLoading }: NewsTabProps) {
  return (
    <div className="space-y-8 mt-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="overflow-hidden border">
          <CardHeader className="pb-3 bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <NewspaperIcon className="h-5 w-5 text-primary" />
              <span>Latest News</span>
            </CardTitle>
            <CardDescription>Recent news articles and events related to {companyName}</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {/* Rest of the news content... */}
            {/* Copy the remaining sections from the original file */}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 