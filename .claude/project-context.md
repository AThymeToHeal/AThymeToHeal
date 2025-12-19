# AThymeToHeal - Technical Context for AI Assistants

This document provides technical context to help AI assistants understand the project architecture, patterns, and decisions.

## Architecture Overview

### Application Type
**Progressive Web Application (PWA-ready)** built with Next.js App Router, transitioning from a static marketing site to a full-featured SaaS platform for wellness content delivery and subscriptions.

### Current State (Phase 1)
- **Static pages** with client-side interactivity where needed
- **No backend** - all content is hardcoded in components
- **No authentication** - public site only
- **No database** - no persistent data storage
- **Tailwind CSS** - custom design system with CSS variables

### Target State (Phase 5)
- **Authenticated user portal** with personalized content
- **Supabase backend** - PostgreSQL database, auth, file storage
- **Stripe payments** - subscription management and digital product sales
- **Video streaming** - Supabase Storage with access control
- **Dynamic content** - admin-managed videos, products, and resources

## Technical Decisions & Rationale

### Why Next.js 16?
- **App Router** - Modern React architecture with Server Components
- **File-based routing** - Intuitive page structure
- **Built-in optimization** - Image, font, script optimization out of the box
- **API routes** - Backend API in the same codebase (when needed)
- **Vercel deployment** - Seamless hosting integration
- **TypeScript support** - First-class TS experience

### Why Supabase?
- **All-in-one platform** - Auth, database, storage, realtime in one service
- **PostgreSQL** - Powerful relational database with full SQL support
- **Row Level Security** - Fine-grained access control at database level
- **Open source** - No vendor lock-in, can self-host if needed
- **Great Next.js integration** - Official helpers and examples
- **Free tier** - Generous free tier for development and early production
- **Alternatives considered:**
  - Firebase: Too coupled with Google ecosystem
  - Auth0: Auth-only, would still need database and storage
  - AWS: Too complex, harder to manage for small team

### Why Stripe?
- **Industry standard** - Trusted by clients and developers
- **Comprehensive** - Handles subscriptions, one-time payments, invoicing
- **Great documentation** - Excellent Next.js examples
- **Webhooks** - Reliable event system for subscription changes
- **Customer portal** - Built-in UI for subscription management
- **Alternatives considered:**
  - PayPal: Less robust subscription management
  - Square: Limited international support
  - Lemon Squeezy: Newer, less proven for subscriptions

### Why Tailwind CSS?
- **Already in use** - Project was initialized with Tailwind
- **Rapid development** - Fast to build responsive UIs
- **Custom design system** - CSS variables allow brand customization
- **Small bundle** - Purges unused classes in production
- **No CSS-in-JS overhead** - Better performance than styled-components

## Data Model (Future Implementation)

### User Flow
```
1. Visitor lands on site (public)
2. Clicks "Sign Up" or "Explore Services"
3. Creates account (email/password or Google OAuth)
4. Chooses subscription tier or browses free content
5. If paid tier: Redirected to Stripe Checkout
6. Payment successful: Webhook updates Supabase
7. User accesses portal with videos, products, profile
8. Can manage subscription, view progress, download products
```

### Key Entities
- **User** (Supabase Auth) - Authentication and basic identity
- **Profile** (Supabase DB) - Extended user info (name, avatar, preferences)
- **Subscription** (Supabase DB) - Stripe subscription data (status, tier, dates)
- **Video** (Supabase DB + Storage) - Video metadata + file
- **VideoProgress** (Supabase DB) - User's playback progress per video
- **Product** (Supabase DB + Storage) - Digital product metadata + file
- **Purchase** (Supabase DB) - Record of one-time product purchases

### Access Control Strategy
- **Public routes:** Homepage, about, services, contact, FAQ, coming-soon
- **Protected routes:** Dashboard, videos, products, settings, consultations
- **Admin routes:** Video upload, product management, user management
- **RLS policies:** Enforce data access at database level (users see only their data)

## Design System

### Color Palette (CSS Variables)
```css
--color-primary: #023020;        /* Forest Green - headers, accents */
--color-secondary: #f0e9d2;      /* Cream - backgrounds */
--color-accent: #d9a066;         /* Warm Gold - CTAs, highlights */
--color-sage: #c1cf95;           /* Sage Green - subtle accents */
--color-taupe: #d5cec1;          /* Warm Taupe - borders, muted text */
--color-brown: #2a2319;          /* Dark Brown - body text */
--color-blue: #1878b9;           /* Accent Blue - links (not heavily used) */
--color-orange: #e57828;         /* Accent Orange - alerts, ratings */
--color-background: #fdfcfb;     /* Off-white - main background */
```

### Typography
- **Headings:** `font-serif` (system serif fonts)
- **Body:** `font-sans` (system sans-serif fonts)
- **Sizes:** Responsive with `text-xl md:text-2xl` patterns

### Component Patterns
- **Cards:** White background, rounded corners, subtle shadow, taupe border
- **Buttons:**
  - Primary: `bg-primary text-secondary` or `bg-accent text-primary`
  - Secondary: `border-2 border-primary text-primary bg-transparent`
- **Sections:** Alternating `bg-secondary` and `bg-background` for visual rhythm
- **Icons:** Currently emoji-based (🌿, 🍵, 💚, etc.)

