"use client"

import { useEffect, useRef, useState } from "react"
import Layout from "@/components/Layout"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon, CalendarIcon, ClockIcon, TrendingUpIcon, TrendingDownIcon, BarChart2Icon, BookmarkIcon, ShareIcon, HeartIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { blogPosts, featuredPost, type BlogPost } from "@/data/blog-posts"
import { HeaderAd, ContentAd, SidebarAd } from "@/components/AdSenseAd"

interface BlogInteractions {
  bookmarked: Set<string>;
  liked: Set<string>;
  shareStats: Record<string, number>;
}



export default function BlogPage() {
  const { scrollY } = useScroll();
  const featuredRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(featuredRef, { once: true, amount: 0.2 });
  
  // State management
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [interactions, setInteractions] = useState<BlogInteractions>({
    bookmarked: new Set(),
    liked: new Set(),
    shareStats: {}
  });
  const [email, setEmail] = useState('');
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState('');
  
  // Parallax effect for hero section
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);
  
  // Categories and filtering
  const categories = ['All', ...Array.from(new Set(blogPosts.map(post => post.category)))];
  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);
  
  // Load initial interaction states
  useEffect(() => {
    const loadInteractions = async () => {
      try {
        // Load bookmarks
        const bookmarkResponse = await fetch('/api/blog/bookmark');
        if (bookmarkResponse.ok) {
          const bookmarkData = await bookmarkResponse.json();
          const bookmarkedIds = new Set<string>(bookmarkData.bookmarks.map((b: any) => b.postId as string));
          
          setInteractions(prev => ({
            ...prev,
            bookmarked: bookmarkedIds
          }));
        }

        // Load reactions for each post
        const reactionPromises = blogPosts.map(async (post) => {
          const response = await fetch(`/api/blog/reactions?postId=${post.id}`);
          if (response.ok) {
            const data = await response.json();
            return { postId: post.id, userReaction: data.userReaction };
          }
          return null;
        });

        const reactionResults = await Promise.all(reactionPromises);
        const likedIds = new Set<string>(
          reactionResults
            .filter(result => result && result.userReaction === 'like')
            .map(result => result!.postId)
        );

        setInteractions(prev => ({
          ...prev,
          liked: likedIds
        }));
      } catch (error) {
        console.error('Failed to load interactions:', error);
      }
    };

    loadInteractions();
  }, []);

  const handleBookmark = async (postId: string) => {
    try {
      const isCurrentlyBookmarked = interactions.bookmarked.has(postId);
      const action = isCurrentlyBookmarked ? 'remove' : 'add';
      
      const response = await fetch('/api/blog/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action })
      });

      if (response.ok) {
        setInteractions(prev => {
          const newBookmarked = new Set(prev.bookmarked);
          if (isCurrentlyBookmarked) {
            newBookmarked.delete(postId);
          } else {
            newBookmarked.add(postId);
          }
          return { ...prev, bookmarked: newBookmarked };
        });
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const isCurrentlyLiked = interactions.liked.has(postId);
      const action = isCurrentlyLiked ? 'remove' : 'add';
      
      const response = await fetch('/api/blog/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, type: 'like', action })
      });

      if (response.ok) {
        setInteractions(prev => {
          const newLiked = new Set(prev.liked);
          if (isCurrentlyLiked) {
            newLiked.delete(postId);
          } else {
            newLiked.add(postId);
          }
          return { ...prev, liked: newLiked };
        });
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleShare = async (post: BlogPost) => {
    const url = `${window.location.origin}/blog/${post.id}`;
    
    try {
      // Record the share
      await fetch('/api/blog/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          postId: post.id, 
          platform: 'copy',
          url 
        })
      });

      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share:', error);
      // Fallback: just copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Failed to copy to clipboard:', clipboardError);
      }
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingNewsletter(true);
    setNewsletterMessage('');

    try {
      const response = await fetch('/api/blog/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (response.ok) {
        setEmail('');
        setNewsletterMessage('Thank you for subscribing to our newsletter!');
      } else {
        setNewsletterMessage(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      setNewsletterMessage('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmittingNewsletter(false);
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 },
    },
  };

  return (
    <Layout>
      {/* Header Ad */}
      <HeaderAd />
      
      {/* Hero Section with Parallax */}
      <section className="relative overflow-hidden py-20 md:py-28 ">
        <motion.div 
          style={{ y, opacity }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full" />
          <div className="absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full" />
        </motion.div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              Financial Insights
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Latest Stock Market <span className="text-primary">Trends & Analysis</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Expert insights, market analysis, and investment strategies to help you make informed decisions.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="group">
                Latest Articles
                <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                Subscribe to Updates
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Content Ad */}
      <div className="py-8">
        <ContentAd />
      </div>
      
      {/* Featured Article with Parallax */}
      <section ref={featuredRef} className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-8 items-center"
          >
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4" />
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border">
                <div className="absolute inset-0" />
                <div className="w-full h-full flex items-center justify-center">
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    className="object-cover shadow-2xl"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                Featured Article
              </Badge>
              <h2 className="text-3xl font-bold mb-4">{featuredPost.title}</h2>
              <div className="">
                <p className="text-muted-foreground mb-6 truncate">{featuredPost.content}</p>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{featuredPost.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ClockIcon className="h-4 w-4" />
                  <span>{featuredPost.readTime}</span>
                </div>
                <Badge variant="outline">{featuredPost.category}</Badge>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs font-medium">JW</span>
                </div>
                <span className="text-sm font-medium">{featuredPost.author.name}</span>
              </div>
              <Link href="/blog/7">
                <Button className="group">
                  Read Full Article
                  <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Latest Articles Grid with Animation */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants} className="inline-block">
              <div className="w-12 h-1 bg-primary mx-auto mb-6"></div>
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4">
              Latest Market Insights
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay informed with our expert analysis and market trends
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {blogPosts.map((post) => (
              <motion.div 
                key={post.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full overflow-hidden border-border hover:border-primary/20 transition-colors">
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image
                      src={post.image}     // ✅ Change from featuredPost.image to post.image
                      alt={post.title}     // ✅ Change from featuredPost.title to post.title
                      fill
                      className="object-cover shadow-2xl transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                      />
                    </div>
                    <div className="absolute top-3 right-3 z-10">
                      <Badge variant={post.trend === "up" ? "default" : "destructive"}>
                        {post.trend === "up" ? "Bullish" : "Bearish"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">{post.category}</Badge>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBookmark(post.id.toString())}
                          className="h-8 w-8 p-0"
                        >
                          <BookmarkIcon 
                            className={`h-4 w-4 ${interactions.bookmarked.has(post.id.toString()) ? 'fill-current text-primary' : ''}`} 
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id.toString())}
                          className="h-8 w-8 p-0"
                        >
                          <HeartIcon 
                            className={`h-4 w-4 ${interactions.liked.has(post.id.toString()) ? 'fill-current text-red-500' : ''}`} 
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(post)}
                          className="h-8 w-8 p-0"
                        >
                          <ShareIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <motion.div variants={itemVariants}>
              <Button size="lg" variant="outline" className="group">
                View All Articles
                <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              <SidebarAd />
              
              {/* Additional sidebar content can go here */}
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold mb-4">Popular Categories</h3>
                <div className="space-y-2">
                  {categories.slice(1).map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === category
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Stay Updated with Market Trends</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Subscribe to our newsletter for weekly insights, analysis, and investment opportunities.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
                required
                disabled={isSubmittingNewsletter}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button 
                type="submit" 
                disabled={isSubmittingNewsletter}
                className="whitespace-nowrap"
              >
                {isSubmittingNewsletter ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
            {newsletterMessage && (
              <p className={`mt-4 text-sm ${newsletterMessage.includes('Thank you') ? 'text-green-600' : 'text-red-600'}`}>
                {newsletterMessage}
              </p>
            )}
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}