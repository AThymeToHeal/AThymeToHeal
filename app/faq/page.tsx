import FAQAccordion from '../components/FAQAccordion';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions | A Thyme to Heal',
  description: 'Find answers to common questions about our herbal remedies, consultations, products, and services.',
};

async function getFAQs() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/faqs`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!res.ok) {
      throw new Error('Failed to fetch FAQs');
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    // Return fallback FAQs if Airtable fetch fails
    return fallbackFAQs;
  }
}

// Fallback FAQs (in case Airtable is not set up yet)
const fallbackFAQs = [
    // Products & Remedies
    {
      question: 'What types of herbal products do you offer?',
      answer: 'We offer a wide range of herbal products including custom tea blends, tinctures, salves, herbal capsules, and wellness kits. Each product is crafted using high-quality, organic herbs tailored to support various health needs.',
      category: 'Products',
    },
    {
      question: 'Are your herbal products safe?',
      answer: 'Yes, we use only high-quality, organic herbs from reputable suppliers. However, we always recommend consulting with your healthcare provider before starting any new herbal regimen, especially if you are pregnant, nursing, taking medications, or have existing health conditions.',
      category: 'Products',
    },
    {
      question: 'How do I store my herbal products?',
      answer: 'Most herbal products should be stored in a cool, dry place away from direct sunlight. Tinctures typically have a shelf life of 3-5 years, while dried herbs and teas are best used within 1-2 years. Specific storage instructions will be provided with each product.',
      category: 'Products',
    },
    {
      question: 'Can I take herbal remedies with my current medications?',
      answer: 'Some herbs can interact with medications, so it\'s essential to consult with your healthcare provider before combining herbal remedies with prescription medications. During your consultation, we\'ll discuss any potential interactions.',
      category: 'Products',
    },

    // Services & Consultations
    {
      question: 'What happens during a consultation?',
      answer: 'During your consultation, we\'ll discuss your health history, current concerns, wellness goals, and lifestyle. We\'ll then create a personalized herbal protocol tailored to your needs, including recommended herbs, dosages, and lifestyle suggestions.',
      category: 'Services',
    },
    {
      question: 'Do you offer virtual consultations?',
      answer: 'Yes! We offer both in-person and virtual consultations via video call to accommodate your preferences and schedule. Virtual consultations are just as comprehensive as in-person sessions.',
      category: 'Services',
    },
    {
      question: 'How long does a consultation take?',
      answer: 'Initial consultations typically last 60 minutes, while follow-up sessions are usually 30-45 minutes. We want to ensure we have enough time to thoroughly understand your needs and create an effective wellness plan.',
      category: 'Services',
    },
    {
      question: 'Do you offer follow-up support?',
      answer: 'Absolutely! We provide ongoing support to help you achieve your wellness goals. Follow-up consultations allow us to assess your progress, adjust your protocol as needed, and answer any questions that arise.',
      category: 'Services',
    },
    {
      question: 'Can you help with specific health conditions?',
      answer: 'We work with a wide range of health concerns including digestive issues, stress and anxiety, sleep problems, immune support, hormonal balance, and more. However, we are not medical doctors and do not diagnose, treat, or cure diseases. We support your body\'s natural healing processes.',
      category: 'Services',
    },

    // Orders & Shipping
    {
      question: 'How do I place an order?',
      answer: 'You can place an order by contacting us directly through our contact form, phone, or email. After your consultation, we\'ll help you select the right products and guide you through the ordering process.',
      category: 'Orders',
    },
    {
      question: 'What are your shipping options?',
      answer: 'We offer standard shipping (5-7 business days) and expedited shipping (2-3 business days) within the United States. International shipping may be available upon request. Shipping costs are calculated based on your location and order size.',
      category: 'Orders',
    },
    {
      question: 'When will my order arrive?',
      answer: 'Orders are typically processed within 1-2 business days. Standard shipping takes 5-7 business days, while expedited shipping takes 2-3 business days. You\'ll receive a tracking number once your order ships.',
      category: 'Orders',
    },
    {
      question: 'Do you offer local pickup?',
      answer: 'Yes, local pickup is available by appointment. This option allows you to save on shipping costs and receive your products immediately.',
      category: 'Orders',
    },

    // Returns & Refunds
    {
      question: 'What is your return policy?',
      answer: 'We want you to be completely satisfied with your purchase. If you\'re not happy with a product, please contact us within 30 days of receipt. Unopened products in original packaging can be returned for a full refund. Custom blends and opened products cannot be returned due to their personalized nature.',
      category: 'Returns',
    },
    {
      question: 'How long does it take to process a refund?',
      answer: 'Refunds are typically processed within 5-7 business days after we receive your returned product. You\'ll receive an email confirmation once the refund has been issued.',
      category: 'Returns',
    },
    {
      question: 'What if my product arrives damaged?',
      answer: 'We take great care in packaging our products, but if something arrives damaged, please contact us immediately with photos. We\'ll send a replacement or issue a full refund right away.',
      category: 'Returns',
    },

    // Payment & Pricing
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), debit cards, and PayPal. Payment is required at the time of consultation booking or product purchase.',
      category: 'Payment',
    },
    {
      question: 'Do you offer payment plans?',
      answer: 'For certain services and larger orders, we may offer payment plans on a case-by-case basis. Please contact us to discuss your specific needs.',
      category: 'Payment',
    },
    {
      question: 'Are your prices negotiable?',
      answer: 'Our prices reflect the high quality of our products and personalized service. While prices are generally fixed, we occasionally offer package deals and seasonal promotions. Subscribe to our newsletter to stay informed about special offers.',
      category: 'Payment',
    },

    // Workshops & Education
    {
      question: 'Do you offer workshops or classes?',
      answer: 'Yes! We regularly host workshops on various herbal topics including tea blending, making herbal remedies, herb identification, and seasonal wellness. Check our website or subscribe to our newsletter for upcoming workshop dates.',
      category: 'Workshops',
    },
    {
      question: 'Are workshops suitable for beginners?',
      answer: 'Absolutely! Our workshops are designed for all experience levels, from complete beginners to seasoned herbalists. We create a welcoming, supportive learning environment for everyone.',
      category: 'Workshops',
    },
  ];

export default async function FAQPage() {
  const faqs = await getFAQs();

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-secondary py-16 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-accent">
            Frequently Asked Questions
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            Find answers to common questions about our herbal remedies, services, and more.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl">
          <FAQAccordion faqs={faqs} />
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4 bg-secondary">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
            Still Have Questions?
          </h2>
          <p className="text-lg mb-8 text-brown">
            We&apos;re here to help! Don&apos;t hesitate to reach out if you need more information or have specific questions about your wellness journey.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 bg-primary text-secondary font-semibold rounded-md hover:bg-primary/90 transition-colors text-lg"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
