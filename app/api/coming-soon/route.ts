import { NextResponse } from 'next/server';
import { getComingSoonFeatures } from '@/lib/airtable';

/**
 * GET /api/coming-soon
 * Returns all visible coming soon features from Airtable
 */
export async function GET() {
  try {
    const features = await getComingSoonFeatures();
    return NextResponse.json(features);
  } catch (error) {
    console.error('Error in /api/coming-soon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coming soon features' },
      { status: 500 }
    );
  }
}
