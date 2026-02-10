import { NextResponse } from 'next/server';
import { createConsultation, getBookingsForDate, type Consultation, type ConsultantType } from '@/lib/airtable';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = [
      'firstName',
      'lastName',
      'email',
      'bookingType',
      'serviceType',
      'consultant',
      'dateBooked',
      'timeSlotStart',
      'timeSlotEnd',
      'userTimezone',
      'userLocalTime',
    ];

    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // CRITICAL: Double-booking prevention check
    // Verify the timeslot is still available before creating the booking
    try {
      const existingBookings = await getBookingsForDate(
        body.dateBooked,
        body.consultant as ConsultantType
      );

      const isSlotTaken = existingBookings.some(
        (booking) => booking.timeSlot === body.timeSlotStart
      );

      if (isSlotTaken) {
        return NextResponse.json(
          {
            error: 'This timeslot was just booked by someone else. Please select a different time.',
            code: 'SLOT_UNAVAILABLE',
          },
          { status: 409 } // 409 Conflict
        );
      }
    } catch (verificationError) {
      console.error('Error verifying slot availability:', verificationError);
      // If verification fails, log it but allow booking with manual verification flag
      // This prevents blocking legitimate bookings due to API issues
      console.warn('Proceeding with booking despite verification failure - manual review required');
    }

    const consultation: Consultation = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      bookingType: body.bookingType,
      serviceType: body.serviceType,
      consultant: body.consultant,
      dateBooked: body.dateBooked,
      timeSlotStart: body.timeSlotStart,
      timeSlotEnd: body.timeSlotEnd,
      userTimezone: body.userTimezone,
      userLocalTime: body.userLocalTime,
    };

    const result = await createConsultation(consultation);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in bookings API:', error);
    return NextResponse.json(
      { error: 'Failed to create booking. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create a booking.' },
    { status: 405 }
  );
}
