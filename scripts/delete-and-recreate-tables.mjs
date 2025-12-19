/**
 * Delete and Recreate Airtable Tables
 *
 * This script deletes the old tables and recreates them with the correct schema.
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

// Tables to delete (everything except "contact")
const TABLES_TO_DELETE = [
  'Booked',
  'Clients',
  'Newsletter Signups',
  'Testimonials',
  'FAQs',
  'FAQ Clicks',
];

async function getAllTables() {
  try {
    const response = await fetch(META_API_URL, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tables');
    }

    const data = await response.json();
    return data.tables;
  } catch (error) {
    console.error('❌ Error fetching tables:', error);
    return [];
  }
}

async function deleteTable(tableId, tableName) {
  try {
    console.log(`🗑️  Deleting table: ${tableName}...`);
    console.log(`   URL: ${META_API_URL}/${tableId}`);

    const response = await fetch(`${META_API_URL}/${tableId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch (e) {
        error = { message: await response.text() };
      }
      console.error(`❌ Failed to delete ${tableName}:`, error);
      return false;
    }

    console.log(`✅ Deleted table: ${tableName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting ${tableName}:`, error);
    return false;
  }
}

async function deleteTables() {
  console.log('🚀 Starting table deletion process...\n');
  console.log(`Base ID: ${AIRTABLE_BASE_ID}\n`);

  // Get all existing tables
  console.log('📋 Fetching existing tables...');
  const allTables = await getAllTables();
  console.log(`Found ${allTables.length} tables\n`);

  // Show what we found
  console.log('Tables to delete:');
  allTables.forEach(t => {
    if (TABLES_TO_DELETE.includes(t.name)) {
      console.log(`  - ${t.name} (ID: ${t.id})`);
    }
  });
  console.log('');

  // Delete tables that need to be recreated
  let deleteCount = 0;
  for (const tableName of TABLES_TO_DELETE) {
    const table = allTables.find(t => t.name === tableName);

    if (table) {
      console.log(`\nAttempting to delete ${tableName} (ID: ${table.id})...`);
      const success = await deleteTable(table.id, tableName);
      if (success) {
        deleteCount++;
      }
      // Wait a bit between deletions to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log(`⏭️  Table "${tableName}" not found, skipping...`);
    }
  }

  console.log(`\n✅ Deleted ${deleteCount} tables\n`);
  console.log('Note: "contact" and "Contact" tables were preserved\n');
}

// Run the deletion
deleteTables().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
