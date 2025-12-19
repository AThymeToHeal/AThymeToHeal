import { NextResponse } from 'next/server';
import { getTestimonials, createTestimonial, type Testimonial } from '@/lib/airtable';

export async function GET() {
  try {
    const testimonials = await getTestimonials();
    return NextResponse.json(testimonials, { status: 200 });
  } catch (error) {
    console.error('Error in testimonials GET API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials. Please try again.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['name', 'text', 'rating'];

    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate rating
    if (typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    const testimonial: Testimonial = {
      name: body.name,
      text: body.text,
      rating: body.rating,
    };

    const result = await createTestimonial(testimonial);

    return NextResponse.json(
      {
        ...result,
        message: 'Thank you for your testimonial! It will be reviewed before being published.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in testimonials POST API:', error);
    return NextResponse.json(
      { error: 'Failed to submit testimonial. Please try again.' },
      { status: 500 }
    );
  }
}
