/**
 * Sample Testimonials Script
 *
 * This script adds 3 sample testimonials to Airtable.
 *
 * Usage: npm run add-testimonials
 */

import Airtable from 'airtable';
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

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

const testimonials = [
  {
    Name: 'Sarah M.',
    Text: 'A Thyme to Heal transformed my approach to wellness. The custom blends have made such a difference in my daily life!',
    Rating: 5,
    Approved: true,
  },
  {
    Name: 'Michael R.',
    Text: 'The herbal consultation was incredibly insightful. I finally found natural solutions that work for me.',
    Rating: 5,
    Approved: true,
  },
  {
    Name: 'Jennifer L.',
    Text: 'Professional, knowledgeable, and genuinely caring. I highly recommend A Thyme to Heal to anyone seeking natural wellness.',
    Rating: 5,
    Approved: true,
  },
];

async function addTestimonials() {
  console.log('🚀 Adding sample testimonials...\n');

  try {
    const records = testimonials.map((t) => ({ fields: t }));
    await base('Testimonials').create(records);

    console.log(`✅ Created ${testimonials.length} sample testimonials\n`);
    console.log('🎉 Success! Testimonials are now ready.');
    console.log('\nNext steps:');
    console.log('1. Test the website locally: npm run dev');
    console.log('2. Verify testimonials appear on homepage');
    console.log('3. Deploy to Netlify\n');
  } catch (error) {
    console.error('❌ Error adding testimonials:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    process.exit(1);
  }
}

addTestimonials();
