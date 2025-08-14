"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Layout from "@/components/Layout"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeftIcon, CalendarIcon, ClockIcon, ShareIcon, BookmarkIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react"
import Link from "next/link"
import { blogPosts, getBlogPostById, getRelatedPosts, type BlogPost } from "@/data/blog-posts"

interface BlogInteractions {
  isBookmarked: boolean;
  userReaction: string | null;
  shareCount: number;
}

// Sample blog post data for compatibility
const MOCK_BLOG_POSTS_FOR_COMPATIBILITY = [
  {
    id: "1",
    title: "The Rise of AI in Stock Market Analysis",
    excerpt: "How artificial intelligence is revolutionizing the way investors analyze market trends and make decisions.",
    content: [
      "Artificial intelligence is transforming the landscape of stock market analysis, offering unprecedented capabilities to process vast amounts of data and identify patterns that would be impossible for human analysts to detect. This technological revolution is changing how investors approach market research, risk assessment, and decision-making processes.",
      "Machine learning algorithms can now analyze thousands of financial statements, news articles, social media sentiment, and market indicators simultaneously, providing insights that were previously unattainable. These AI systems can identify correlations between seemingly unrelated events and market movements, helping investors anticipate market shifts before they occur.",
      "One of the most significant advantages of AI in stock analysis is its ability to remove emotional bias from investment decisions. Human investors often fall prey to psychological traps like confirmation bias or loss aversion, leading to suboptimal decisions. AI systems, operating on pure data and algorithms, can maintain objectivity even in volatile market conditions.",
      "Natural Language Processing (NLP) capabilities allow AI to scan and interpret news, earnings calls transcripts, and social media in real-time, gauging market sentiment with remarkable accuracy. This enables investors to react quickly to developing situations that might impact stock prices.",
      "Quantitative hedge funds have been at the forefront of adopting AI technologies, using sophisticated algorithms to execute high-frequency trading strategies. These funds can analyze market conditions and execute trades in milliseconds, far faster than any human trader could manage.",
      "However, the rise of AI in stock market analysis is not without challenges. The 'black box' nature of some machine learning algorithms makes it difficult to understand exactly how they arrive at their conclusions, raising concerns about transparency and accountability. Additionally, as more investors adopt similar AI tools, the advantage gained from these technologies may diminish over time.",
      "Despite these challenges, the integration of AI into stock market analysis continues to accelerate. From retail investing platforms offering AI-powered insights to institutional investors developing proprietary algorithms, artificial intelligence is becoming an essential tool for navigating today's complex financial markets.",
      "As AI technology continues to evolve, we can expect even more sophisticated applications in stock market analysis. Investors who embrace these tools while maintaining a critical understanding of their limitations will likely have a significant advantage in the markets of tomorrow."
    ],
    date: "May 15, 2023",
    readTime: "5 min read",
    category: "Technology",
    image: "/public/blog/ai-stocks.svg",
    trend: "up",
    author: {
      name: "Alex Morgan",
      avatar: "/blog/avatar1.svg",
      bio: "Financial technology analyst with over 10 years of experience in the intersection of AI and financial markets."
    },
    relatedPosts: [2, 6]
  },
  {
    id: "2",
    title: "Understanding Market Volatility in 2023",
    excerpt: "A deep dive into the factors causing increased market volatility this year and strategies to navigate uncertain times.",
    content: [
      "Market volatility has reached notable levels in 2023, driven by a complex interplay of economic factors, geopolitical tensions, and shifting monetary policies. Understanding the root causes of this volatility is essential for investors seeking to navigate these turbulent market conditions effectively.",
      "One of the primary drivers of market volatility this year has been the persistent inflation concerns and the corresponding central bank responses. As central banks around the world continue their tightening cycles, markets have reacted strongly to each new data point and policy announcement, creating significant price swings across asset classes.",
      "Geopolitical tensions have added another layer of uncertainty to markets. Ongoing conflicts, trade disputes, and shifting international alliances have created unpredictable market environments where sentiment can shift rapidly based on headlines and diplomatic developments.",
      "The banking sector has experienced particular stress in 2023, with several high-profile bank failures raising concerns about systemic stability. These events have triggered volatility spikes as investors reassess risk exposures across the financial system.",
      "Energy market disruptions have continued to impact overall market stability. Fluctuations in oil and natural gas prices, driven by supply constraints and geopolitical factors, have cascading effects throughout the economy and financial markets.",
      "In this environment of heightened volatility, investors have been adapting their strategies to protect portfolios while still pursuing growth opportunities. Diversification across asset classes, sectors, and geographies has become even more critical as correlations between traditionally separate investments have shifted.",
      "Defensive positioning has gained popularity, with increased allocations to value stocks, dividend-paying companies, and sectors with more stable earnings profiles. These investments tend to weather volatility better than high-growth, speculative assets.",
      "Options strategies have seen increased adoption as investors look to hedge downside risks while maintaining upside exposure. Covered calls, protective puts, and collar strategies can help manage volatility while generating income or limiting potential losses.",
      "Looking ahead, market volatility is likely to persist through the remainder of 2023 as economic uncertainties continue to resolve. Investors who maintain disciplined approaches, focus on quality investments, and employ thoughtful risk management techniques will be best positioned to navigate this challenging landscape."
    ],
    date: "June 2, 2023",
    readTime: "7 min read",
    category: "Market Analysis",
    image: "/blog/volatility.svg",
    trend: "down",
    author: {
      name: "Sarah Chen",
      avatar: "/blog/avatar2.svg",
      bio: "Market strategist specializing in volatility analysis and risk management for institutional investors."
    },
    relatedPosts: [5, 1]
  },
  {
    id: "3",
    title: "ESG Investing: The New Frontier",
    excerpt: "How environmental, social, and governance factors are becoming crucial in investment decisions and portfolio management.",
    content: [
      "Environmental, Social, and Governance (ESG) investing has evolved from a niche approach to a fundamental consideration in modern portfolio management. This transformation represents a significant shift in how investors evaluate companies, assess risks, and allocate capital in today's complex market environment.",
      "The environmental component of ESG focuses on a company's impact on the natural world, including its carbon footprint, resource usage, pollution levels, and conservation efforts. As climate change concerns intensify, investors are increasingly scrutinizing companies' environmental practices and their strategies for transitioning to a low-carbon economy.",
      "Social factors examine how companies manage relationships with employees, suppliers, customers, and communities. This includes labor practices, diversity and inclusion initiatives, product safety, data privacy, and community engagement. Companies with strong social performance often demonstrate better employee retention, customer loyalty, and community support.",
      "Governance considerations address a company's leadership structure, executive compensation, audit practices, shareholder rights, and corporate ethics. Strong governance frameworks help prevent scandals, reduce legal risks, and align management incentives with long-term shareholder interests.",
      "The growth of ESG investing has been driven by multiple factors. Mounting evidence suggests that companies with strong ESG profiles often deliver competitive financial returns while exhibiting lower volatility. This challenges the traditional notion that ESG investing necessarily involves a performance sacrifice.",
      "Regulatory developments have accelerated ESG adoption, with many jurisdictions implementing mandatory ESG disclosure requirements and sustainable finance taxonomies. These regulatory frameworks are creating more standardized, comparable ESG data, addressing one of the historical challenges in this investment approach.",
      "Technological advancements have improved ESG data collection, analysis, and reporting capabilities. Artificial intelligence, satellite imagery, and blockchain technology are enabling more accurate, real-time assessment of companies' ESG performance beyond what is self-reported in sustainability reports.",
      "Looking forward, ESG investing is likely to become even more sophisticated and nuanced. The current trend is moving beyond simple exclusionary screening toward impact measurement, thematic investing, and active engagement with companies to drive positive change.",
      "For investors considering ESG integration, it's important to clarify objectives, understand different methodological approaches, and recognize that ESG factors should complement rather than replace fundamental financial analysis. When implemented thoughtfully, ESG investing offers the potential to generate sustainable long-term returns while contributing to positive environmental and social outcomes."
    ],
    date: "June 10, 2023",
    readTime: "6 min read",
    category: "Sustainable Investing",
    image: "/blog/esg.svg",
    trend: "up",
    author: {
      name: "Michael Johnson",
      avatar: "/blog/avatar3.svg",
      bio: "Sustainable finance expert advising institutional investors on ESG integration and impact measurement."
    },
    relatedPosts: [6, 4]
  },
  {
    id: "4",
    title: "Cryptocurrency vs Traditional Stocks: A Comparison",
    excerpt: "Analyzing the differences, risks, and potential returns between investing in cryptocurrencies and traditional stock markets.",
    content: [
      "The investment landscape has been transformed by the emergence of cryptocurrencies as an asset class, creating new opportunities and challenges for investors accustomed to traditional stock markets. Understanding the fundamental differences between these investment vehicles is essential for building a balanced portfolio strategy in today's diverse financial ecosystem.",
      "Traditional stocks represent ownership in established companies with tangible assets, revenue streams, and regulatory oversight. These investments typically derive their value from the company's financial performance, growth prospects, and dividend distributions. The stock market has centuries of historical data, well-established valuation methods, and regulatory frameworks designed to protect investors.",
      "Cryptocurrencies, by contrast, represent a relatively new asset class built on blockchain technology. Bitcoin, the first and largest cryptocurrency, was created just over a decade ago. These digital assets derive value from various factors including technological utility, network effects, scarcity mechanisms, and market sentiment. The regulatory environment for cryptocurrencies remains evolving and inconsistent across jurisdictions.",
      "Risk profiles differ significantly between these investment types. Traditional stocks typically exhibit lower volatility than cryptocurrencies, with major indices historically returning 7-10% annually over long time horizons. Market movements are generally tied to economic indicators, corporate earnings, and policy decisions that follow somewhat predictable patterns.",
      "Cryptocurrency markets are characterized by extreme volatility, with price swings of 10-20% in a single day not uncommon. This volatility creates opportunities for substantial returns but also significant downside risk. Bitcoin has delivered exceptional returns since inception but with multiple drawdowns exceeding 70% along the way.",
      "Liquidity considerations also differ between these markets. Major stock exchanges operate during defined trading hours with circuit breakers to prevent extreme price movements. Cryptocurrency markets operate 24/7 globally, with varying levels of liquidity across different exchanges and trading pairs.",
      "Portfolio allocation strategies should reflect these fundamental differences. Many financial advisors suggest limiting cryptocurrency exposure to a small percentage of an overall portfolio (typically 1-5% for most investors), while maintaining a larger allocation to traditional stocks and other established asset classes.",
      "Diversification within each asset class is equally important. Within traditional stocks, this means spreading investments across sectors, geographies, and company sizes. Within cryptocurrencies, investors might consider allocating across different blockchain ecosystems, use cases, and token types.",
      "As these markets continue to evolve, the boundaries between traditional finance and cryptocurrency ecosystems are increasingly blurring. Traditional financial institutions are developing cryptocurrency offerings, while blockchain technology is being integrated into traditional market infrastructure. This convergence may eventually lead to more hybrid investment opportunities that combine elements of both worlds."
    ],
    date: "June 18, 2023",
    readTime: "8 min read",
    category: "Crypto",
    image: "/blog/crypto-stocks.svg",
    trend: "up",
    author: {
      name: "Lisa Wong",
      avatar: "/blog/avatar4.svg",
      bio: "Cryptocurrency analyst and traditional market investor with expertise in cross-asset portfolio construction."
    },
    relatedPosts: [3, 6]
  },
  {
    id: "5",
    title: "The Impact of Federal Reserve Decisions on Stock Markets",
    excerpt: "Understanding how Federal Reserve policy changes affect market dynamics and investment strategies.",
    content: [
      "The Federal Reserve's monetary policy decisions rank among the most influential factors driving stock market performance. As the central bank of the United States, the Fed's actions ripple through financial markets globally, affecting everything from equity valuations to sector rotations and investment strategies.",
      "Interest rate decisions form the cornerstone of the Fed's influence on markets. When the Federal Reserve raises interest rates, borrowing costs increase throughout the economy. This typically pressures stock valuations, particularly for growth companies whose value derives largely from projected future earnings. Conversely, rate cuts generally support higher equity valuations by reducing the discount rate applied to future cash flows.",
      "Beyond the headline interest rate, the Fed's balance sheet policies have become increasingly important to market dynamics. Quantitative easing (QE) programs, where the Fed purchases assets like Treasury securities and mortgage-backed securities, inject liquidity into financial markets and have historically supported higher asset prices. Quantitative tightening (QT), the reduction of these holdings, typically creates more challenging conditions for risk assets.",
      "The Fed's forward guidance—communications about the likely future path of monetary policy—can trigger significant market reactions even without immediate policy changes. Subtle shifts in language regarding economic outlook, inflation expectations, or policy intentions are closely scrutinized by market participants for clues about future actions.",
      "Different market sectors respond distinctively to Fed policy shifts. Financial stocks, particularly banks, often benefit from rising interest rates as their net interest margins expand. Conversely, utilities, real estate, and consumer staples—sectors prized for their dividend yields—frequently underperform in rising rate environments as their yields become relatively less attractive compared to fixed income alternatives.",
      "The timing of investment decisions relative to the Fed's policy cycle can significantly impact returns. Historically, stocks have often performed well in the early stages of a tightening cycle as rate increases typically coincide with economic strength. However, as tightening progresses, economic growth may slow and market returns typically moderate.",
      "Market volatility tends to increase around key Fed events such as Federal Open Market Committee (FOMC) meetings and the release of meeting minutes. This volatility creates both risks and opportunities for investors, with options strategies and sector rotation approaches often employed to navigate these periods.",
      "The relationship between Fed policy and market performance is not static but evolves over time. The unprecedented monetary interventions following the 2008 financial crisis and the 2020 pandemic have potentially altered traditional market responses to Fed actions, creating new dynamics that investors must adapt to.",
      "For long-term investors, understanding the Fed's influence on markets is crucial, but attempting to time investments precisely around Fed decisions remains challenging. A diversified approach that considers Fed policy as one of many factors affecting long-term returns typically proves more successful than strategies overly dependent on predicting central bank actions."
    ],
    date: "June 25, 2023",
    readTime: "6 min read",
    category: "Economy",
    image: "/blog/fed-stocks.svg",
    trend: "down",
    author: {
      name: "David Park",
      avatar: "/blog/avatar5.svg",
      bio: "Former central bank economist specializing in monetary policy analysis and its impact on financial markets."
    },
    relatedPosts: [2, 6]
  },
  {
    id: "6",
    title: "Tech Stocks: Bubble or Sustainable Growth?",
    excerpt: "Examining the current valuation of technology stocks and whether we're witnessing a bubble or sustainable market growth.",
    content: [
      "The technology sector has delivered extraordinary returns over the past decade, raising persistent questions about whether current valuations represent a speculative bubble or reflect sustainable long-term growth potential. This debate has intensified as tech companies command an increasingly dominant position in major market indices and the broader economy.",
      "Historical comparisons with previous tech bubbles, particularly the dot-com era of the late 1990s, reveal both similarities and important differences. Like the dot-com period, today's market features tremendous enthusiasm for technological innovation and disruptive business models. However, unlike that era, many of today's leading tech companies generate substantial profits and cash flows rather than merely promising future returns.",
      "Valuation metrics for the technology sector have reached elevated levels by historical standards. Price-to-earnings ratios, especially for high-growth software and semiconductor companies, significantly exceed long-term averages. These premium valuations reflect expectations for continued strong growth but leave little margin for error if companies fail to meet lofty projections.",
      "The concentration of market capitalization in a handful of mega-cap tech companies presents both opportunities and risks for investors. These companies benefit from powerful competitive advantages including network effects, economies of scale, and data advantages. However, their size also makes them targets for regulatory scrutiny and potentially limits their future growth rates compared to their earlier years.",
      "Technological innovation continues to accelerate across multiple domains including artificial intelligence, cloud computing, semiconductors, and enterprise software. These innovations are creating genuine productivity improvements and new market opportunities that support the case for sustainable growth rather than purely speculative valuation.",
      "The pandemic accelerated digital transformation across virtually every industry, pulling forward years of technology adoption into months. This acceleration created a surge in demand for technology products and services that may normalize in the post-pandemic environment, potentially creating headwinds for companies that benefited most directly from these trends.",
      "Interest rate environments significantly impact technology stock valuations. The low interest rate environment of recent years supported higher valuations for growth stocks by reducing the discount rate applied to future earnings. As interest rates rise, this mathematical relationship puts pressure on valuations, particularly for companies whose profits lie furthest in the future.",
      "Sector rotation within technology has become increasingly important as different segments experience varying growth rates and valuation pressures. While some areas may exhibit bubble-like characteristics, others may offer reasonable or even attractive valuations relative to their growth prospects.",
      "For investors navigating this complex landscape, a nuanced approach is essential. Rather than making binary judgments about whether the entire sector is a bubble or not, focusing on individual companies' competitive positions, growth sustainability, and valuation relative to realistic future scenarios offers a more productive framework for investment decisions in this dynamic sector."
    ],
    date: "July 5, 2023",
    readTime: "7 min read",
    category: "Technology",
    image: "/blog/tech-stocks.svg",
    trend: "up",
    author: {
      name: "Emma Rodriguez",
      avatar: "/blog/avatar6.svg",
      bio: "Technology sector analyst covering software, semiconductors, and emerging tech trends for institutional investors."
    },
    relatedPosts: [1, 5]
  },
  {
    id: "7",
    title: "The Future of Algorithmic Trading in Retail Investing",
    excerpt: "How advanced algorithms and machine learning are democratizing trading strategies once reserved for institutional investors.",
    content: [
      "Algorithmic trading, once the exclusive domain of sophisticated institutional investors, is rapidly becoming accessible to retail investors through innovative platforms and technologies. This democratization is fundamentally changing how individual investors interact with financial markets and construct their trading strategies.",
      "The evolution of retail algorithmic trading has been driven by several converging factors. Advances in cloud computing have dramatically reduced the computational costs associated with running complex trading algorithms. Meanwhile, commission-free trading platforms have eliminated transaction cost barriers, making high-frequency strategies viable for smaller portfolios.",
      "Modern algorithmic trading platforms designed for retail investors offer varying levels of complexity and customization. Some provide pre-built strategies that can be deployed with minimal technical knowledge, while others offer visual programming interfaces that allow users to construct custom algorithms without extensive coding experience. The most advanced platforms provide full programming environments for experienced developers to create sophisticated trading systems.",
      "Machine learning approaches are increasingly integrated into retail trading algorithms. These systems can analyze vast datasets to identify patterns and relationships that might escape human observation. Natural language processing algorithms can interpret news, social media sentiment, and corporate disclosures to generate trading signals based on information beyond price and volume data.",
      "Risk management remains a critical consideration in algorithmic trading. Retail platforms are incorporating sophisticated risk controls including position sizing rules, stop-loss mechanisms, and portfolio-level risk metrics. These safeguards are essential for preventing catastrophic losses that can result from algorithmic errors or unexpected market conditions.",
      "Backtesting capabilities have become more sophisticated and accessible, allowing retail investors to evaluate algorithmic strategies against historical data before deploying real capital. However, the limitations of backtesting—including overfitting risks and the inability to account for how algorithms might impact markets when widely adopted—remain important considerations.",
      "Regulatory frameworks are evolving to address the growing prevalence of algorithmic trading among retail investors. Questions around market stability, fairness, and investor protection are prompting regulators to consider new approaches to oversight in this rapidly changing landscape.",
      "The social dimension of algorithmic trading has emerged as retail investors share strategies, collaborate on development, and even copy each other's algorithms through various platforms. This community aspect represents a significant departure from the secretive approach traditionally associated with quantitative trading.",
      "Looking ahead, the continued democratization of algorithmic trading is likely to influence market structure, potentially increasing efficiency while also introducing new forms of volatility. For retail investors, the key challenge will be developing the knowledge and discipline to effectively leverage these powerful tools while avoiding their potential pitfalls."
    ],
    date: "July 10, 2023",
    readTime: "10 min read",
    category: "Technology",
    image: "/algo.jpg",
    trend: "up",
    author: {
      name: "James Wilson",
      avatar: "/blog/avatar7.svg",
      bio: "Quantitative trading expert with experience developing algorithms for both institutional and retail trading platforms."
    },
    relatedPosts: [1, 6]
  }
];

