import Link from 'next/link';
import Booking from './components/Booking';
import NewsletterSignup from './components/NewsletterSignup';
import TestimonialsCarousel from './components/TestimonialsCarousel';

export default function Home() {
  const services = [
    {
      title: 'Health Consults',
      description: 'A personalized consultation with one of our wellness guides to start you on your health journey',
      backgroundImage: '/home/Bowl-of-greens-image.webp',
    },
    {
      title: 'Symphony of Cells',
      description: 'A technique using plant oils applied on the spine and feet, targeting different body systems and related conditions',
      backgroundImage: '/home/natural-beauty-image.avif',
    },
    {
      title: 'Essential Emotions Sessions',
      description: 'Helping you identify and heal the roots of emotional pain',
      backgroundImage: '/home/essential-emotions.avif',
    },
    {
      title: 'Business Consults',
      description: 'Turn your health journey into a thriving business with personalized guidance and mentorship',
      backgroundImage: '/home/Tablets-image.webp',
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
            Combining kind holistic practices with science based guidance, to help you restore balance and long term health and happiness
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

      {/* WHO We Serve Section with Background Video */}
      <section className="relative py-16 px-4 overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
          poster="/home/main-background.avif"
        >
          <source src="/home/banner-video.webm" type="video/webm" />
          <source src="/home/banner-video.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-white">
            Who This Is For
          </h2>
          <p className="text-lg md:text-xl text-white/95 leading-relaxed mb-6">
            For the woman who feels overwhelmed, exhausted, or unsure where to begin, A Thyme to Heal offers compassionate guidance rooted in nature and science to help you create the life of your dreams.
          </p>
          <p className="text-lg md:text-xl text-white/95 leading-relaxed font-semibold">
            Real support for your body and spirit, rooted in what&apos;s natural and proven. We guide you gently back to balance so you can feel more vibrant, grounded, and in control of your health journey.
          </p>
        </div>
      </section>

      {/* 3-Step Pathway */}
      <section className="py-16 px-4 bg-secondary">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12 text-primary">
            Your Path to Healing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-accent">1</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Explore Support Options
              </h3>
              <p className="text-brown">
                Discover the services and programs that resonate with your unique needs and wellness goals.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-accent">2</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Choose What Fits Your Needs
              </h3>
              <p className="text-brown">
                Select the path that feels right for you, whether it&apos;s a single session or a comprehensive program.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-accent">3</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Start Feeling More Grounded
              </h3>
              <p className="text-brown">
                Begin your journey with support, guidance, and a clear path forward to lasting wellness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Highlights */}
      <section className="py-16 px-4 bg-background">
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

                {/* Content - Title at top (centered), description centered */}
                <div className="relative z-10 p-6 h-full flex flex-col">
                  <h3 className="text-xl font-semibold mb-3 text-white text-center">
                    {service.title}
                  </h3>
                  <div className="flex-grow flex items-center justify-center">
                    <p className="text-white/90 text-center">{service.description}</p>
                  </div>
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
          backgroundImage: 'url(/home/main-background.avif)',
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
              Who is <span className="font-script text-accent">A Thyme To Heal?</span>
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
            <p className="text-xs text-white/60 italic text-center mt-6">
              Results are individual and not guaranteed. Testimonials reflect personal experiences, not medical outcomes.
            </p>
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

      {/* Call to Action - Book Consultation */}
      <section className="py-16 px-4 bg-secondary">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
            Ready to Begin Your Wellness Journey?
          </h2>
          <p className="text-lg mb-8 text-brown">
            Schedule a consultation to discover personalized natural solutions for your health and wellness needs.
          </p>
          <Booking />
        </div>
      </section>
    </div>
  );
}
