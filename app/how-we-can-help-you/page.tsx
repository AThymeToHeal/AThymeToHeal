import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How We Can Help You - Services | A Thyme to Heal LLC',
  description: 'Explore our herbal remedies and wellness services including consultations, custom blends, wellness coaching, and educational workshops.',
};

export default function ServicesPage() {
  const services = [
    {
      id: 1,
      icon: '🌿',
      title: 'Herbal Consultations',
      description: 'One-on-one personalized consultations to identify the perfect herbal remedies for your unique wellness needs.',
      benefits: [
        'Comprehensive health assessment',
        'Personalized herbal recommendations',
        'Ongoing support and guidance',
        'Natural approach to wellness',
      ],
      duration: '60 minutes',
      price: 'Starting at $85',
    },
    {
      id: 2,
      icon: '🍵',
      title: 'Custom Herbal Blends',
      description: 'Expertly crafted herbal blends tailored specifically to support your individual health and wellness goals.',
      benefits: [
        'Personalized formulations',
        'High-quality organic ingredients',
        'Sustainable and ethical sourcing',
        'Custom tea blends and tinctures',
      ],
      duration: 'Varies',
      price: 'Starting at $25',
    },
    {
      id: 3,
      icon: '💚',
      title: 'Wellness Coaching',
      description: 'Holistic health guidance combining herbal remedies with lifestyle changes to achieve optimal wellness.',
      benefits: [
        'Goal setting and action plans',
        'Nutritional guidance',
        'Stress management techniques',
        'Sustainable lifestyle changes',
      ],
      duration: '45-60 minutes',
      price: 'Starting at $95',
    },
    {
      id: 4,
      icon: '📚',
      title: 'Educational Workshops',
      description: 'Engaging and informative workshops teaching you about the healing power of herbs and natural remedies.',
      benefits: [
        'Hands-on learning experiences',
        'Expert instruction',
        'Take-home materials',
        'Community connection',
      ],
      duration: '2-3 hours',
      price: 'Starting at $45',
    },
    {
      id: 5,
      icon: '🎁',
      title: 'Wellness Gift Packages',
      description: 'Thoughtfully curated gift sets featuring our finest herbal products and wellness items.',
      benefits: [
        'Beautiful presentation',
        'Variety of products',
        'Perfect for any occasion',
        'Customization available',
      ],
      duration: 'N/A',
      price: 'Starting at $35',
    },
  ];

  const faqs = [
    {
      question: 'How do I get started?',
      answer: 'Simply contact us to schedule your initial consultation. We\'ll discuss your health goals and create a personalized plan for you.',
    },
    {
      question: 'Are your products safe?',
      answer: 'Yes, we use only high-quality, organic herbs from reputable sources. However, we always recommend consulting with your healthcare provider before starting any new herbal regimen.',
    },
    {
      question: 'Do you offer virtual consultations?',
      answer: 'Yes! We offer both in-person and virtual consultations to accommodate your preferences and schedule.',
    },
    {
      question: 'What can I expect during a consultation?',
      answer: 'During your consultation, we\'ll discuss your health history, current concerns, and wellness goals. We\'ll then create a personalized herbal protocol tailored to your needs.',
    },
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-secondary py-16 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-accent">
            How We Can Help You
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            Discover our range of natural wellness services designed to support your journey to optimal health.
          </p>
        </div>
      </section>

      {/* Services Introduction */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
            Our Services
          </h2>
          <p className="text-lg text-brown mb-8">
            At A Thyme to Heal, we believe in the power of nature to support your body&apos;s natural healing processes.
            Our comprehensive range of services combines traditional herbal wisdom with modern wellness practices.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-8 px-4">
        <div className="mx-auto max-w-7xl space-y-12">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${
                index % 2 === 0 ? '' : 'lg:grid-flow-dense'
              }`}
            >
              {/* Service Icon/Image */}
              <div
                className={`flex items-center justify-center bg-sage/10 rounded-lg p-12 border border-taupe ${
                  index % 2 === 0 ? '' : 'lg:col-start-2'
                }`}
              >
                <div className="text-9xl">{service.icon}</div>
              </div>

              {/* Service Details */}
              <div className={index % 2 === 0 ? '' : 'lg:col-start-1 lg:row-start-1'}>
                <h3 className="text-2xl md:text-3xl font-serif font-bold mb-4 text-primary">
                  {service.title}
                </h3>
                <p className="text-lg text-brown mb-6">{service.description}</p>

                <h4 className="font-semibold text-primary mb-3">Benefits:</h4>
                <ul className="space-y-2 mb-6">
                  {service.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-sage mr-2 mt-1">✓</span>
                      <span className="text-brown">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="bg-secondary px-4 py-2 rounded-md border border-taupe">
                    <span className="text-sm text-brown">
                      <strong>Duration:</strong> {service.duration}
                    </span>
                  </div>
                  <div className="bg-secondary px-4 py-2 rounded-md border border-taupe">
                    <span className="text-sm text-brown">
                      <strong>Investment:</strong> {service.price}
                    </span>
                  </div>
                </div>

                <Link
                  href="/contact"
                  className="inline-block px-6 py-3 bg-primary text-secondary font-semibold rounded-md hover:bg-primary/90 transition-colors"
                >
                  Book This Service
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-secondary">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-center text-primary">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-taupe">
                <h3 className="text-lg font-semibold mb-2 text-primary">
                  {faq.question}
                </h3>
                <p className="text-brown">{faq.answer}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/faq"
              className="inline-block px-6 py-3 bg-primary text-secondary font-semibold rounded-md hover:bg-primary/90 transition-colors"
            >
              View All FAQs
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
            Ready to Start Your Wellness Journey?
          </h2>
          <p className="text-lg mb-8 text-brown">
            Schedule a consultation today and discover how herbal remedies can transform your health and wellness.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-3 bg-primary text-secondary font-semibold rounded-md hover:bg-primary/90 transition-colors text-lg"
            >
              Schedule Consultation
            </Link>
            <Link
              href="/about-us"
              className="px-8 py-3 bg-transparent border-2 border-primary text-primary font-semibold rounded-md hover:bg-primary/10 transition-colors text-lg"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