export default function BlogPost() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [interactions, setInteractions] = useState<BlogInteractions>({
    isBookmarked: false,
    userReaction: null,
    shareCount: 0
  });
  
  useEffect(() => {
     if (params.id) {
       // Find the post with the matching ID
       const foundPost = getBlogPostById(params.id as string);
       setPost(foundPost || null);
       
       // Get related posts
       if (foundPost) {
         const related = getRelatedPosts(foundPost.id);
         setRelatedPosts(related);
       }
       
       // Load user interactions (in a real app, this would come from an API)
       setInteractions({
         isBookmarked: false,
         userReaction: null,
         shareCount: Math.floor(Math.random() * 100) + 10
       });
     }
   }, [params.id]);
  
  const handleBookmark = () => {
    setInteractions(prev => ({
      ...prev,
      isBookmarked: !prev.isBookmarked
    }));
  };
  
  const handleReaction = (reaction: string) => {
    setInteractions(prev => ({
      ...prev,
      userReaction: prev.userReaction === reaction ? null : reaction
    }));
  };
  
  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      setInteractions(prev => ({
        ...prev,
        shareCount: prev.shareCount + 1
      }));
    }
  };
  
  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Post not found</h1>
            <Link href="/blog">
              <Button>
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
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
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {post.category}
              </Badge>
              {post.trend === "up" ? (
                <Badge variant="default">
                  <TrendingUpIcon className="mr-1 h-3 w-3" />
                  Bullish
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <TrendingDownIcon className="mr-1 h-3 w-3" />
                  Bearish
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">{post.author.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                </div>
                <div>
                  <p className="font-medium">{post.author.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
            
            <div className="relative aspect-[2/1] rounded-xl overflow-hidden mb-10 border border-border">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/5 mix-blend-overlay z-10" />
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <div className="w-full h-full flex items-center justify-center">
                  {post.trend === "up" ? (
                    <TrendingUpIcon className="h-20 w-20 text-primary/40" />
                  ) : (
                    <TrendingDownIcon className="h-20 w-20 text-destructive/40" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Article Content */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-8">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {post.content.map((paragraph: string, index: number) => (
                  <motion.p 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="mb-6"
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>
              
              <div className="flex items-center justify-between mt-10 pt-6 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <ShareIcon className="mr-2 h-4 w-4" />
                    Share ({interactions.shareCount})
                  </Button>
                  <Button 
                    variant={interactions.isBookmarked ? "default" : "outline"} 
                    size="sm"
                    onClick={handleBookmark}
                  >
                    <BookmarkIcon className="mr-2 h-4 w-4" />
                    {interactions.isBookmarked ? "Saved" : "Save"}
                  </Button>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button 
                    variant={interactions.userReaction === "like" ? "default" : "ghost"} 
                    size="sm" 
                    className="rounded-full px-3"
                    onClick={() => handleReaction("like")}
                  >
                    👍
                  </Button>
                  <Button 
                    variant={interactions.userReaction === "fire" ? "default" : "ghost"} 
                    size="sm" 
                    className="rounded-full px-3"
                    onClick={() => handleReaction("fire")}
                  >
                    🔥
                  </Button>
                  <Button 
                    variant={interactions.userReaction === "idea" ? "default" : "ghost"} 
                    size="sm" 
                    className="rounded-full px-3"
                    onClick={() => handleReaction("idea")}
                  >
                    💡
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-20">
                {/* Author Card */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">About the Author</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-xl font-medium">{post.author.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-lg">{post.author.name}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{post.author.bio}</p>
                  </CardContent>
                </Card>
                
                {/* Related Posts */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
                    <div className="space-y-4">
                      {relatedPosts.map((relatedPost) => (
                        <div key={relatedPost.id} className="group">
                          <Link href={`/blog/${relatedPost.id}`} className="block">
                            <h4 className="font-medium group-hover:text-primary transition-colors">{relatedPost.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <CalendarIcon className="h-3 w-3" />
                              <span>{relatedPost.date}</span>
                            </div>
                          </Link>
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
            <h2 className="text-3xl font-bold mb-4">More Articles You Might Like</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Continue exploring our latest insights and analysis
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {MOCK_BLOG_POSTS_FOR_COMPATIBILITY
              .filter(p => p.id !== post.id && !post.relatedPosts.includes(parseInt(p.id)))
              .slice(0, 3)
              .map((post) => (
                <motion.div 
                  key={post.id}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className="h-full overflow-hidden border-border hover:border-primary/20 transition-colors">
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {post.trend === "up" ? (
                          <TrendingUpIcon className="h-12 w-12 text-primary/30" />
                        ) : (
                          <TrendingDownIcon className="h-12 w-12 text-destructive/30" />
                        )}
                      </div>
                      <div className="absolute top-3 right-3 z-10">
                        <Badge variant={post.trend === "up" ? "default" : "destructive"}>
                          {post.trend === "up" ? "Bullish" : "Bearish"}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <Badge variant="outline" className="mb-3">{post.category}</Badge>
                      <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                        <Link href={`/blog/${post.id}`}>{post.title}</Link>
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-medium">{post.author.name.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium">{post.author.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{post.date}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/blog">
              <Button size="lg" variant="outline">
                View All Articles
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}