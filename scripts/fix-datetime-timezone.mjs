/**
 * Update dateAndTime field timezone to America/Denver
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env.local') });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const META_API_URL = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`;

async function getAllTables() {
  const response = await fetch(META_API_URL, {
    headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
  });
  const data = await response.json();
  return data.tables;
}

async function updateFieldTimezone() {
  console.log('🔧 Updating dateAndTime field timezone...\n');

  const tables = await getAllTables();
  const booked = tables.find(t => t.name === 'Booked');

  if (!booked) {
    console.error('❌ Booked table not found');
    return;
  }

  const dateTimeField = booked.fields.find(f => f.name === 'dateAndTime');

  if (!dateTimeField) {
    console.error('❌ dateAndTime field not found');
    return;
  }

  console.log(`Found field: ${dateTimeField.name} (ID: ${dateTimeField.id})`);
  console.log(`Current timezone: ${dateTimeField.options?.timeZone || 'not set'}\n`);

  // Update the field to use America/Denver timezone
  const response = await fetch(`${META_API_URL}/${booked.id}/fields/${dateTimeField.id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'dateTime',
      options: {
        dateFormat: { name: 'us' },
        timeFormat: { name: '12hour' },
        timeZone: 'America/Denver'
      }
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ Failed to update field:', error);
    return;
  }

  console.log('✅ Updated dateAndTime field to display in Mountain Time (America/Denver)');
  console.log('\nNow when you view appointments in Airtable, you\'ll see them in your local time!');
}

updateFieldTimezone();
