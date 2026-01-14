import type { Metadata } from 'next';
import Booking from '../components/Booking';
import type { ServiceType } from '@/lib/airtable';

export const metadata: Metadata = {
  title: 'Services & Pricing - A Thyme To Heal',
  description: 'Explore our personalized holistic consults including consultations, Essential Emotions sessions, and Symphony of Cells treatments.',
};

export default function ServicesPage() {
  const services = [
    {
      title: 'Health Consult',
      description: 'A consultation with one of our wellness guides to start you on your health journey.',
      duration: '30 minutes',
      price: '30',
      note: 'Services offered by both our wellness guides',
    },
    {
      title: 'Symphony of Cells',
      description: 'A technique using essential oils and therapeutic massage that helps bodies detox and heal. Experience relief and freedom from pain in our cozy, relaxing healing clinic.',
      duration: '30 minutes',
      price: '45',
    },
    {
      title: 'Essential Emotions',
      description: 'Often our physical pain is manifestation of emotional roots. Begin the journey of identifying emotions and creating new neuropathways in your brain with an Essential Emotions session.',
      duration: '1 hr',
      price: '60',
    },
  ];

  const bundles = [
    {
      title: 'Tier 1 — Back to Basics',
      duration: '6 weeks',
      price: '350',
      paymentOptions: 'Optional split: $175 upfront + $175 halfway',
      tagline: 'This is your gentle first step into consistent health. Perfect if you&apos;re feeling overwhelmed or unsure where to start.',
      included: [
        'Intake + follow-up consults',
        '6 Symphony of Cells sessions (1 per week)',
        'Personalized supplement guidance (purchased separately)',
      ],
      whoFor: [
        'New to wellness work',
        'Want simple, structured habits',
        'Looking for foundational support without overwhelm',
      ],
      outcome: 'Build a strong, nourished foundation for your body and mind, with tools to support your daily habits.',
    },
    {
      title: 'Tier 2 — A Thyme to Heal',
      duration: '8 weeks',
      price: '699',
      paymentOptions: 'Full upfront recommended',
      tagline: 'This is your integrated, next-level container. Combine emotional work, body support, and lifestyle guidance to create lasting change.',
      included: [
        'Intake + follow-up consults',
        'A 90 day reset in the beginning to start off with clean slate',
        '4 Essential Emotions sessions (2 per month)',
        '4 Symphony of Cells sessions (bi-weekly)',
        'Meal + movement guides',
        'Weekly text/email check-ins',
        'Personalized supplement guidance (purchased separately)',
      ],
      whoFor: [
        'Ready to address both physical and emotional patterns',
        'Want guidance beyond supplements',
        'Open to consistent support and habit-building',
      ],
      outcome: 'Transform your daily routines, regulate your emotions, and create balanced, sustainable practices that support your health and energy.',
    },
    {
      title: 'Tier 3 — Deep Roots Healing',
      duration: '10 weeks',
      price: '2,000',
      paymentOptions: 'Full upfront',
      tagline: 'This is your intensive, highly personalized program for complex or layered health challenges.',
      included: [
        'Intake + follow-up consults',
        '5 Essential Emotions sessions (every 2 weeks)',
        '10 Symphony of Cells sessions (weekly)',
        'Weekly check-ins and priority messaging',
        'Advanced lifestyle and health protocols',
        'Personalized supplement guidance (purchased separately)',
      ],
      whoFor: [
        'Chronic or complex health concerns',
        'Digestive or layered emotional/physical challenges',
        'Those needing close monitoring and advanced guidance',
      ],
      outcome: 'Deep, guided transformation that supports long-term health, emotional regulation, and holistic wellness.',
    },
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-secondary py-16 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-accent">
            <span className="font-script">A Thyme to Heal</span>: Services & Pricing
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            We offer personalized holistic consults tailored to your needs. Explore our services and choose the option that works best for you
          </p>
        </div>
      </section>

      {/* Individual Services Grid */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-primary text-center">
            Individual Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg border border-taupe overflow-hidden flex flex-col"
              >
                {/* Service Header */}
                <div className="bg-sage/20 p-6 border-b border-taupe">
                  <h3 className="text-2xl font-serif font-bold text-primary text-center mb-2">
                    {service.title}
                  </h3>
                  {service.note && (
                    <p className="text-xs text-brown text-center italic">
                      {service.note}
                    </p>
                  )}
                </div>

                {/* Service Body - Centered Text */}
                <div className="p-6 flex-grow flex flex-col justify-center items-center">
                  <p className="text-brown mb-6 text-center">
                    {service.description}
                  </p>

                  {/* Duration */}
                  <div className="mb-4">
                    <p className="text-sm text-brown text-center">
                      {service.duration}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <p className="text-4xl font-bold text-primary text-center">
                      ${service.price}
                    </p>
                  </div>

                  {/* Book Button */}
                  <div className="text-center">
                    <Booking buttonText="Book now" defaultServiceType={service.title as ServiceType} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bundle Packages Section */}
      <section className="py-16 px-4 bg-sage/10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-primary text-center">
            Bundle Packages
          </h2>
          <p className="text-lg text-brown text-center mb-12 max-w-3xl mx-auto">
            Comprehensive wellness programs designed to support your healing journey with integrated care and consistent guidance.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {bundles.map((bundle, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg border border-taupe overflow-hidden flex flex-col"
              >
                {/* Bundle Header */}
                <div className="bg-primary text-secondary p-6 border-b border-taupe">
                  <h3 className="text-2xl font-serif font-bold text-accent text-center mb-2">
                    {bundle.title}
                  </h3>
                  <p className="text-sm text-center text-secondary/90">
                    {bundle.duration}
                  </p>
                </div>

                {/* Bundle Body */}
                <div className="p-6 flex-grow flex flex-col">
                  {/* Price */}
                  <div className="text-center mb-4">
                    <p className="text-4xl font-bold text-primary">
                      ${bundle.price}
                    </p>
                    <p className="text-xs text-brown mt-1 italic">
                      {bundle.paymentOptions}
                    </p>
                  </div>

                  {/* Tagline */}
                  <p className="text-brown text-center mb-6 italic">
                    {bundle.tagline}
                  </p>

                  {/* What's Included */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-primary mb-3">What&apos;s included:</h4>
                    <ul className="space-y-2">
                      {bundle.included.map((item, idx) => (
                        <li key={idx} className="flex items-start text-sm text-brown">
                          <svg className="w-5 h-5 text-accent mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Who It's For */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-primary mb-3">Who it&apos;s for:</h4>
                    <ul className="space-y-2">
                      {bundle.whoFor.map((item, idx) => (
                        <li key={idx} className="flex items-start text-sm text-brown">
                          <svg className="w-5 h-5 text-accent mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Outcome */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-primary mb-2">Outcome:</h4>
                    <p className="text-sm text-brown">
                      {bundle.outcome}
                    </p>
                  </div>

                  {/* Book Button */}
                  <div className="text-center mt-auto">
                    <Booking buttonText="Book Intake Consultation" defaultServiceType={bundle.title as ServiceType} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="py-16 px-4 bg-secondary">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
            Ready to Begin Your Healing Journey?
          </h2>
          <p className="text-lg mb-8 text-brown">
            All services are offered by both our wellness guides and can be scheduled in-person or virtually to accommodate your needs.
          </p>
          <Booking />
        </div>
      </section>
    </div>
  );
}
