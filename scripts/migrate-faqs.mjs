/**
 * FAQ Migration Script
 *
 * This script migrates hardcoded FAQs from /app/faq/page.tsx to Airtable.
 *
 * Usage:
 * 1. Ensure FAQs table is created in Airtable
 * 2. Run: npm run migrate-faqs
 */

import Airtable from 'airtable';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
config({ path: join(__dirname, '..', '.env.local') });

// Initialize Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID in .env.local');
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// FAQ data from /app/faq/page.tsx
const faqs = [
  // Products & Remedies
  {
    question: 'What types of herbal products do you offer?',
    answer: 'We offer a wide range of herbal products including custom tea blends, tinctures, salves, herbal capsules, and wellness kits. Each product is crafted using high-quality, organic herbs tailored to support various health needs.',
    category: 'Products',
    order: 1,
  },
  {
    question: 'Are your herbal products safe?',
    answer: 'Yes, we use only high-quality, organic herbs from reputable suppliers. However, we always recommend consulting with your healthcare provider before starting any new herbal regimen, especially if you are pregnant, nursing, taking medications, or have existing health conditions.',
    category: 'Products',
    order: 2,
  },
  {
    question: 'How do I store my herbal products?',
    answer: 'Most herbal products should be stored in a cool, dry place away from direct sunlight. Tinctures typically have a shelf life of 3-5 years, while dried herbs and teas are best used within 1-2 years. Specific storage instructions will be provided with each product.',
    category: 'Products',
    order: 3,
  },
  {
    question: 'Can I take herbal remedies with my current medications?',
    answer: 'Some herbs can interact with medications, so it\'s essential to consult with your healthcare provider before combining herbal remedies with prescription medications. During your consultation, we\'ll discuss any potential interactions.',
    category: 'Products',
    order: 4,
  },

  // Services & Consultations
  {
    question: 'What happens during a consultation?',
    answer: 'During your consultation, we\'ll discuss your health history, current concerns, wellness goals, and lifestyle. We\'ll then create a personalized herbal protocol tailored to your needs, including recommended herbs, dosages, and lifestyle suggestions.',
    category: 'Services',
    order: 5,
  },
  {
    question: 'Do you offer virtual consultations?',
    answer: 'Yes! We offer both in-person and virtual consultations via video call to accommodate your preferences and schedule. Virtual consultations are just as comprehensive as in-person sessions.',
    category: 'Services',
    order: 6,
  },
  {
    question: 'How long does a consultation take?',
    answer: 'Initial consultations typically last 60 minutes, while follow-up sessions are usually 30-45 minutes. We want to ensure we have enough time to thoroughly understand your needs and create an effective wellness plan.',
    category: 'Services',
    order: 7,
  },
  {
    question: 'Do you offer follow-up support?',
    answer: 'Absolutely! We provide ongoing support to help you achieve your wellness goals. Follow-up consultations allow us to assess your progress, adjust your protocol as needed, and answer any questions that arise.',
    category: 'Services',
    order: 8,
  },
  {
    question: 'Can you help with specific health conditions?',
    answer: 'We work with a wide range of health concerns including digestive issues, stress and anxiety, sleep problems, immune support, hormonal balance, and more. However, we are not medical doctors and do not diagnose, treat, or cure diseases. We support your body\'s natural healing processes.',
    category: 'Services',
    order: 9,
  },

  // Orders & Shipping
  {
    question: 'How do I place an order?',
    answer: 'You can place an order by contacting us directly through our contact form, phone, or email. After your consultation, we\'ll help you select the right products and guide you through the ordering process.',
    category: 'Orders',
    order: 10,
  },
  {
    question: 'What are your shipping options?',
    answer: 'We offer standard shipping (5-7 business days) and expedited shipping (2-3 business days) within the United States. International shipping may be available upon request. Shipping costs are calculated based on your location and order size.',
    category: 'Orders',
    order: 11,
  },
  {
    question: 'When will my order arrive?',
    answer: 'Orders are typically processed within 1-2 business days. Standard shipping takes 5-7 business days, while expedited shipping takes 2-3 business days. You\'ll receive a tracking number once your order ships.',
    category: 'Orders',
    order: 12,
  },
  {
    question: 'Do you offer local pickup?',
    answer: 'Yes, local pickup is available by appointment. This option allows you to save on shipping costs and receive your products immediately.',
    category: 'Orders',
    order: 13,
  },

  // Returns & Refunds
  {
    question: 'What is your return policy?',
    answer: 'We want you to be completely satisfied with your purchase. If you\'re not happy with a product, please contact us within 30 days of receipt. Unopened products in original packaging can be returned for a full refund. Custom blends and opened products cannot be returned due to their personalized nature.',
    category: 'Returns',
    order: 14,
  },
  {
    question: 'How long does it take to process a refund?',
    answer: 'Refunds are typically processed within 5-7 business days after we receive your returned product. You\'ll receive an email confirmation once the refund has been issued.',
    category: 'Returns',
    order: 15,
  },
  {
    question: 'What if my product arrives damaged?',
    answer: 'We take great care in packaging our products, but if something arrives damaged, please contact us immediately with photos. We\'ll send a replacement or issue a full refund right away.',
    category: 'Returns',
    order: 16,
  },

  // Payment & Pricing
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), debit cards, and PayPal. Payment is required at the time of consultation booking or product purchase.',
    category: 'Payment',
    order: 17,
  },
  {
    question: 'Do you offer payment plans?',
    answer: 'For certain services and larger orders, we may offer payment plans on a case-by-case basis. Please contact us to discuss your specific needs.',
    category: 'Payment',
    order: 18,
  },
  {
    question: 'Are your prices negotiable?',
    answer: 'Our prices reflect the high quality of our products and personalized service. While prices are generally fixed, we occasionally offer package deals and seasonal promotions. Subscribe to our newsletter to stay informed about special offers.',
    category: 'Payment',
    order: 19,
  },

  // Workshops & Education
  {
    question: 'Do you offer workshops or classes?',
    answer: 'Yes! We regularly host workshops on various herbal topics including tea blending, making herbal remedies, herb identification, and seasonal wellness. Check our website or subscribe to our newsletter for upcoming workshop dates.',
    category: 'Workshops',
    order: 20,
  },
  {
    question: 'Are workshops suitable for beginners?',
    answer: 'Absolutely! Our workshops are designed for all experience levels, from complete beginners to seasoned herbalists. We create a welcoming, supportive learning environment for everyone.',
    category: 'Workshops',
    order: 21,
  },
];

async function migrateFAQs() {
  console.log('🚀 Starting FAQ migration...\n');

  try {
    // Create records in batches of 10 (Airtable limit)
    const batchSize = 10;
    let created = 0;

    for (let i = 0; i < faqs.length; i += batchSize) {
      const batch = faqs.slice(i, i + batchSize);

      const records = batch.map((faq) => ({
        fields: {
          Question: faq.question,
          Answer: faq.answer,
          Category: faq.category,
          Order: faq.order,
          ClickCount: 0,
        },
      }));

      await base('FAQs').create(records);
      created += records.length;
      console.log(`✅ Created ${created}/${faqs.length} FAQs`);
    }

    console.log(`\n🎉 Success! Migrated ${created} FAQs to Airtable.`);
    console.log('\nNext steps:');
    console.log('1. Check Airtable to verify all FAQs were created');
    console.log('2. The website will now fetch FAQs from Airtable');
    console.log('3. You can edit FAQs directly in Airtable');

  } catch (error) {
    console.error('❌ Error migrating FAQs:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    process.exit(1);
  }
}

// Run migration
migrateFAQs();
