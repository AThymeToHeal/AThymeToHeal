import { NextRequest, NextResponse } from 'next/server';
import { hasAnyAdvisorAvailability } from '@/lib/airtable';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * GET /api/available-days
 *
 * Returns which days of the week have at least one advisor available
 *
 * Response: { availableDays: string[] }
 * Example: { availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] }
 */
export async function GET(request: NextRequest) {
  try {
    // Check each day of the week
    const availabilityChecks = await Promise.all(
      DAYS_OF_WEEK.map(async (day) => {
        const hasAvailability = await hasAnyAdvisorAvailability(day);
        return { day, hasAvailability };
      })
    );

    // Filter to only days with availability
    const availableDays = availabilityChecks
      .filter(({ hasAvailability }) => hasAvailability)
      .map(({ day }) => day);

    return NextResponse.json({ availableDays });
  } catch (error) {
    console.error('Error fetching available days:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available days' },
      { status: 500 }
    );
  }
}
