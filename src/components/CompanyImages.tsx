"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { motion } from "framer-motion"
import { ExternalLink, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

export default function CompanyImages({ images }: { images: { id: string; url: string; alt: string; link: string }[] }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!images?.length) return null

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div 
      className="w-[50rem] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {images.map((img) => (
        <motion.div key={img.id} variants={item} whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
          <Card className=" bg-background/50 backdrop-blur-sm border border-muted/30 rounded-xl overflow-hidden group">
            <div className="relative">
              <AspectRatio ratio={16 / 9}>
                <img 
                  src={img.url} 
                  alt={img.alt} 
                  className="object-cover w-full h-full" 
                />
              </AspectRatio>
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-all duration-300">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="rounded-full flex items-center gap-1"
                      onClick={() => setSelectedImage(img.url)}
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-1 border-none bg-transparent">
                    <AspectRatio ratio={16 / 9}>
                      <img 
                        src={img.url} 
                        alt={img.alt} 
                        className="object-contain w-full h-full rounded-lg" 
                      />
                    </AspectRatio>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-full flex items-center gap-1 bg-gray-700 border-white/70 text-white hover:text-white hover:bg-white/20"
                  asChild
                >
                  <a href={img.link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    <span>Source</span>
                  </a>
                </Button>
              </div>
            </div>
            
            <CardContent className="p-3 flex justify-between items-center">
              <p className="text-sm font-medium text-foreground">
                {img.alt || "Company image"}
              </p>
              
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-1 h-auto rounded-full"
                  >
                    <span className="sr-only">Image info</span>
                    <div className="h-1.5 w-1.5 bg-muted-foreground rounded-full" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent side="top" className="text-sm max-w-xs">
                  <div className="space-y-1.5">
                    <p className="font-medium">{img.alt}</p>
                    <p className="text-xs text-muted-foreground">
                      Source:{" "}
                      <a 
                        href={img.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="underline text-primary hover:text-primary/80 transition-colors"
                      >
                        Unsplash
                      </a>
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}