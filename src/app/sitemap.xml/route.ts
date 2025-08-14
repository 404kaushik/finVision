import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://finvision.app' // Replace with your actual domain
  const currentDate = new Date().toISOString()

  const staticPages = [
    '',
    '/about',
    '/contact',
    '/blog',
    '/research',
    '/learn',
    '/market',
    '/crypto',
    '/beginner-research',
    '/privacy-policy',
    '/terms-of-service',
    '/disclaimer'
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page === '' ? 'daily' : page === '/blog' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${page === '' ? '1.0' : page === '/blog' || page === '/research' ? '0.8' : '0.6'}</priority>
  </url>`
  )
  .join('')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}