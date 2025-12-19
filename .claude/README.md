# Claude Code Configuration for AThymeToHeal

This directory contains project-specific configuration for Claude Code to help with development of the AThymeToHeal wellness platform.

## Project Overview

**A Thyme To Heal** is a holistic wellness platform combining herbal medicine expertise with modern technology. The platform will feature:
- Client authentication and portal
- Video content library (wellness workshops, cooking demos, meditation)
- Digital product sales (meal plans, guides, recipes)
- Subscription management (Basic, Premium, VIP tiers)
- Consultation booking (future)

## Tech Stack

### Core Framework
- **Next.js 16.0.10** - App Router architecture
- **React 19.2.1** - Latest React with Server Components
- **TypeScript 5.x** - Full type safety

### Styling
- **Tailwind CSS 3.4.19** - Utility-first CSS
- **Custom Design System** - Earth tones (forest green, cream, sage, warm gold)

### Future Integrations
- **Supabase** - Authentication, database, file storage
- **Stripe** - Payment processing and subscriptions
- **Airtable** - Newsletter signups (possibly)

## Project Structure

```
/home/ellisisland/AThymeToHeal/
├── app/                    # Next.js App Router
│   ├── components/         # Reusable React components
│   ├── (auth)/            # Auth route group (future)
│   ├── (portal)/          # Portal route group (future)
│   └── api/               # API routes (future)
├── lib/                    # Utility functions (future)
│   └── supabase/          # Supabase client setup (future)
├── public/                 # Static assets
└── .claude/               # This directory
```

## Development Phases

### Phase 1: Foundation (Current)
- [x] Hero section update with client's branding
- [x] Client questions document for gathering requirements
- [x] Project configuration (.claude, .env templates)
- [ ] Environment setup documentation

### Phase 2: Infrastructure
- [ ] Supabase project setup
- [ ] Database schema implementation
- [ ] Environment variables configuration
- [ ] Core dependencies installation

### Phase 3: Authentication
- [ ] Email/password authentication
- [ ] Social login (Google, potentially others)
- [ ] User profiles
- [ ] Protected routes

### Phase 4: Subscriptions
- [ ] Stripe integration
- [ ] Subscription tiers
- [ ] Payment webhooks
- [ ] Subscription management UI

### Phase 5: Content
- [ ] Video library implementation
- [ ] Digital products store
- [ ] Content access control
- [ ] Progress tracking

## Coding Conventions

### Component Structure
- Use Server Components by default
- Mark with `'use client'` only when necessary (state, effects, interactivity)
- Export metadata for SEO from page components

### Styling
- Use Tailwind utility classes
- Reference CSS variables for colors: `bg-primary`, `text-accent`, etc.
- Maintain responsive design: mobile-first, use `sm:`, `md:`, `lg:` breakpoints

### TypeScript
- Enable strict mode
- Define proper types for all props and state
- Use Zod for runtime validation (future)

### File Naming
- Pages: `page.tsx`
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Types: `types.ts` or inline for component-specific

## Key Files Reference

### Current Pages
- `/app/page.tsx` - Homepage with hero section
- `/app/coming-soon/page.tsx` - Coming soon features placeholder
- `/app/contact/page.tsx` - Contact form
- `/app/how-we-can-help-you/page.tsx` - Services page
- `/app/about-us/page.tsx` - About page
- `/app/faq/page.tsx` - FAQ with accordion

### Components
- `/app/components/Header.tsx` - Navigation (client component)
- `/app/components/Footer.tsx` - Footer with links
- `/app/components/ContactForm.tsx` - Contact form (client component)
- `/app/components/FAQAccordion.tsx` - FAQ accordion (client component)

### Configuration
- `/tailwind.config.ts` - Tailwind configuration with custom colors
- `/tsconfig.json` - TypeScript configuration
- `/next.config.ts` - Next.js configuration
- `/.env.local.example` - Environment variables template
- `/client-questions.md` - Client decision document

## Database Schema (Future)

See `/home/ellisisland/.claude/plans/valiant-wobbling-allen.md` for complete Supabase schema including:
- User profiles
- Subscriptions
- Videos and video progress
- Digital products
- Row Level Security policies

## Common Tasks

### Development
```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

### Future Tasks (once Supabase is set up)
```bash
# Database migrations
npx supabase migration new <name>
npx supabase db push

# Type generation
npx supabase gen types typescript
```

## Environment Variables

See `.env.local.example` for complete list. Key variables:

```bash
# Supabase (future)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (future)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_SITE_URL=https://athymetoheal.org
```

## Notes for AI Assistants

### When working on this project:

1. **Always read existing code first** before suggesting changes
2. **Maintain the earth-toned design system** - don't introduce new colors without client approval
3. **Follow Next.js 13+ patterns** - use App Router, Server Components, file-based routing
4. **Preserve accessibility** - maintain semantic HTML, ARIA labels, keyboard navigation
5. **Keep it simple** - avoid over-engineering, prefer built-in solutions over libraries
6. **Security first** - validate user input, use Supabase RLS, never expose secrets
7. **Mobile-responsive always** - test changes at mobile, tablet, and desktop sizes

### Current client preferences:
- Brand: Professional yet approachable, holistic health focus
- Target audience: Health-conscious individuals seeking natural wellness solutions
- Tone: Warm, educational, empowering
- Tagline: "Combining holistic practices with science-based guidance, to help you restore balance and long-term well-being"

## Support & Questions

- Implementation plan: `.claude/plans/valiant-wobbling-allen.md`
- Client questions: `/client-questions.md` (for developer to share with client)
- Project repository: (to be added when pushed to GitHub)

---

**Last Updated:** December 18, 2025
**Project Status:** Phase 1 (Foundation)
**Next Milestone:** Client decision gathering, Supabase setup
