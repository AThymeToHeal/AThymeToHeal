/**
 * Populate Coming Soon Features in Airtable
 *
 * This script adds the initial coming soon features to the Airtable table.
 *
 * Usage:
 * 1. Ensure the "Coming Soon Features" table exists (run add-coming-soon-table.mjs first)
 * 2. Ensure AIRTABLE_API_KEY and AIRTABLE_BASE_ID are set in .env.local
 * 3. Run: npm run add-coming-soon-features
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
config({ path: join(__dirname, '..', '.env.local') });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID in .env.local');
  process.exit(1);
}

const TABLE_NAME = 'Coming Soon Features';
const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

// Initial coming soon features (from the current page)
const features = [
  {
    Title: 'Online Store',
    Description: 'Shop our full range of herbal products directly from our website with easy checkout and secure payment.',
    Icon: '🛒',
    ETA: 'Coming Q2 2025',
    Status: 'Planned',
    Priority: 'High',
    DisplayOrder: 1,
    IsVisible: true,
  },
  {
    Title: 'Mobile App',
    Description: 'Track your wellness journey, manage consultations, and access herbal guides on the go.',
    Icon: '📱',
    ETA: 'Coming 2025',
    Status: 'Planned',
    Priority: 'Medium',
    DisplayOrder: 2,
    IsVisible: true,
  },
  {
    Title: 'Member Resources',
    Description: 'Exclusive access to herbal guides, video tutorials, seasonal recipes, and wellness tips.',
    Icon: '📚',
    ETA: 'Coming Q3 2025',
    Status: 'Planned',
    Priority: 'Medium',
    DisplayOrder: 3,
    IsVisible: true,
  },
  {
    Title: 'Online Booking',
    Description: 'Schedule consultations and workshops directly through our website at your convenience.',
    Icon: '📅',
    ETA: 'Coming Q1 2025',
    Status: 'In Progress',
    Priority: 'High',
    DisplayOrder: 4,
    IsVisible: true,
  },
];

async function createFeatures(features) {
  try {
    console.log(`\n📝 Adding ${features.length} features to Airtable...`);

    // Airtable API only allows 10 records per batch, but we have 4, so we're safe
    const records = features.map(feature => ({
      fields: {
        ...feature,
        DateCreated: new Date().toISOString(),
      }
    }));

    const response = await fetch(`${BASE_URL}/${encodeURIComponent(TABLE_NAME)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to add features:', data.error);
      return false;
    }

    console.log(`✅ Successfully added ${data.records.length} features`);

    // Display the added features
    data.records.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.fields.Icon} ${record.fields.Title} - ${record.fields.ETA}`);
    });

    return true;
  } catch (error) {
    console.error('❌ Error adding features:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Coming Soon Features population...\n');
  console.log(`Base ID: ${AIRTABLE_BASE_ID}`);
  console.log(`Table: ${TABLE_NAME}`);

  const success = await createFeatures(features);

  if (success) {
    console.log('\n✨ All features added successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Visit your Airtable base to verify the data');
    console.log('   2. The coming-soon page will automatically display these features');
    console.log('   3. You can add, edit, or remove features directly in Airtable');
  } else {
    console.log('\n❌ Failed to add features. Check errors above.');
    process.exit(1);
  }
}

main();
