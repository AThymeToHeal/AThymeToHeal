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
  console.error('❌ Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID in environment variables');
  process.exit(1);
}

async function addPhoneFieldToBooked() {
  console.log('🔧 Adding Phone field to Booked table...\n');

  try {
    // Get Booked table metadata to find table ID
    const baseSchemUrl = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`;
    const schemaResponse = await fetch(baseSchemUrl, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    });

    if (!schemaResponse.ok) {
      throw new Error(`Failed to fetch base schema: ${schemaResponse.statusText}`);
    }

    const schemaData = await schemaResponse.json();
    const bookedTable = schemaData.tables.find((t) => t.name === 'Booked');

    if (!bookedTable) {
      throw new Error('Booked table not found in base');
    }

    console.log(`✓ Found Booked table (ID: ${bookedTable.id})\n`);

    // Check if Phone field already exists
    const existingPhoneField = bookedTable.fields.find((f) => f.name === 'Phone');
    if (existingPhoneField) {
      console.log('✓ Phone field already exists in Booked table');
      return;
    }

    // Add Phone field
    const addFieldUrl = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables/${bookedTable.id}/fields`;
    const fieldResponse = await fetch(addFieldUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Phone',
        type: 'phoneNumber',
      }),
    });

    if (!fieldResponse.ok) {
      const error = await fieldResponse.json();
      throw new Error(`Failed to add Phone field: ${JSON.stringify(error)}`);
    }

    console.log('✅ Successfully added Phone field to Booked table\n');
  } catch (error) {
    console.error('❌ Error adding Phone field:', error.message);
    process.exit(1);
  }
}

// Run the script
addPhoneFieldToBooked();
