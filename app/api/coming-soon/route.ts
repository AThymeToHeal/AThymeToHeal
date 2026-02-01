import { NextResponse } from 'next/server';

// Cache coming soon features for 1 hour
export const revalidate = 3600;

// HARDCODED Coming Soon Features - Zero Airtable API calls!
const COMING_SOON_FEATURES = [
  {
    id: '1',
    icon: '🛒',
    title: 'Online Store',
    description: 'Shop our full range of herbal products directly from our website with easy checkout and secure payment.',
    eta: 'Coming Q2 2025',
    status: 'In Progress',
    priority: 'High',
    displayOrder: 1,
    isVisible: true,
  },
  {
    id: '2',
    icon: '📱',
    title: 'Mobile App',
    description: 'Track your wellness journey, manage consultations, and access herbal guides on the go.',
    eta: 'Coming 2025',
    status: 'Planned',
    priority: 'Medium',
    displayOrder: 2,
    isVisible: true,
  },
  {
    id: '3',
    icon: '📚',
    title: 'Member Resources',
    description: 'Exclusive access to herbal guides, video tutorials, seasonal recipes, and wellness tips.',
    eta: 'Coming Q3 2025',
    status: 'Planned',
    priority: 'Medium',
    displayOrder: 3,
    isVisible: true,
  },
  {
    id: '4',
    icon: '📅',
    title: 'Online Booking',
    description: 'Schedule consultations and workshops directly through our website at your convenience.',
    eta: 'Coming Q1 2025',
    status: 'In Progress',
    priority: 'High',
    displayOrder: 4,
    isVisible: true,
  },
];

/**
 * GET /api/coming-soon
 * Returns all visible coming soon features (hardcoded)
 */
export async function GET() {
  // Return hardcoded features - zero API calls!
  return NextResponse.json(COMING_SOON_FEATURES, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
    },
  });
}
