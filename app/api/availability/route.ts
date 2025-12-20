import { NextResponse } from 'next/server';
import {
  getBookingsForDate,
  type TimeSlot,
  SERVICES,
  type ServiceType,
  type ConsultantType,
} from '@/lib/airtable';
import { generateTimeSlots } from '@/lib/timezone';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const serviceType = searchParams.get('serviceType') as ServiceType | null;
    const consultant = searchParams.get('consultant') as ConsultantType | null;

    if (!date) {
      return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 });
    }

    if (!serviceType) {
      return NextResponse.json({ error: 'Missing serviceType parameter' }, { status: 400 });
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    // Get service configuration
    const serviceConfig = SERVICES[serviceType];
    if (!serviceConfig) {
      return NextResponse.json({ error: 'Invalid service type' }, { status: 400 });
    }

    // Generate all possible slots based on service duration
    const allSlots = generateTimeSlots(serviceConfig.duration);

    // Get booked slots for this date (optionally filtered by consultant)
    const bookedTimes = await getBookingsForDate(date, consultant || undefined);

    // Calculate minimum booking time (8 hours from now in MST)
    const nowMST = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Denver' }));
    const minimumBookingTime = new Date(nowMST);
    minimumBookingTime.setHours(minimumBookingTime.getHours() + 8);

    // Mark slots as available or not
    const availableSlots: TimeSlot[] = allSlots.map((slot) => {
      // Check if slot is already booked
      const isBooked = bookedTimes.includes(slot.start);

      // Check if slot is too soon (within next 8 hours)
      const slotDateTime = new Date(`${date}T${slot.start}:00`);
      // Convert slot time to MST for comparison
      const slotDateTimeMST = new Date(slotDateTime.toLocaleString('en-US', { timeZone: 'America/Denver' }));
      const isTooSoon = slotDateTimeMST <= minimumBookingTime;

      return {
        ...slot,
        available: !isBooked && !isTooSoon,
      };
    });

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
