import { NextRequest, NextResponse } from 'next/server';
import { hasAnyAdvisorAvailability, hasConsultantAvailability, ConsultantType } from '@/lib/airtable';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * GET /api/available-days
 *
 * Returns which days of the week have at least one advisor available
 * Optional query param: consultant - filters to specific consultant's availability
 *
 * Response: { availableDays: string[] }
 * Example: { availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] }
 */
export async function GET(request: NextRequest) {
  try {
    // Get optional consultant filter from query params
    const { searchParams } = new URL(request.url);
    const consultant = searchParams.get('consultant') as ConsultantType | null;

    // Check each day of the week
    const availabilityChecks = await Promise.all(
      DAYS_OF_WEEK.map(async (day) => {
        // If consultant is specified, check only their availability
        // Otherwise check if any advisor is available
        const hasAvailability = consultant
          ? await hasConsultantAvailability(consultant, day)
          : await hasAnyAdvisorAvailability(day);
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
