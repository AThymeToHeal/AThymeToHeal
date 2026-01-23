import { NextResponse } from 'next/server';
import { getComingSoonFeatures } from '@/lib/airtable';

// Cache coming soon features for 1 hour
export const revalidate = 3600;

/**
 * GET /api/coming-soon
 * Returns all visible coming soon features from Airtable
 */
export async function GET() {
  try {
    const features = await getComingSoonFeatures();
    return NextResponse.json(features, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    console.error('Error in /api/coming-soon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coming soon features' },
      { status: 500 }
    );
  }
}
