import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { blogPosts } from '@/data/blog-posts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, Clock, TrendingUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { HeaderAd, ContentAd, SidebarAd } from '@/components/AdSenseAd';
import { FinanceImageAd, InvestmentImageAd, TechStockImageAd } from '@/components/ImageAdSense';

// Generate metadata for SEO
export const metadata: Metadata = {
  title: 'NVIDIA, Tesla, and Apple: The 2024 Stock Market Titans Reshaping Investment Strategies | FinVision',
  description: 'Deep dive into the three most influential stocks of 2024 - analyzing NVIDIA\'s AI dominance, Tesla\'s robotaxi revolution, and Apple\'s resilience amid market volatility. Expert investment analysis and market insights.',
  keywords: [
    'NVIDIA stock analysis 2024',
    'Tesla robotaxi investment',
    'Apple stock forecast',
    'AI stocks 2024',
    'tech stock analysis',
    'investment strategy',
    'market analysis',
    'stock market titans',
    'technology stocks',
    'portfolio allocation',
    'NVDA stock',
    'TSLA stock',
    'AAPL stock',
    'semiconductor stocks',
    'electric vehicle stocks',
    'autonomous driving stocks'
  ],
  authors: [{ name: 'David Chen' }],
  creator: 'FinVision',
  publisher: 'FinVision',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'NVIDIA, Tesla, and Apple: The 2024 Stock Market Titans Reshaping Investment Strategies',
    description: 'Expert analysis of NVIDIA\'s AI dominance, Tesla\'s robotaxi revolution, and Apple\'s market resilience. Essential insights for modern investors.',
    url: 'https://finvision.com/blog/nvidia-tesla-apple-2024-stock-titans',
    siteName: 'FinVision',
    images: [
      {
        url: '/blog/tech-titans-2024.svg',
        width: 1200,
        height: 630,
        alt: 'NVIDIA, Tesla, and Apple Stock Analysis 2024',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NVIDIA, Tesla, and Apple: The 2024 Stock Market Titans',
    description: 'Expert analysis of the three most influential tech stocks reshaping investment strategies in 2024.',
    images: ['/blog/tech-titans-2024.svg'],
    creator: '@FinVisionApp',
  },
  alternates: {
    canonical: 'https://finvision.com/blog/nvidia-tesla-apple-2024-stock-titans',
  },
};

const blogPost = blogPosts.find(post => post.id === '8');

if (!blogPost) {
  notFound();
}

export default function BlogPostPage() {
  if (!blogPost) {
    notFound();
  }
  
  const relatedPosts = blogPosts.filter(post => 
    blogPost.relatedPosts.includes(parseInt(post.id))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Ad */}
      <HeaderAd />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back to Blog */}
        <Link 
          href="/blog" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-3">
            <Card className="overflow-hidden">
              <div className="relative h-64 md:h-80 bg-gradient-to-r from-blue-600 to-purple-600">
                {/* Add the main blog image */}
                <Image 
                  src="/algo.jpg" 
                  alt="Stock Market Analysis - NVIDIA, Tesla, Apple"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute bottom-6 left-6 right-6">
                  <Badge className="mb-4 bg-white/20 text-white border-white/30">
                    {blogPost.category}
                  </Badge>
                  <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">
                    {blogPost.title}
                  </h1>
                  <p className="text-white/90 text-lg mb-4">
                    {blogPost.excerpt}
                  </p>
                </div>
              </div>
              
              <CardContent className="p-6 md:p-8">
                {/* Author and Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={blogPost.author.avatar} alt={blogPost.author.name} />
                      <AvatarFallback>{blogPost.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{blogPost.author.name}</p>
                      <p className="text-sm text-gray-600">{blogPost.author.bio}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 ml-auto">
                    <div className="flex items-center gap-1">
                      <CalendarDays className="w-4 h-4" />
                      {blogPost.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {blogPost.readTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      Trending
                    </div>
                  </div>
                </div>

                {/* Content Ad with Image */}
                <FinanceImageAd />

                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  {blogPost.content.map((paragraph, index) => (
                    <div key={index}>
                      <p className="mb-6 text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                      {/* Add featured image after first paragraph */}
                      {index === 0 && (
                        <div className="my-8">
                          <div className="relative h-64 rounded-lg overflow-hidden">
                            <Image 
                              src="/algo.jpg" 
                              alt="Financial market analysis and algorithmic trading visualization"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <p className="text-sm text-gray-500 mt-2 text-center">
                            Advanced algorithmic analysis of NVIDIA, Tesla, and Apple stock performance
                          </p>
                        </div>
                      )}
                      {/* Insert image ads every 5 paragraphs */}
                      {(index + 1) % 5 === 0 && index < blogPost.content.length - 1 && (
                        <div className="my-8">
                          <TechStockImageAd />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Related Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {['NVIDIA', 'Tesla', 'Apple', 'AI Stocks', 'Tech Analysis', 'Investment Strategy', 'Market Trends', 'Portfolio Management'].map((tag) => (
                      <Badge key={tag} variant="secondary" className="hover:bg-blue-100 cursor-pointer">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <Badge className="mb-3">{post.category}</Badge>
                        <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{post.date}</span>
                          <span>{post.readTime}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Sidebar Ad with Image */}
              <InvestmentImageAd />
              
              {/* Newsletter Signup */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Stay Updated</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Get the latest market insights and investment analysis delivered to your inbox.
                  </p>
                  <div className="space-y-3">
                    <input 
                      type="email" 
                      placeholder="Enter your email" 
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                    <button className="w-full bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                      Subscribe
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Market Summary */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Market Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>NVIDIA (NVDA)</span>
                      <span className="text-green-600">+2.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tesla (TSLA)</span>
                      <span className="text-green-600">+1.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Apple (AAPL)</span>
                      <span className="text-red-600">-0.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>S&P 500</span>
                      <span className="text-green-600">+0.8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// Generate static params for this specific post
export function generateStaticParams() {
  return [{ slug: 'nvidia-tesla-apple-2024-stock-titans' }];
}