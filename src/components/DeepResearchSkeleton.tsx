import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, History, BarChart4, Package, Users, TrendingUp, Lightbulb } from "lucide-react"

export default function DeepResearchSkeleton() {
  return (
    <div className="space-y-8">
      {/* Image Gallery Skeleton */}
      <div className="w-full aspect-video rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Tabs Skeleton */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-7 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="financials" className="flex items-center gap-2">
            <BarChart4 className="w-4 h-4" />
            <span className="hidden sm:inline">Financials</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Products</span>
          </TabsTrigger>
          <TabsTrigger value="competitors" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Competitors</span>
          </TabsTrigger>
          <TabsTrigger value="swot" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">SWOT</span>
          </TabsTrigger>
          <TabsTrigger value="outlook" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Outlook</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
