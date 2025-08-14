import { NextRequest, NextResponse } from 'next/server';

// In a real application, you would integrate with a service like Mailchimp, ConvertKit, or your own database
interface NewsletterSubscription {
  email: string;
  timestamp: string;
}

// Mock storage - in production, use a database
const subscriptions: NewsletterSubscription[] = [];

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscription = subscriptions.find(sub => sub.email === email);
    if (existingSubscription) {
      return NextResponse.json(
        { message: 'Email already subscribed to newsletter' },
        { status: 200 }
      );
    }

    // Add subscription
    const newSubscription: NewsletterSubscription = {
      email,
      timestamp: new Date().toISOString()
    };
    subscriptions.push(newSubscription);

    // In a real application, you would:
    // 1. Save to database
    // 2. Send confirmation email
    // 3. Add to email marketing service

    return NextResponse.json(
      { message: 'Successfully subscribed to newsletter!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // This endpoint could be used by admins to view subscriptions
  return NextResponse.json(
    { 
      count: subscriptions.length,
      message: 'Newsletter subscription endpoint is active'
    },
    { status: 200 }
  );
}