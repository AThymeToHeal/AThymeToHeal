/**
 * Add linked record fields between tables
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

async function addLinkedField(tableId, fieldName, linkedTableId) {
  console.log(`🔗 Adding ${fieldName} to table...`);

  const response = await fetch(`${META_API_URL}/${tableId}/fields`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: fieldName,
      type: 'multipleRecordLinks',
      options: { linkedTableId },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(`❌ Failed:`, error);
    return false;
  }

  console.log(`✅ Added ${fieldName}`);
  return true;
}

async function setup() {
  console.log('🔗 Setting up table relationships...\n');

  const tables = await getAllTables();
  const booked = tables.find(t => t.name === 'Booked');
  const clients = tables.find(t => t.name === 'Clients');

  if (booked && clients) {
    await addLinkedField(clients.id, 'BookedRecord', booked.id);
  } else {
    console.error('❌ Could not find Booked or Clients table');
  }

  console.log('\n✅ Done!');
}

setup();
