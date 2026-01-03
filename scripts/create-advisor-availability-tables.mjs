/**
 * Advisor Availability Tables Setup Script
 *
 * This script creates the Advisor Availability and Advisor Days Off tables
 * in your Airtable base using the Airtable Meta API.
 *
 * Usage:
 * 1. Ensure AIRTABLE_API_KEY and AIRTABLE_BASE_ID are set in .env.local
 * 2. Run: npm run create-advisor-tables
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
  // Table 1: Advisor Availability (Recurring Weekly Schedule)
  {
    name: 'Advisor Availability',
    description: 'Recurring weekly availability schedules for advisors in 30-minute blocks',
    fields: [
      {
        name: 'TimeSlot',
        type: 'singleLineText',
        description: 'Start time of 30-minute block in HH:MM format (Mountain Time)'
      },
      {
        name: 'Consultant',
        type: 'singleSelect',
        options: {
          choices: [
            { name: 'Heidi Lynn' },
            { name: 'Illiana' }
          ]
        }
      },
      {
        name: 'DayOfWeek',
        type: 'singleSelect',
        options: {
          choices: [
            { name: 'Monday' },
            { name: 'Tuesday' },
            { name: 'Wednesday' },
            { name: 'Thursday' },
            { name: 'Friday' }
          ]
        }
      },
      {
        name: 'IsAvailable',
        type: 'checkbox',
        options: {
          icon: 'check',
          color: 'greenBright'
        }
      },
      {
        name: 'Notes',
        type: 'multilineText'
      },
      {
        name: 'CreatedAt',
        type: 'dateTime',
        options: {
          dateFormat: { name: 'us' },
          timeFormat: { name: '12hour' },
          timeZone: 'America/Denver'
        }
      }
    ],
  },

  // Table 2: Advisor Days Off (Specific Date Exceptions)
  {
    name: 'Advisor Days Off',
    description: 'Specific dates when advisors are unavailable (vacations, holidays, personal days)',
    fields: [
      {
        name: 'Date',
        type: 'date',
        options: {
          dateFormat: { name: 'us' }
        }
      },
      {
        name: 'Consultant',
        type: 'singleSelect',
        options: {
          choices: [
            { name: 'Heidi Lynn' },
            { name: 'Illiana' }
          ]
        }
      },
      {
        name: 'Reason',
        type: 'singleLineText',
        description: 'Brief description (e.g., Vacation, Holiday, Personal)'
      },
      {
        name: 'AllDay',
        type: 'checkbox',
        options: {
          icon: 'check',
          color: 'greenBright'
        }
      },
      {
        name: 'StartTime',
        type: 'singleLineText',
        description: 'For partial days only - start time in HH:MM format (Mountain Time)'
      },
      {
        name: 'EndTime',
        type: 'singleLineText',
        description: 'For partial days only - end time in HH:MM format (Mountain Time)'
      },
      {
        name: 'CreatedAt',
        type: 'dateTime',
        options: {
          dateFormat: { name: 'us' },
          timeFormat: { name: '12hour' },
          timeZone: 'America/Denver'
        }
      },
      {
        name: 'Notes',
        type: 'multilineText'
      }
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

async function main() {
  console.log('🚀 Starting Advisor Availability Tables Setup...\n');
  console.log(`Base ID: ${AIRTABLE_BASE_ID}`);

  const results = [];

  for (const table of tables) {
    const tableId = await createTable(table);
    results.push({ name: table.name, id: tableId });

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('SETUP COMPLETE');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.id !== null);
  const failed = results.filter(r => r.id === null);

  console.log(`\n✅ Successfully created ${successful.length} tables:`);
  successful.forEach(r => console.log(`   - ${r.name} (ID: ${r.id})`));

  if (failed.length > 0) {
    console.log(`\n❌ Failed to create ${failed.length} tables:`);
    failed.forEach(r => console.log(`   - ${r.name}`));
  }

  console.log('\n📝 Next steps:');
  console.log('   1. Run: npm run populate-advisor-availability');
  console.log('   2. Verify data in your Airtable base');
  console.log('   3. Advisors can now manage their schedules in Airtable\n');
}

main();
