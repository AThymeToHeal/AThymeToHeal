import { NextResponse } from 'next/server';
import { getFAQs } from '@/lib/airtable';

export async function GET() {
  try {
    const faqs = await getFAQs();
    return NextResponse.json(faqs, { status: 200 });
  } catch (error) {
    console.error('Error in FAQs API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs. Please try again.' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch FAQs.' },
    { status: 405 }
  );
}
