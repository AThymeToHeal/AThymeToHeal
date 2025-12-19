/**
 * List all tables in the Airtable base
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

async function listTables() {
  try {
    console.log('📋 Fetching tables from Airtable...\n');

    const response = await fetch(META_API_URL, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tables');
    }

    const data = await response.json();

    console.log(`Found ${data.tables.length} tables:\n`);

    data.tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.name}`);
      console.log(`   ID: ${table.id}`);
      console.log(`   Fields: ${table.fields?.length || 0}`);
      if (table.fields && table.fields.length > 0) {
        console.log(`   Field names: ${table.fields.map(f => f.name).join(', ')}`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

listTables();
