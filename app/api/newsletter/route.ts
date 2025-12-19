import { NextResponse } from 'next/server';
import { createNewsletterSignup } from '@/lib/airtable';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required field
    if (!body.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const result = await createNewsletterSignup(
      body.email,
      body.name,
      body.source || 'Homepage'
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in newsletter API:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to subscribe to newsletter.' },
    { status: 405 }
  );
}
