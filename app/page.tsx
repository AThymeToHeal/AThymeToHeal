import Link from 'next/link';

export default function Home() {
  const services = [
    {
      icon: '🌿',
      title: 'Herbal Consultations',
      description: 'Personalized consultations to find the perfect herbal remedies for your unique wellness needs.',
    },
    {
      icon: '🍵',
      title: 'Custom Blends',
      description: 'Expertly crafted herbal blends tailored to support your health and wellness goals.',
    },
    {
      icon: '💚',
      title: 'Wellness Coaching',
      description: 'Holistic guidance to help you achieve optimal health through natural remedies and lifestyle changes.',
    },
    {
      icon: '📚',
      title: 'Educational Workshops',
      description: 'Learn about the healing power of herbs through our engaging and informative workshops.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      text: 'A Thyme to Heal transformed my approach to wellness. The custom blends have made such a difference in my daily life!',
      rating: 5,
    },
    {
      name: 'Michael R.',
      text: 'The herbal consultation was incredibly insightful. I finally found natural solutions that work for me.',
      rating: 5,
    },
    {
      name: 'Jennifer L.',
      text: 'Professional, knowledgeable, and genuinely caring. I highly recommend A Thyme to Heal to anyone seeking natural wellness.',
      rating: 5,
    },
  ];

  const features = [
    {
      title: 'Natural & Organic',
      description: 'We use only the highest quality, sustainably sourced herbs and ingredients.',
      icon: '🌱',
    },
    {
      title: 'Expert Knowledge',
      description: 'Years of experience in herbal medicine and holistic wellness practices.',
      icon: '🎓',
    },
    {
      title: 'Personalized Care',
      description: 'Every remedy and consultation is tailored to your individual needs.',
      icon: '✨',
    },
  ];

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="bg-primary text-secondary py-20 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-accent">
            Welcome to A Thyme to Heal
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Discover the healing power of nature with our expertly crafted herbal remedies and personalized wellness solutions.
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
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-taupe"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-primary">
                  {service.title}
                </h3>
                <p className="text-brown">{service.description}</p>
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

      {/* What Makes Us Different */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12 text-primary">
            Why Choose A Thyme to Heal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-primary">
                  {feature.title}
                </h3>
                <p className="text-brown">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-sage/20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12 text-primary">
            What Our Clients Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md border border-taupe"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-orange text-xl">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-brown mb-4 italic">&ldquo;{testimonial.text}&rdquo;</p>
                <p className="font-semibold text-primary">- {testimonial.name}</p>
              </div>
            ))}
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
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-md text-brown bg-secondary border border-taupe focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
            <button
              type="submit"
              className="px-8 py-3 bg-accent text-primary font-semibold rounded-md hover:bg-accent/90 transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-secondary">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
            Ready to Begin Your Wellness Journey?
          </h2>
          <p className="text-lg mb-8 text-brown">
            Let us help you discover natural solutions for your health and wellness needs.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 bg-primary text-secondary font-semibold rounded-md hover:bg-primary/90 transition-colors text-lg"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
