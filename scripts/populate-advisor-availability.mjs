/**
 * Populate Advisor Availability Script
 *
 * This script populates the Advisor Availability table with custom schedules
 * for both advisors using flexible start/end times.
 *
 * Total records created: 12
 * - Heidi Lynn: 6 days (Mon-Sat), 12:00 PM - 6:00 PM
 * - Illiana: 6 days (Mon-Sat), variable hours (8 AM-12 PM, except Tue 9 AM-7 PM)
 *
 * Usage:
 * 1. Ensure AIRTABLE_API_KEY and AIRTABLE_BASE_ID are set in .env.local
 * 2. Ensure Advisor Availability table exists (run create-advisor-tables first)
 * 3. Run: npm run populate-advisor-availability
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

const TABLE_NAME = 'Advisor Schedules';
const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Define advisor schedules
 *
 * Heidi Lynn: 12:00 PM - 6:00 PM (noon to 6 PM) every day Mon-Sat
 * Illiana: 8:00 AM - 12:00 PM Mon, Wed, Thu, Fri, Sat
 *          9:00 AM - 7:00 PM Tuesday (special hours)
 */
const ADVISOR_SCHEDULES = {
  'Heidi Lynn': {
    'Monday': { start: '12:00', end: '18:00' },
    'Tuesday': { start: '12:00', end: '18:00' },
    'Wednesday': { start: '12:00', end: '18:00' },
    'Thursday': { start: '12:00', end: '18:00' },
    'Friday': { start: '12:00', end: '18:00' },
    'Saturday': { start: '12:00', end: '18:00' },
  },
  'Illiana': {
    'Monday': { start: '08:00', end: '12:00' },
    'Tuesday': { start: '09:00', end: '19:00' },  // Special Tuesday hours
    'Wednesday': { start: '08:00', end: '12:00' },
    'Thursday': { start: '08:00', end: '12:00' },
    'Friday': { start: '08:00', end: '12:00' },
    'Saturday': { start: '08:00', end: '12:00' },
  }
};

/**
 * Create availability records in batches of 10 (Airtable API limit)
 */
async function createAvailabilityRecords(records) {
  const batchSize = 10;
  const batches = [];

  for (let i = 0; i < records.length; i += batchSize) {
    batches.push(records.slice(i, i + batchSize));
  }

  console.log(`\n📝 Creating ${records.length} records in ${batches.length} batches...`);

  let totalCreated = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    try {
      const response = await fetch(`${BASE_URL}/${encodeURIComponent(TABLE_NAME)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: batch.map(record => ({ fields: record }))
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(`❌ Failed to create batch ${i + 1}:`, error);
        continue;
      }

      const result = await response.json();
      totalCreated += result.records.length;
      console.log(`   ✅ Batch ${i + 1}/${batches.length}: Created ${result.records.length} records`);

      // Add delay to avoid rate limiting (200ms between batches)
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error(`❌ Error creating batch ${i + 1}:`, error.message);
    }
  }

  return totalCreated;
}

/**
 * Generate all availability schedule records for both advisors
 */
function generateAllRecords() {
  const records = [];
  const now = new Date().toISOString();

  for (const [consultant, schedule] of Object.entries(ADVISOR_SCHEDULES)) {
    for (const [day, hours] of Object.entries(schedule)) {
      records.push({
        ScheduleName: `${consultant} - ${day}`,  // Primary field
        Consultant: consultant,
        DayOfWeek: day,
        StartTime: hours.start,
        EndTime: hours.end,
        IsActive: true,  // All schedules active by default
        CreatedAt: now,
        Notes: day === 'Tuesday' && consultant === 'Illiana'
          ? 'Extended Tuesday hours: 9 AM - 7 PM'
          : `${consultant} standard schedule`
      });
    }
  }

  return records;
}

async function main() {
  console.log('🚀 Starting Advisor Availability Population...\n');
  console.log(`Base ID: ${AIRTABLE_BASE_ID}`);
  console.log(`Table: ${TABLE_NAME}`);

  console.log('\n📊 Generation Summary:');
  console.log(`   - Consultants: Heidi Lynn, Illiana`);
  console.log(`   - Days: ${DAYS_OF_WEEK.join(', ')}`);
  console.log('\n   Heidi Lynn Schedule:');
  console.log('      Mon-Sat: 12:00 PM - 6:00 PM');
  console.log('\n   Illiana Schedule:');
  console.log('      Mon, Wed-Sat: 8:00 AM - 12:00 PM');
  console.log('      Tuesday: 9:00 AM - 7:00 PM (extended hours)');

  const expectedRecords = 12;  // 6 days × 2 advisors
  console.log(`\n   - Expected total: ${expectedRecords} records`);

  const records = generateAllRecords();
  console.log(`\n✅ Generated ${records.length} schedule records`);

  const created = await createAvailabilityRecords(records);

  console.log('\n' + '='.repeat(60));
  if (created === expectedRecords) {
    console.log('✨ SUCCESS! All availability schedule records created');
  } else {
    console.log(`⚠️  WARNING: Expected ${expectedRecords} but created ${created}`);
  }
  console.log('='.repeat(60));

  console.log('\n📝 Next steps:');
  console.log('   1. Visit your Airtable base to verify the data');
  console.log('   2. Advisors can now customize their schedules by:');
  console.log('      - Modifying StartTime/EndTime for different hours');
  console.log('      - Unchecking "IsActive" to disable specific days');
  console.log('      - Adding days off in the "Advisor Days Off" table');
  console.log('   3. Changes will automatically reflect in the booking system\n');
}

main();
