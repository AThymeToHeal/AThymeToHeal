/**
 * Add Coming Soon Features Table to Airtable
 *
 * This script creates a "Coming Soon Features" table in your Airtable base
 * using the Airtable Meta API.
 *
 * Usage:
 * 1. Ensure AIRTABLE_API_KEY and AIRTABLE_BASE_ID are set in .env.local
 * 2. Run: node scripts/add-coming-soon-table.mjs
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

const comingSoonTable = {
  name: 'Coming Soon Features',
  description: 'Upcoming features and improvements for the website',
  fields: [
    { name: 'Title', type: 'singleLineText' },
    { name: 'Description', type: 'multilineText' },
    { name: 'Icon', type: 'singleLineText' },
    { name: 'ETA', type: 'singleLineText' },
    {
      name: 'Status',
      type: 'singleSelect',
      options: {
        choices: [
          { name: 'Planned' },
          { name: 'In Progress' },
          { name: 'Coming Soon' },
          { name: 'Launched' }
        ]
      }
    },
    {
      name: 'Priority',
      type: 'singleSelect',
      options: {
        choices: [
          { name: 'High' },
          { name: 'Medium' },
          { name: 'Low' }
        ]
      }
    },
    { name: 'DisplayOrder', type: 'number', options: { precision: 0 } },
    {
      name: 'IsVisible',
      type: 'checkbox',
      options: { icon: 'check', color: 'greenBright' }
    },
    {
      name: 'DateCreated',
      type: 'dateTime',
      options: {
        dateFormat: { name: 'us' },
        timeFormat: { name: '12hour' },
        timeZone: 'America/Denver'
      }
    },
  ],
};

async function createTable(table) {
  try {
    console.log(`\n📦 Creating table: ${table.name}...`);

    const response = await fetch(META_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(table),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Failed to create ${table.name}:`, data.error);
      return false;
    }

    console.log(`✅ Successfully created ${table.name} (ID: ${data.id})`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating ${table.name}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Coming Soon Features table creation...\n');
  console.log(`Base ID: ${AIRTABLE_BASE_ID}`);

  const success = await createTable(comingSoonTable);

  if (success) {
    console.log('\n✨ Coming Soon Features table created successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npm run add-coming-soon-features');
    console.log('   2. The coming-soon page will automatically fetch from Airtable');
  } else {
    console.log('\n❌ Failed to create table. Check errors above.');
    process.exit(1);
  }
}

main();
