import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID in .env.local');
  process.exit(1);
}

async function getTableId(tableName) {
  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
    {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch tables: ${response.statusText}`);
  }

  const data = await response.json();
  const table = data.tables.find((t) => t.name === tableName);

  if (!table) {
    throw new Error(`Table "${tableName}" not found`);
  }

  return table.id;
}

async function addFieldToTable(tableId, field) {
  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables/${tableId}/fields`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(field),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to add field "${field.name}": ${response.statusText} - ${error}`);
  }

  return await response.json();
}

async function main() {
  try {
    console.log('Adding field to Contact table...\n');

    // Add field to Contact table
    const contactTableId = await getTableId('Contact');

    const contactField = {
      name: 'Subject',
      type: 'singleLineText',
    };

    await addFieldToTable(contactTableId, contactField);
    console.log('✓ Added field: Subject to Contact table\n');

    console.log('✅ Subject field added successfully!');
    console.log('\nNote: Booked table fields (ServiceType, Consultant, Duration, Price) were already added.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
