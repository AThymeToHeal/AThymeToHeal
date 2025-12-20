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

async function verifyAndFixContactFields() {
  console.log('🔧 Checking Contact table fields...\n');

  try {
    // Get Contact table metadata
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

    // Try both 'contact' and 'Contact' table names
    let contactTable = schemaData.tables.find((t) => t.name === 'contact');
    if (!contactTable) {
      contactTable = schemaData.tables.find((t) => t.name === 'Contact');
    }

    if (!contactTable) {
      throw new Error('Contact table not found in base');
    }

    console.log(`✓ Found Contact table (ID: ${contactTable.id})`);
    console.log(`  Current name: "${contactTable.name}"\n`);

    // Check existing fields
    console.log('Current fields:');
    contactTable.fields.forEach((field) => {
      console.log(`  - ${field.name} (${field.type})`);
    });
    console.log();

    // Define required fields based on the contact form
    const requiredFields = [
      { name: 'FirstName', type: 'singleLineText' },
      { name: 'LastName', type: 'singleLineText' },
      { name: 'Email', type: 'email' },
      { name: 'Phone', type: 'phoneNumber' },
      { name: 'Subject', type: 'singleLineText' },
      { name: 'Message', type: 'multilineText' },
      { name: 'Source', type: 'singleLineText' },
      {
        name: 'DateCreated',
        type: 'dateTime',
        options: {
          dateFormat: { name: 'iso', format: 'YYYY-MM-DD' },
          timeFormat: { name: '24hour', format: 'HH:mm' },
          timeZone: 'utc',
        },
      },
    ];

    // Check which fields are missing
    const missingFields = [];
    for (const requiredField of requiredFields) {
      const exists = contactTable.fields.find((f) => f.name === requiredField.name);
      if (!exists) {
        missingFields.push(requiredField);
      }
    }

    if (missingFields.length === 0) {
      console.log('✅ All required fields exist in Contact table\n');
      return;
    }

    console.log(`⚠️  Missing ${missingFields.length} fields:\n`);
    missingFields.forEach((field) => {
      console.log(`  - ${field.name} (${field.type})`);
    });
    console.log();

    // Add missing fields
    console.log('Adding missing fields...\n');
    const addFieldUrl = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables/${contactTable.id}/fields`;

    for (const field of missingFields) {
      console.log(`  Adding ${field.name}...`);
      const payload = {
        name: field.name,
        type: field.type,
      };
      if (field.options) {
        payload.options = field.options;
      }
      const fieldResponse = await fetch(addFieldUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!fieldResponse.ok) {
        const error = await fieldResponse.json();
        console.error(`  ❌ Failed to add ${field.name}: ${JSON.stringify(error)}`);
      } else {
        console.log(`  ✓ Added ${field.name}`);
      }
    }

    console.log('\n✅ Contact table fields updated successfully\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
verifyAndFixContactFields();
