import { Skeleton } from "@/components/ui/skeleton"
import Layout from "@/components/Layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

export default function BlogPostLoading() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-10 pb-20 md:pt-16 md:pb-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/blog" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
            
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
            
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-3/4 mb-6" />
            
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="h-5 w-32" />
              </div>
              
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            
            <Skeleton className="aspect-[2/1] rounded-xl w-full mb-10" />
          </div>
        </div>
      </section>
      
      {/* Article Content */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-8">
              <div className="space-y-6">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-4/5" />
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between mt-10 pt-6 border-t">
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
                
                <div className="flex items-center gap-1">
                  <Skeleton className="h-9 w-10 rounded-full" />
                  <Skeleton className="h-9 w-10 rounded-full" />
                  <Skeleton className="h-9 w-10 rounded-full" />
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-20">
                {/* Author Card */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-40 mb-4" />
                    <div className="flex items-center gap-4 mb-4">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
                
                {/* Related Posts */}
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-40 mb-4" />
                    <div className="space-y-4">
                      {Array(2).fill(0).map((_, i) => (
                        <div key={i}>
                          <Skeleton className="h-5 w-full mb-1" />
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-3 w-3" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* More Articles Section */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i} className="h-full overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-5 w-20 mb-3" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-6 w-4/5 mb-3" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Skeleton className="h-10 w-40 mx-auto" />
          </div>
        </div>
      </section>
    </Layout>
  )
}