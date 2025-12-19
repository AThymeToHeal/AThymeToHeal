import { NextResponse } from 'next/server';
import { getBookingsForDate, type TimeSlot } from '@/lib/airtable';
import { generateTimeSlots } from '@/lib/timezone';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 });
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    // Generate all possible slots (9 AM - 5 PM EST, hourly)
    const allSlots = generateTimeSlots();

    // Get booked slots for this date
    const bookedTimes = await getBookingsForDate(date);

    // Mark slots as available or not
    const availableSlots: TimeSlot[] = allSlots.map((slot) => ({
      ...slot,
      available: !bookedTimes.includes(slot.start),
    }));

    return NextResponse.json(availableSlots, { status: 200 });
  } catch (error) {
    console.error('Error in availability API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability. Please try again.' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch availability.' },
    { status: 405 }
  );
}