## Code Patterns

### Server vs Client Components

**Use Server Components (default) for:**
- Static content pages
- SEO-critical pages
- Data fetching from database
- Any component without interactivity

**Use Client Components (`'use client'`) for:**
- Forms with state management
- Interactive UI (accordions, modals, tabs)
- Event handlers (onClick, onChange, etc.)
- Browser APIs (localStorage, window, etc.)
- React hooks (useState, useEffect, etc.)

### Example: Contact Form (Client Component)
```tsx
'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({...});
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    // Handle form submission
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Example: About Page (Server Component)
```tsx
// No 'use client' directive needed
export const metadata = {
  title: 'About Us - A Thyme To Heal',
  description: '...',
};

export default function AboutPage() {
  return <div>...</div>;
}
```

## Future Integration Points

### Supabase Client Setup (to be implemented)
```typescript
// /lib/supabase/client.ts (browser)
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
```

```typescript
// /lib/supabase/server.ts (server)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
};
```

### Stripe Checkout Flow (to be implemented)
```typescript
// /app/api/checkout/route.ts
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { priceId } = await request.json();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}
```

### Video Access Control (to be implemented)
```typescript
// Check if user has access to video
async function canAccessVideo(userId: string, videoId: string) {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, price_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  const { data: video } = await supabase
    .from('videos')
    .select('access_level')
    .eq('id', videoId)
    .single();

  // Check if subscription tier matches video access level
  return checkAccessLevel(subscription?.price_id, video?.access_level);
}
```

## Performance Considerations

### Current Optimizations
- Server Components for static content (less JS shipped)
- Responsive images with srcset (when we add images)
- Tailwind CSS purging (removes unused styles)
- Static generation where possible

### Future Optimizations
- **Next/Image** for optimized image loading
- **Video streaming** with range requests (not full file download)
- **Incremental Static Regeneration** for content pages
- **CDN caching** via Vercel Edge Network
- **Database indexing** on frequently queried columns
- **Lazy loading** for video player components

## Security Checklist

### Current (Public Site)
- [x] HTTPS enforced
- [x] No secrets in code
- [x] ESLint for code quality
- [x] TypeScript for type safety

### Future (With Auth & Payments)
- [ ] Environment variables for all secrets
- [ ] Supabase RLS policies on all tables
- [ ] CSRF protection on forms
- [ ] Rate limiting on API routes
- [ ] Input validation with Zod
- [ ] Secure session handling (Supabase handles this)
- [ ] Stripe webhook signature verification
- [ ] HIPAA compliance (if storing health data)

## Testing Strategy (Future)

### Recommended Stack
- **Unit tests:** Vitest (faster than Jest)
- **Component tests:** React Testing Library
- **E2E tests:** Playwright (better than Cypress for Next.js)
- **API tests:** Supertest or Playwright API testing

### Critical Test Coverage
- Authentication flows (signup, login, logout, password reset)
- Payment flows (subscription creation, upgrade, downgrade, cancellation)
- Video access control (user can/cannot access based on subscription)
- Webhook handlers (Stripe events update database correctly)

## Deployment

### Current Setup
- **Local development:** `npm run dev` on localhost:3000
- **Production:** Not yet deployed

### Recommended Deployment
- **Platform:** Vercel (optimal for Next.js)
- **Domain:** athymetoheal.org (already owned)
- **Environment:** Production + Preview (for testing)
- **CI/CD:** Git push to main → Auto deploy
- **Analytics:** Vercel Analytics or Plausible (privacy-friendly)

## Common Pitfalls & Solutions

### Pitfall 1: Client/Server Component Confusion
**Problem:** "You're importing a component that needs useState but didn't mark it as a Client Component"
**Solution:** Add `'use client'` directive at the top of the file

### Pitfall 2: Environment Variables Not Loading
**Problem:** `process.env.NEXT_PUBLIC_*` returns undefined
**Solution:**
- Restart dev server after changing .env.local
- Ensure public variables start with NEXT_PUBLIC_
- Check .env.local is in .gitignore

### Pitfall 3: Supabase RLS Blocking Queries
**Problem:** Query returns no data even though data exists
**Solution:**
- Check RLS policies are correctly configured
- Use service role key for admin operations (with caution)
- Ensure user is authenticated before querying protected data

### Pitfall 4: Stripe Webhook Fails
**Problem:** Webhook endpoint returns 500, subscription not created
**Solution:**
- Verify webhook signature
- Check Stripe webhook secret is correct
- Ensure endpoint is public (not behind auth)
- Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

## Helpful Resources

### Documentation
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Examples & Templates
- [Next.js Supabase Starter](https://github.com/vercel/next.js/tree/canary/examples/with-supabase)
- [Stripe Checkout Example](https://github.com/vercel/next.js/tree/canary/examples/with-stripe-typescript)
- [SaaS Starter Kit](https://github.com/boxyhq/saas-starter-kit)

### Tools
- [Supabase Studio](https://app.supabase.com/) - Database management
- [Stripe Dashboard](https://dashboard.stripe.com/) - Payment management
- [Vercel Dashboard](https://vercel.com/dashboard) - Deployment management

---

**Document Version:** 1.0
**Last Updated:** December 18, 2025
**Maintained By:** Development Team
