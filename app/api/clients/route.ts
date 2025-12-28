import { NextResponse } from 'next/server';
import { createOrUpdateClient, type ClientFormData } from '@/lib/airtable';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['firstName', 'lastName', 'email', 'consent'];

    for (const field of required) {
      if (body[field] === undefined || body[field] === null) {
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

    // Consent must be true
    if (body.consent !== true) {
      return NextResponse.json(
        { error: 'You must consent to proceed' },
        { status: 400 }
      );
    }

    const clientData: ClientFormData = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      healthGoals: body.healthGoals,
      dietaryRestrictions: body.dietaryRestrictions,
      currentMedications: body.currentMedications,
      healthConditions: body.healthConditions,
      preferredContactMethod: body.preferredContactMethod,
      consent: body.consent,
      bookedRecordId: body.bookedRecordId,
    };

    const result = await createOrUpdateClient(clientData);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in clients API:', error);
    return NextResponse.json(
      { error: 'Failed to create client record. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create a client record.' },
    { status: 405 }
  );
}
