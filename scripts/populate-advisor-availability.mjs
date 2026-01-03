/**
 * Populate Advisor Availability Script
 *
 * This script populates the Advisor Availability table with default 9 AM - 5 PM
 * availability for both advisors (Heidi Lynn and Illiana) in 30-minute blocks.
 *
 * Total records created: 160
 * - 5 days (Mon-Fri) × 16 time slots (09:00-16:30) × 2 advisors = 160 records
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

const TABLE_NAME = 'Advisor Availability';
const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

const CONSULTANTS = ['Heidi Lynn', 'Illiana'];
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

/**
 * Generate 30-minute time slots from 9 AM to 5 PM
 * Slots: 09:00, 09:30, 10:00, ..., 16:00, 16:30
 * (16:30 is last slot, allows 30-min booking until 5 PM)
 */
function generateTimeSlots() {
  const slots = [];
  const startHour = 9;  // 9 AM
  const endHour = 17;   // 5 PM (17:00 in 24h format)

  for (let hour = startHour; hour < endHour; hour++) {
    // Add :00 slot
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    // Add :30 slot
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  return slots;
}

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
 * Generate all availability records for both advisors
 */
function generateAllRecords() {
  const records = [];
  const timeSlots = generateTimeSlots();
  const now = new Date().toISOString();

  for (const consultant of CONSULTANTS) {
    for (const day of DAYS_OF_WEEK) {
      for (const timeSlot of timeSlots) {
        records.push({
          Consultant: consultant,
          DayOfWeek: day,
          TimeSlot: timeSlot,
          IsAvailable: true,  // All slots available by default
          CreatedAt: now,
          Notes: 'Default 9-5 schedule'
        });
      }
    }
  }

  return records;
}

async function main() {
  console.log('🚀 Starting Advisor Availability Population...\n');
  console.log(`Base ID: ${AIRTABLE_BASE_ID}`);
  console.log(`Table: ${TABLE_NAME}`);

  console.log('\n📊 Generation Summary:');
  console.log(`   - Consultants: ${CONSULTANTS.join(', ')}`);
  console.log(`   - Days: ${DAYS_OF_WEEK.join(', ')}`);
  console.log(`   - Time Slots: 09:00 - 16:30 (30-minute blocks)`);

  const timeSlots = generateTimeSlots();
  console.log(`   - Slots per day: ${timeSlots.length}`);

  const expectedRecords = CONSULTANTS.length * DAYS_OF_WEEK.length * timeSlots.length;
  console.log(`   - Expected total: ${expectedRecords} records`);

  const records = generateAllRecords();
  console.log(`\n✅ Generated ${records.length} availability records`);

  const created = await createAvailabilityRecords(records);

  console.log('\n' + '='.repeat(60));
  if (created === expectedRecords) {
    console.log('✨ SUCCESS! All availability records created');
  } else {
    console.log(`⚠️  WARNING: Expected ${expectedRecords} but created ${created}`);
  }
  console.log('='.repeat(60));

  console.log('\n📝 Next steps:');
  console.log('   1. Visit your Airtable base to verify the data');
  console.log('   2. Both advisors now have 9 AM - 5 PM availability (Mon-Fri)');
  console.log('   3. Advisors can customize their schedules by:');
  console.log('      - Unchecking "IsAvailable" for unavailable time slots');
  console.log('      - Adding days off in the "Advisor Days Off" table');
  console.log('   4. Changes will automatically reflect in the booking system\n');
}

main();
