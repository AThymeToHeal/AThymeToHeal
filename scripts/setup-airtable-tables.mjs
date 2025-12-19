/**
 * Airtable Table Setup Script
 *
 * This script automatically creates all 7 tables in your Airtable base
 * using the Airtable Meta API.
 *
 * Usage:
 * 1. Ensure AIRTABLE_API_KEY and AIRTABLE_BASE_ID are set in .env.local
 * 2. Run: npm run setup-tables
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

const META_API_URL = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`;

const tables = [
  // Table 2: Booked (Consultation Bookings)
  {
    name: 'Booked',
    description: 'Consultation booking records',
    fields: [
      { name: 'Email', type: 'email' },
      { name: 'Date', type: 'date', options: { dateFormat: { name: 'us' } } },
      { name: 'Time', type: 'singleLineText' },
      { name: 'Timezone', type: 'singleLineText' },
      { name: 'DateCreated', type: 'dateTime', options: { dateFormat: { name: 'us' }, timeFormat: { name: '12hour' }, timeZone: 'America/New_York' } },
    ],
  },

  // Table 3: Clients (Client Information)
  {
    name: 'Clients',
    description: 'Client information and health details',
    fields: [
      { name: 'FirstName', type: 'singleLineText' },
      { name: 'LastName', type: 'singleLineText' },
      { name: 'Email', type: 'email' },
      { name: 'Phone', type: 'phoneNumber' },
      { name: 'HealthGoals', type: 'multilineText' },
      { name: 'DietaryRestrictions', type: 'multilineText' },
      { name: 'CurrentMedications', type: 'multilineText' },
      { name: 'HealthConditions', type: 'multilineText' },
      { name: 'PreferredContactMethod', type: 'singleSelect', options: { choices: [{ name: 'Email' }, { name: 'Phone' }, { name: 'Text' }] } },
      { name: 'BestTimeToContact', type: 'singleSelect', options: { choices: [{ name: 'Morning' }, { name: 'Afternoon' }, { name: 'Evening' }] } },
      { name: 'DateCreated', type: 'dateTime', options: { dateFormat: { name: 'us' }, timeFormat: { name: '12hour' }, timeZone: 'America/New_York' } },
    ],
  },

  // Table 4: Newsletter Signups
  {
    name: 'Newsletter Signups',
    description: 'Email newsletter subscriptions',
    fields: [
      { name: 'Email', type: 'email' },
      { name: 'Name', type: 'singleLineText' },
      { name: 'Source', type: 'singleSelect', options: { choices: [{ name: 'Homepage' }, { name: 'Contact Page' }, { name: 'Coming Soon Page' }] } },
      { name: 'DateCreated', type: 'dateTime', options: { dateFormat: { name: 'us' }, timeFormat: { name: '12hour' }, timeZone: 'America/New_York' } },
    ],
  },

  // Table 5: Testimonials
  {
    name: 'Testimonials',
    description: 'Customer testimonials and reviews',
    fields: [
      { name: 'Name', type: 'singleLineText' },
      { name: 'Text', type: 'multilineText' },
      { name: 'Rating', type: 'number', options: { precision: 0 } },
      { name: 'Approved', type: 'checkbox', options: { icon: 'check', color: 'greenBright' } },
      { name: 'DateCreated', type: 'dateTime', options: { dateFormat: { name: 'us' }, timeFormat: { name: '12hour' }, timeZone: 'America/New_York' } },
    ],
  },

  // Table 6: FAQs
  {
    name: 'FAQs',
    description: 'Frequently asked questions',
    fields: [
      { name: 'Question', type: 'singleLineText' },
      { name: 'Answer', type: 'multilineText' },
      { name: 'Category', type: 'singleSelect', options: { choices: [{ name: 'Products' }, { name: 'Services' }, { name: 'Orders' }, { name: 'Returns' }, { name: 'Payment' }, { name: 'Workshops' }] } },
      { name: 'Order', type: 'number', options: { precision: 0 } },
      { name: 'ClickCount', type: 'number', options: { precision: 0 } },
    ],
  },

  // Table 7: FAQ Clicks
  {
    name: 'FAQ Clicks',
    description: 'FAQ click tracking for analytics',
    fields: [
      { name: 'ClickedAt', type: 'dateTime', options: { dateFormat: { name: 'us' }, timeFormat: { name: '12hour' }, timeZone: 'America/New_York' } },
    ],
  },
];

async function createTable(table) {
  try {
    console.log(`\n📝 Creating table: ${table.name}...`);

    const response = await fetch(META_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: table.name,
        description: table.description || '',
        fields: table.fields,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`❌ Failed to create ${table.name}:`, error);
      return null;
    }

    const result = await response.json();
    console.log(`✅ Created table: ${table.name} (ID: ${result.id})`);
    return result.id;
  } catch (error) {
    console.error(`❌ Error creating ${table.name}:`, error);
    return null;
  }
}

async function addLinkedRecordField(tableId, fieldName, linkedTableId, description) {
  try {
    console.log(`\n🔗 Adding linked field: ${fieldName}...`);

    const response = await fetch(`${META_API_URL}/${tableId}/fields`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fieldName,
        type: 'multipleRecordLinks',
        options: {
          linkedTableId: linkedTableId,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`❌ Failed to add ${fieldName}:`, error);
      return;
    }

    console.log(`✅ Added linked field: ${fieldName}`);
  } catch (error) {
    console.error(`❌ Error adding ${fieldName}:`, error);
  }
}

async function checkExistingTables() {
  try {
    const response = await fetch(META_API_URL, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch existing tables');
    }

    const data = await response.json();
    return data.tables.map((t) => t.name);
  } catch (error) {
    console.error('❌ Error checking existing tables:', error);
    return [];
  }
}

async function setupTables() {
  console.log('🚀 Starting Airtable table setup...\n');
  console.log(`Base ID: ${AIRTABLE_BASE_ID}\n`);

  // Check for existing tables
  console.log('📋 Checking for existing tables...');
  const existingTables = await checkExistingTables();
  console.log(`Found ${existingTables.length} existing tables:`, existingTables.join(', '));

  // Note: 'contact' table already exists, so we skip it
  if (existingTables.includes('contact')) {
    console.log('✅ Table "contact" already exists, skipping...');
  } else {
    console.log('⚠️  Warning: "contact" table not found. You may need to create it manually.');
  }

  const tableIds = {};

  // Create all tables
  for (const table of tables) {
    if (existingTables.includes(table.name)) {
      console.log(`⏭️  Skipping ${table.name} (already exists)`);
      continue;
    }

    const tableId = await createTable(table);
    if (tableId) {
      tableIds[table.name] = tableId;
      // Longer delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Add linked record fields after all tables are created
  console.log('\n🔗 Setting up table relationships...');

  if (tableIds['Booked'] && tableIds['Clients']) {
    await addLinkedRecordField(
      tableIds['Clients'],
      'BookedRecord',
      tableIds['Booked'],
      'Link to consultation booking'
    );
  }

  if (tableIds['FAQs'] && tableIds['FAQ Clicks']) {
    await addLinkedRecordField(
      tableIds['FAQ Clicks'],
      'FAQRecord',
      tableIds['FAQs'],
      'Link to FAQ that was clicked'
    );
  }

  console.log('\n\n✨ Setup complete!\n');
  console.log('Next steps:');
  console.log('1. Run: npm run migrate-faqs (to populate FAQ data)');
  console.log('2. Add 3 sample testimonials in Airtable with Approved=true');
  console.log('3. Test the website locally: npm run dev');
  console.log('4. Deploy to Netlify and add environment variables\n');
}

// Run the setup
setupTables().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
