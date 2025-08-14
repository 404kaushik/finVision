"use client"

import { useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ImageAdSenseProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  fullWidthResponsive?: boolean
  className?: string
  imageUrl?: string
  imageAlt?: string
  title?: string
  description?: string
}

export default function ImageAdSense({ 
  adSlot, 
  adFormat = 'auto', 
  fullWidthResponsive = true,
  className = '',
  imageUrl,
  imageAlt = 'Advertisement',
  title,
  description
}: ImageAdSenseProps) {
  useEffect(() => {
    try {
      // Check if adsbygoogle is available
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  return (
    <Card className={`adsense-image-container ${className}`}>
      <CardContent className="p-4">
        {imageUrl && (
          <div className="relative h-32 mb-4 rounded-lg overflow-hidden">
            <Image 
              src={imageUrl} 
              alt={imageAlt}
              fill
              className="object-cover"
            />
          </div>
        )}
        
        {title && (
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
        )}
        
        {description && (
          <p className="text-gray-600 text-sm mb-4">{description}</p>
        )}
        
        <Badge variant="secondary" className="mb-4">Sponsored</Badge>
        
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive={fullWidthResponsive.toString()}
        />
      </CardContent>
    </Card>
  )
}

// Predefined image ad components for common placements
export function FinanceImageAd() {
  return (
    <ImageAdSense 
      adSlot="1234567894" 
      adFormat="rectangle"
      className="mb-6"
      imageUrl="/algo.jpg"
      imageAlt="Financial Analysis Tools"
      title="Advanced Trading Tools"
      description="Discover professional-grade financial analysis and trading platforms."
    />
  )
}

export function InvestmentImageAd() {
  return (
    <ImageAdSense 
      adSlot="1234567895" 
      adFormat="vertical"
      className="sticky top-4"
      imageUrl="/algo.jpg"
      imageAlt="Investment Opportunities"
      title="Smart Investment Solutions"
      description="Explore cutting-edge investment strategies and portfolio management."
    />
  )
}

export function TechStockImageAd() {
  return (
    <ImageAdSense 
      adSlot="1234567896" 
      adFormat="horizontal"
      className="my-8"
      imageUrl="/algo.jpg"
      imageAlt="Tech Stock Analysis"
      title="Tech Stock Insights"
      description="Get expert analysis on the hottest technology stocks and market trends."
    />
  )
}