import { NextRequest, NextResponse } from 'next/server';
import { getBlogPostById } from '@/data/blog-posts';

interface ShareRequest {
  postId: string;
  platform: 'twitter' | 'linkedin' | 'facebook' | 'email' | 'copy';
  url: string;
}

interface ShareStats {
  postId: string;
  platform: string;
  count: number;
  lastShared: string;
}

// Mock storage for share statistics
const shareStats: ShareStats[] = [];

export async function POST(request: NextRequest) {
  try {
    const { postId, platform, url }: ShareRequest = await request.json();

    // Validate input
    if (!postId || !platform || !url) {
      return NextResponse.json(
        { error: 'Missing required fields: postId, platform, url' },
        { status: 400 }
      );
    }

    // Validate post exists
    const post = getBlogPostById(postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Update share statistics
    const existingStat = shareStats.find(stat => stat.postId === postId && stat.platform === platform);
    if (existingStat) {
      existingStat.count += 1;
      existingStat.lastShared = new Date().toISOString();
    } else {
      shareStats.push({
        postId,
        platform,
        count: 1,
        lastShared: new Date().toISOString()
      });
    }

    // Generate share URLs based on platform
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(`Check out this article: ${post.title}\n\n${post.excerpt}\n\nRead more: ${url}`)}`,
      copy: url
    };

    return NextResponse.json(
      { 
        message: 'Share recorded successfully',
        shareUrl: shareUrls[platform],
        stats: {
          totalShares: shareStats
            .filter(stat => stat.postId === postId)
            .reduce((sum, stat) => sum + stat.count, 0)
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Share error:', error);
    return NextResponse.json(
      { error: 'Failed to process share request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (postId) {
      // Get share stats for specific post
      const postStats = shareStats.filter(stat => stat.postId === postId);
      const totalShares = postStats.reduce((sum, stat) => sum + stat.count, 0);
      
      return NextResponse.json({
        postId,
        totalShares,
        byPlatform: postStats.reduce((acc, stat) => {
          acc[stat.platform] = stat.count;
          return acc;
        }, {} as Record<string, number>)
      });
    } else {
      // Get overall share statistics
      const totalShares = shareStats.reduce((sum, stat) => sum + stat.count, 0);
      return NextResponse.json({
        totalShares,
        totalPosts: new Set(shareStats.map(stat => stat.postId)).size,
        topPosts: shareStats
          .reduce((acc, stat) => {
            const existing = acc.find(item => item.postId === stat.postId);
            if (existing) {
              existing.shares += stat.count;
            } else {
              acc.push({ postId: stat.postId, shares: stat.count });
            }
            return acc;
          }, [] as { postId: string; shares: number }[])
          .sort((a, b) => b.shares - a.shares)
          .slice(0, 5)
      });
    }
  } catch (error) {
    console.error('Get share stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get share statistics' },
      { status: 500 }
    );
  }
}