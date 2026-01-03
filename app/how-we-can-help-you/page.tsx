import type { Metadata } from 'next';
import Booking from '../components/Booking';
import type { ServiceType } from '@/lib/airtable';

export const metadata: Metadata = {
  title: 'Services & Pricing - A Thyme To Heal',
  description: 'Explore our personalized holistic consults including free consultations, Essential Emotions sessions, and Symphony of Cells treatments.',
};

export default function ServicesPage() {
  const services = [
    {
      title: 'Free Consult',
      description: 'A consultation with one of our coaches to start you on your health journey.',
      duration: '40 minute',
      price: '0',
      note: 'Services offered by both our coaches',
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

      {/* Services Grid */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-6xl">
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

                {/* Service Body */}
                <div className="p-6 flex-grow flex flex-col">
                  <p className="text-brown mb-6 flex-grow">
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

      {/* Additional Info Section */}
      <section className="py-16 px-4 bg-secondary">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
            Ready to Begin Your Healing Journey?
          </h2>
          <p className="text-lg mb-8 text-brown">
            All services are offered by both our coaches and can be scheduled in-person or virtually to accommodate your needs.
          </p>
          <Booking />
        </div>
      </section>
    </div>
  );
}
