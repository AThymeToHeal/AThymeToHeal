import { NextResponse } from 'next/server';
import { getTestimonials, createTestimonial, type Testimonial } from '@/lib/airtable';

// Next.js will cache this route and revalidate every hour
export const revalidate = 3600;

// Fallback testimonials if Airtable is unreachable
const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    name: 'Abby',
    text: 'The passion for health and wellbeing that Illiana and Heidi share is so contagious! They are both so patient and gracious to explain the step by step processes that have worked wonders in their own life as well as countless others.',
  },
  {
    name: 'Anna',
    text: "Illiana and Heidi are the most compassionate and caring humans. They have helped guide me through my health issues, which have gotten so debilitating I'm on medical leave, and with their assistance, I am finally starting to feel like I can live again. They never make me feel judged or guilty for my choices, only supported me as appropriate and provided education if something was not a good choice. Through the essential emotions sessions with Illiana, I have started processing things that I have never even figured out in regular therapy. I cannot recommend working with these two enough!",
  },
  {
    name: 'Heather',
    text: "Since using the supplements Heidi recommended, I have felt an overall improvement in my health. I'm feeling more vibrant and have more energy. I also feel that the supplements have helped me with menopause symptoms and have increased the vitality of my hair, nails, and skin.",
  },
];

export async function GET() {
  const testimonials = await getTestimonials();

  return NextResponse.json(
    testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS,
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    }
  );
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
