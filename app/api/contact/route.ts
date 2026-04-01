import { NextResponse } from 'next/server';
import { createContact, type ContactSubmission } from '@/lib/airtable';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['firstName', 'lastName', 'email', 'message'];

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

    // Length limits
    if (body.firstName.length > 100 || body.lastName.length > 100) {
      return NextResponse.json({ error: 'Name too long' }, { status: 400 });
    }
    if (body.message.length > 5000) {
      return NextResponse.json({ error: 'Message too long (max 5000 characters)' }, { status: 400 });
    }
    if (body.phone && body.phone.length > 20) {
      return NextResponse.json({ error: 'Phone number too long' }, { status: 400 });
    }
    if (body.subject && body.subject.length > 200) {
      return NextResponse.json({ error: 'Subject too long' }, { status: 400 });
    }

    const contactData: ContactSubmission = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      subject: body.subject,
      message: body.message,
      source: body.source || 'Contact Page',
    };

    const result = await createContact(contactData);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in contact API:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to submit contact form.' },
    { status: 405 }
  );
}
