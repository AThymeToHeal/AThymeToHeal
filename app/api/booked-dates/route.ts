import { NextResponse } from 'next/server';
import { getFullyBookedDates, type ConsultantType } from '@/lib/airtable';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const consultant = searchParams.get('consultant') as ConsultantType | null;

    if (!year || !month) {
      return NextResponse.json(
        { error: 'Missing year or month parameter' },
        { status: 400 }
      );
    }

    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return NextResponse.json({ error: 'Invalid year or month' }, { status: 400 });
    }

    const fullyBookedDates = await getFullyBookedDates(yearNum, monthNum, consultant || undefined);

    return NextResponse.json(fullyBookedDates, { status: 200 });
  } catch (error) {
    console.error('Error in booked-dates API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booked dates. Please try again.' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch booked dates.' },
    { status: 405 }
  );
}
