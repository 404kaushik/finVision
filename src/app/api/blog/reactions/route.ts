import { NextRequest, NextResponse } from 'next/server';
import { getBlogPostById } from '@/data/blog-posts';

type ReactionType = 'like' | 'dislike' | 'love' | 'insightful' | 'helpful';

interface Reaction {
  id: string;
  postId: string;
  userId: string;
  type: ReactionType;
  createdAt: string;
}

interface ReactionStats {
  postId: string;
  reactions: Record<ReactionType, number>;
  totalReactions: number;
}

// Mock storage - in production, use a database
const reactions: Reaction[] = [];
let reactionIdCounter = 1;

// Mock user ID - in a real app, this would come from authentication
const MOCK_USER_ID = 'user_123';

const VALID_REACTION_TYPES: ReactionType[] = ['like', 'dislike', 'love', 'insightful', 'helpful'];

export async function POST(request: NextRequest) {
  try {
    const { postId, type, action } = await request.json();

    if (!postId || !type) {
      return NextResponse.json(
        { error: 'Post ID and reaction type are required' },
        { status: 400 }
      );
    }

    if (!VALID_REACTION_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid reaction type. Must be one of: ${VALID_REACTION_TYPES.join(', ')}` },
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

    // Find existing reaction from this user for this post
    const existingReactionIndex = reactions.findIndex(
      reaction => reaction.postId === postId && reaction.userId === MOCK_USER_ID
    );

    if (action === 'remove' || (existingReactionIndex > -1 && reactions[existingReactionIndex].type === type)) {
      // Remove existing reaction
      if (existingReactionIndex > -1) {
        reactions.splice(existingReactionIndex, 1);
      }
      
      const stats = getReactionStats(postId);
      return NextResponse.json(
        { 
          message: 'Reaction removed successfully',
          userReaction: null,
          stats
        },
        { status: 200 }
      );
    } else {
      // Remove existing reaction if different type
      if (existingReactionIndex > -1) {
        reactions.splice(existingReactionIndex, 1);
      }

      // Add new reaction
      const newReaction: Reaction = {
        id: `reaction_${reactionIdCounter++}`,
        postId,
        userId: MOCK_USER_ID,
        type,
        createdAt: new Date().toISOString()
      };
      reactions.push(newReaction);

      const stats = getReactionStats(postId);
      return NextResponse.json(
        { 
          message: 'Reaction added successfully',
          userReaction: type,
          stats
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Reaction error:', error);
    return NextResponse.json(
      { error: 'Failed to process reaction' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const userId = searchParams.get('userId') || MOCK_USER_ID;

    if (postId) {
      // Get reactions for specific post
      const stats = getReactionStats(postId);
      const userReaction = reactions.find(
        reaction => reaction.postId === postId && reaction.userId === userId
      );

      return NextResponse.json({
        postId,
        userReaction: userReaction?.type || null,
        stats
      });
    } else {
      // Get overall reaction statistics
      const allStats = reactions.reduce((acc, reaction) => {
        if (!acc[reaction.postId]) {
          acc[reaction.postId] = getReactionStats(reaction.postId);
        }
        return acc;
      }, {} as Record<string, ReactionStats>);

      return NextResponse.json({
        totalReactions: reactions.length,
        totalPosts: Object.keys(allStats).length,
        postStats: allStats
      });
    }
  } catch (error) {
    console.error('Get reactions error:', error);
    return NextResponse.json(
      { error: 'Failed to get reactions' },
      { status: 500 }
    );
  }
}

function getReactionStats(postId: string): ReactionStats {
  const postReactions = reactions.filter(reaction => reaction.postId === postId);
  
  const reactionCounts = VALID_REACTION_TYPES.reduce((acc, type) => {
    acc[type] = postReactions.filter(reaction => reaction.type === type).length;
    return acc;
  }, {} as Record<ReactionType, number>);

  return {
    postId,
    reactions: reactionCounts,
    totalReactions: postReactions.length
  };
}