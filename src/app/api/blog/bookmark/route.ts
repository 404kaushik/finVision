import { NextRequest, NextResponse } from 'next/server';
import { getBlogPostById } from '@/data/blog-posts';

interface Bookmark {
  id: string;
  postId: string;
  userId: string; // In a real app, this would come from authentication
  createdAt: string;
}

// Mock storage - in production, use a database
const bookmarks: Bookmark[] = [];
let bookmarkIdCounter = 1;

// Mock user ID - in a real app, this would come from authentication
const MOCK_USER_ID = 'user_123';

export async function POST(request: NextRequest) {
  try {
    const { postId, action } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
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

    const existingBookmark = bookmarks.find(
      bookmark => bookmark.postId === postId && bookmark.userId === MOCK_USER_ID
    );

    if (action === 'remove' || existingBookmark) {
      // Remove bookmark
      const index = bookmarks.findIndex(
        bookmark => bookmark.postId === postId && bookmark.userId === MOCK_USER_ID
      );
      if (index > -1) {
        bookmarks.splice(index, 1);
      }
      
      return NextResponse.json(
        { 
          message: 'Bookmark removed successfully',
          isBookmarked: false,
          totalBookmarks: bookmarks.filter(b => b.postId === postId).length
        },
        { status: 200 }
      );
    } else {
      // Add bookmark
      const newBookmark: Bookmark = {
        id: `bookmark_${bookmarkIdCounter++}`,
        postId,
        userId: MOCK_USER_ID,
        createdAt: new Date().toISOString()
      };
      bookmarks.push(newBookmark);

      return NextResponse.json(
        { 
          message: 'Bookmark added successfully',
          isBookmarked: true,
          totalBookmarks: bookmarks.filter(b => b.postId === postId).length
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Bookmark error:', error);
    return NextResponse.json(
      { error: 'Failed to process bookmark request' },
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
      // Check if specific post is bookmarked by user
      const isBookmarked = bookmarks.some(
        bookmark => bookmark.postId === postId && bookmark.userId === userId
      );
      const totalBookmarks = bookmarks.filter(b => b.postId === postId).length;

      return NextResponse.json({
        postId,
        isBookmarked,
        totalBookmarks
      });
    } else {
      // Get all bookmarks for user
      const userBookmarks = bookmarks
        .filter(bookmark => bookmark.userId === userId)
        .map(bookmark => {
          const post = getBlogPostById(bookmark.postId);
          return {
            id: bookmark.id,
            postId: bookmark.postId,
            createdAt: bookmark.createdAt,
            post: post ? {
              title: post.title,
              excerpt: post.excerpt,
              category: post.category,
              image: post.image,
              author: post.author,
              date: post.date,
              readTime: post.readTime
            } : null
          };
        })
        .filter(bookmark => bookmark.post !== null)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return NextResponse.json({
        bookmarks: userBookmarks,
        total: userBookmarks.length
      });
    }
  } catch (error) {
    console.error('Get bookmarks error:', error);
    return NextResponse.json(
      { error: 'Failed to get bookmarks' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookmarkId = searchParams.get('id');
    const userId = searchParams.get('userId') || MOCK_USER_ID;

    if (!bookmarkId) {
      return NextResponse.json(
        { error: 'Bookmark ID is required' },
        { status: 400 }
      );
    }

    const index = bookmarks.findIndex(
      bookmark => bookmark.id === bookmarkId && bookmark.userId === userId
    );

    if (index === -1) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      );
    }

    bookmarks.splice(index, 1);

    return NextResponse.json(
      { message: 'Bookmark deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete bookmark error:', error);
    return NextResponse.json(
      { error: 'Failed to delete bookmark' },
      { status: 500 }
    );
  }
}