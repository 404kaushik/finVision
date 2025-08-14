"use client"

import { useEffect } from 'react'

interface AdSenseAdProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  fullWidthResponsive?: boolean
  className?: string
}

export default function AdSenseAd({ 
  adSlot, 
  adFormat = 'auto', 
  fullWidthResponsive = true,
  className = ''
}: AdSenseAdProps) {
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
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  )
}

// Predefined ad components for common placements
export function HeaderAd() {
  return (
    <AdSenseAd 
      adSlot="1234567890" 
      adFormat="horizontal"
      className="mb-4"
    />
  )
}

export function SidebarAd() {
  return (
    <AdSenseAd 
      adSlot="1234567891" 
      adFormat="vertical"
      className="sticky top-4"
    />
  )
}

export function ContentAd() {
  return (
    <AdSenseAd 
      adSlot="1234567892" 
      adFormat="rectangle"
      className="my-6 mx-auto"
    />
  )
}

export function FooterAd() {
  return (
    <AdSenseAd 
      adSlot="1234567893" 
      adFormat="horizontal"
      className="mt-4"
    />
  )
}