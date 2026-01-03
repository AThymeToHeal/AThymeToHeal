import { config } from 'dotenv';
import Airtable from 'airtable';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env.local') });

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);

console.log('Querying Advisor Availability for Monday 9-11 AM...\n');

base('Advisor Availability')
  .select({
    filterByFormula: `AND({Consultant} = 'Heidi Lynn', {DayOfWeek} = 'Monday')`,
    sort: [{ field: 'TimeSlot', direction: 'asc' }],
  })
  .all()
  .then((records) => {
    console.log(`Found ${records.length} records for Heidi Lynn on Monday:\n`);

    const nineToEleven = ['09:00', '09:30', '10:00', '10:30'];

    records.forEach((record) => {
      const timeSlot = record.get('TimeSlot');
      const isAvailable = record.get('IsAvailable');
      const inRange = nineToEleven.includes(timeSlot);

      console.log(
        `${timeSlot}: IsAvailable = ${isAvailable ? '✓ CHECKED' : '✗ UNCHECKED'}${
          inRange ? ' ← Should be UNCHECKED' : ''
        }`
      );
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });
