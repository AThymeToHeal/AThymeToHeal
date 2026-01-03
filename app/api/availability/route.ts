import { NextResponse } from 'next/server';
import {
  getAvailabilityForBothAdvisors,
  type TimeSlot,
  SERVICES,
  type ServiceType,
  type ConsultantType,
} from '@/lib/airtable';

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

    if (!consultant) {
      return NextResponse.json({ error: 'Missing consultant parameter' }, { status: 400 });
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

    // Get availability for both advisors using the new function
    const { selectedAdvisorSlots, otherAdvisorSlots, otherConsultantName } =
      await getAvailabilityForBothAdvisors(date, consultant, serviceType);

    // Return the selected advisor's slots (includes both available and "available with other")
    return NextResponse.json(selectedAdvisorSlots, { status: 200 });
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
