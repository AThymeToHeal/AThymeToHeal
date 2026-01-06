/**
 * Delete Advisor Availability Table Script
 *
 * This script deletes the existing Advisor Availability table to allow
 * recreation with the new schema.
 *
 * ⚠️ WARNING: This will permanently delete the table and all its data!
 *
 * Usage:
 * 1. Ensure AIRTABLE_API_KEY and AIRTABLE_BASE_ID are set in .env.local
 * 2. Run: node scripts/delete-advisor-availability-table.mjs
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

const BASE_URL = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`;

async function getTableId(tableName) {
  try {
    const response = await fetch(BASE_URL, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Failed to fetch tables:', error);
      return null;
    }

    const data = await response.json();
    const table = data.tables.find(t => t.name === tableName);

    return table ? table.id : null;
  } catch (error) {
    console.error('❌ Error fetching table ID:', error);
    return null;
  }
}

async function deleteTable(tableId) {
  try {
    const response = await fetch(`${BASE_URL}/${tableId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Failed to delete table:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error deleting table:', error);
    return false;
  }
}

async function main() {
  const tableName = 'Advisor Availability';

  console.log('🗑️  Deleting Advisor Availability Table...\n');
  console.log(`Base ID: ${AIRTABLE_BASE_ID}`);
  console.log(`Table: ${tableName}\n`);

  console.log('⚠️  WARNING: This will permanently delete the table and all its data!');
  console.log('Proceeding in 2 seconds...\n');

  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('🔍 Finding table ID...');
  const tableId = await getTableId(tableName);

  if (!tableId) {
    console.log('\n❌ Table not found. It may have already been deleted.');
    console.log('You can proceed to create the new table with:');
    console.log('   npm run create-advisor-tables\n');
    process.exit(0);
  }

  console.log(`✅ Found table: ${tableName} (ID: ${tableId})\n`);

  console.log('🗑️  Deleting table...');
  const success = await deleteTable(tableId);

  console.log('\n' + '='.repeat(60));
  if (success) {
    console.log('✅ SUCCESS! Table deleted');
    console.log('='.repeat(60));
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npm run create-advisor-tables');
    console.log('   2. Run: npm run populate-advisor-availability');
    console.log('   3. Verify new table structure in Airtable\n');
  } else {
    console.log('❌ FAILED to delete table');
    console.log('='.repeat(60));
    console.log('\nPlease check the error above and try again.\n');
    process.exit(1);
  }
}

main();
