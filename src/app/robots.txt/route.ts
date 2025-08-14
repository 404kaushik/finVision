import { NextResponse } from 'next/server'

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /api/
Disallow: /dashboard/
Disallow: /profile/
Disallow: /_next/
Disallow: /admin/

# Allow important pages for SEO
Allow: /
Allow: /about
Allow: /contact
Allow: /blog
Allow: /research
Allow: /learn
Allow: /market
Allow: /crypto
Allow: /privacy-policy
Allow: /terms-of-service
Allow: /disclaimer

# Sitemap location
Sitemap: https://finvision.app/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}