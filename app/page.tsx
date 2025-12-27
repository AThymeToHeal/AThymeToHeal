import Link from 'next/link';
import Booking from './components/Booking';
import NewsletterSignup from './components/NewsletterSignup';
import TestimonialsCarousel from './components/TestimonialsCarousel';

export default function Home() {
  const services = [
    {
      title: 'Herbal Consultations',
      description: 'Personalized consultations to find the perfect herbal remedies for your unique wellness needs.',
      backgroundImage: '/images/oil-in-hand-image.avif',
    },
    {
      title: 'Custom Blends',
      description: 'Expertly crafted herbal blends tailored to support your health and wellness goals.',
      backgroundImage: '/images/Bowl-of-greens-image.jpg',
    },
    {
      title: 'Wellness Coaching',
      description: 'Holistic guidance to help you achieve optimal health through natural remedies and lifestyle changes.',
      backgroundImage: '/images/Background2.avif',
    },
    {
      title: 'Educational Workshops',
      description: 'Learn about the healing power of herbs through our engaging and informative workshops.',
      backgroundImage: '/images/Tablets-image.jpg',
    },
  ];


  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="bg-primary text-secondary py-20 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-5xl md:text-7xl font-script mb-6 text-accent">
            A Thyme To Heal
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Combining holistic practices with science-based guidance, to help you restore balance and long-term well-being
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/how-we-can-help-you"
              className="px-8 py-3 bg-accent text-primary font-semibold rounded-md hover:bg-accent/90 transition-colors text-lg"
            >
              Explore Our Services
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 bg-transparent border-2 border-secondary text-secondary font-semibold rounded-md hover:bg-secondary/10 transition-colors text-lg"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Services Highlights */}
      <section className="py-16 px-4 bg-secondary">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12 text-primary">
            How We Can Help You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="relative rounded-lg shadow-md hover:shadow-lg transition-shadow border border-taupe overflow-hidden h-80"
                style={{
                  backgroundImage: `url(${service.backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/50"></div>

                {/* Content */}
                <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                  <h3 className="text-xl font-semibold mb-3 text-white">
                    {service.title}
                  </h3>
                  <p className="text-white/90">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/how-we-can-help-you"
              className="inline-block px-6 py-3 bg-primary text-secondary font-semibold rounded-md hover:bg-primary/90 transition-colors"
            >
              Learn More About Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* About Us & Testimonials Section with Background */}
      <section
        className="relative py-16 px-4"
        style={{
          backgroundImage: 'url(/images/Background1.avif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* About Us Introduction */}
          <div className="mx-auto max-w-4xl text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-8 text-white">
              Who is <span className="font-script text-accent">A Thyme To Heal</span>?
            </h2>
            <p className="text-lg md:text-xl leading-relaxed text-white/95 mb-6">
              We are a mom daughter team who have both experienced severe health issues and in the midst, found a world of healing and hope. Now our passion is helping others heal in body, mind, and spirit.
            </p>
            <p className="text-lg md:text-xl leading-relaxed text-white/95">
              Whether dealing with pain born of generational trauma, or deep rooted illness, we are here to offer a variety of natural solutions, health protocols and support. We work individually and as a team depending on the needs of the client. We offer in person and virtual.
            </p>
          </div>

          {/* Testimonials */}
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12 text-white">
              What Our Clients Say
            </h2>
            <TestimonialsCarousel />
          </div>
        </div>
      </section>

      {/* Newsletter Signup CTA */}
      <section className="py-16 px-4 bg-primary text-secondary">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-accent">
            Stay Connected
          </h2>
          <p className="text-lg mb-8">
            Join our community and receive wellness tips, herbal remedies, and exclusive offers delivered to your inbox.
          </p>
          <NewsletterSignup source="Homepage" />
        </div>
      </section>

      {/* Call to Action - Book Free Consultation */}
      <section className="py-16 px-4 bg-secondary">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
            Ready to Begin Your Wellness Journey?
          </h2>
          <p className="text-lg mb-8 text-brown">
            Schedule a free consultation to discover personalized natural solutions for your health and wellness needs.
          </p>
          <Booking />
        </div>
      </section>
    </div>
  );
}
