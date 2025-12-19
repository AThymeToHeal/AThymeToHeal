import { NextResponse } from 'next/server';
import { trackFAQClick } from '@/lib/airtable';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.faqId) {
      return NextResponse.json({ error: 'FAQ ID is required' }, { status: 400 });
    }

    await trackFAQClick(body.faqId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in FAQ clicks API:', error);
    return NextResponse.json(
      { error: 'Failed to track FAQ click. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to track FAQ clicks.' },
    { status: 405 }
  );
}
