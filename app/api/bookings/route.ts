import { NextResponse } from 'next/server';
import { createConsultation, getBookingsForDate, getBlockedSlotsWithBuffer, SERVICES, BOOKING_LIMITS, type Consultation, type ConsultantType, type ServiceType } from '@/lib/airtable';
import { invalidateServerCache } from '@/lib/serverCache';

const VALID_CONSULTANTS: ConsultantType[] = ['Heidi Lynn', 'Illiana'];
const VALID_SERVICE_TYPES = Object.keys(SERVICES) as ServiceType[];
const VALID_BOOKING_TYPES = ['Initial Consultation', 'Client Consultation', 'Business Consultation'];

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

    // Enum validation
    if (!VALID_CONSULTANTS.includes(body.consultant)) {
      return NextResponse.json({ error: 'Invalid consultant' }, { status: 400 });
    }
    if (!VALID_SERVICE_TYPES.includes(body.serviceType)) {
      return NextResponse.json({ error: 'Invalid service type' }, { status: 400 });
    }
    if (!VALID_BOOKING_TYPES.includes(body.bookingType)) {
      return NextResponse.json({ error: 'Invalid booking type' }, { status: 400 });
    }

    // Length limits
    if (body.firstName.length > 100 || body.lastName.length > 100) {
      return NextResponse.json({ error: 'Name too long' }, { status: 400 });
    }
    if (body.phone && body.phone.length > 20) {
      return NextResponse.json({ error: 'Phone number too long' }, { status: 400 });
    }

    // CRITICAL: Double-booking prevention check
    // Verify the timeslot is still available before creating the booking
    // Checks: time overlap with buffer, and daily booking limits
    try {
      const existingBookings = await getBookingsForDate(
        body.dateBooked,
        body.consultant as ConsultantType,
        true // bypassCache: always fresh for double-booking verification
      );

      // Build blocked slots from existing bookings (duration + 30-min buffer)
      const blockedSlots: string[] = [];
      for (const booking of existingBookings) {
        blockedSlots.push(...getBlockedSlotsWithBuffer(booking.timeSlot, booking.duration));
      }

      // Check if new booking's required blocks (duration + buffer) overlap with any blocked slot
      const newServiceConfig = SERVICES[body.serviceType as ServiceType];
      const newDuration = newServiceConfig?.duration || 30;
      const newRequiredBlocks = getBlockedSlotsWithBuffer(body.timeSlotStart, newDuration);
      const hasOverlap = newRequiredBlocks.some((block) => blockedSlots.includes(block));

      // Check daily booking limits
      const isBusinessService = body.serviceType === 'Business Consultation';
      const clientCount = existingBookings.filter((b) => b.serviceType !== 'Business Consultation').length;
      const businessCount = existingBookings.filter((b) => b.serviceType === 'Business Consultation').length;
      const limitReached = isBusinessService
        ? businessCount >= BOOKING_LIMITS.MAX_BUSINESS_BOOKINGS_PER_DAY
        : clientCount >= BOOKING_LIMITS.MAX_CLIENT_BOOKINGS_PER_DAY;

      if (hasOverlap || limitReached) {
        return NextResponse.json(
          {
            error: limitReached
              ? 'Daily booking limit reached for this consultant. Please select a different date.'
              : 'This timeslot was just booked by someone else. Please select a different time.',
            code: 'SLOT_UNAVAILABLE',
          },
          { status: 409 }
        );
      }
    } catch (verificationError) {
      console.error('Error verifying slot availability:', verificationError);
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

    // Invalidate server-side caches so other users see updated availability
    invalidateServerCache('bookings_');
    invalidateServerCache('fullybooked_');

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
