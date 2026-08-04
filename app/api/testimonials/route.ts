import { NextResponse } from 'next/server';
import { getTestimonials, createTestimonial, type Testimonial } from '@/lib/airtable';

// Always fetch fresh testimonials — no edge/CDN caching
export const revalidate = 0;

export async function GET() {
  try {
    const testimonials = await getTestimonials();
    return NextResponse.json(testimonials, { status: 200 });
  } catch (error) {
    console.error('Error in testimonials GET API:', error);
    // Return empty array — client keeps its hardcoded fallback reviews on error
    return NextResponse.json([], { status: 200 });
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

    // Length limits
    if (body.name.length > 100) {
      return NextResponse.json({ error: 'Name too long (max 100 characters)' }, { status: 400 });
    }
    if (body.text.length > 2000) {
      return NextResponse.json({ error: 'Testimonial too long (max 2000 characters)' }, { status: 400 });
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
