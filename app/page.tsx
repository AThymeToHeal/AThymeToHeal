import Link from 'next/link';
import Booking from './components/Booking';
import NewsletterSignup from './components/NewsletterSignup';
import TestimonialsCarousel from './components/TestimonialsCarousel';

export default function Home() {
  const services = [
    {
      title: 'Health Scan — $160',
      description: 'Start here. A quick, non-invasive scan that reads your body\'s responses and shows us where things are out of balance. No needles, no bloodwork, you rest your hand on a sensor for about 7 minutes. Then we sit down together and walk you through exactly what came up and what we recommend, in plain language. You leave knowing what your body is asking for and what to do next.',
      backgroundImage: '/home/Bowl-of-greens-image.webp',
    },
    {
      title: 'Symphony of Cells — $75',
      description: 'Hands-on support for your body. A guided application of therapeutic-grade plant oils along the spine and feet, using a specific sequence chosen for what your body needs. Deeply relaxing, and a favorite for people dealing with stress, immune support, or feeling run-down. About an hour.',
      backgroundImage: '/home/natural-beauty-image.avif',
    },
    {
      title: 'Essential Emotions — $100',
      description: 'For the weight your body is carrying. Stress, grief, and old emotional patterns don\'t stay in your mind, they show up in your body. This session combines guided coaching with aromatherapy to help you work through what you\'re holding and get your nervous system back to a place of rest so you can build a beautiful future for yourself. Come as you are. Nothing is too much here.',
      backgroundImage: '/home/essential-emotions.avif',
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
          <div className="mb-8 max-w-3xl mx-auto space-y-4">
            <p className="text-xl md:text-2xl">
              We help you find out what your body and mind actually needs, then give you a natural plan to support it. No guessing, no generic advice.
            </p>
            <p className="text-lg md:text-xl">
              Headaches, gut issues and sleep? We can help you. Anxiety, depression or trying to recover from trauma? We can support you in that too.
            </p>
            <p className="text-lg md:text-xl">
              You deserve a life that is not filled with pain. We are here to help you create that reality.
            </p>
          </div>
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
            You want to feel better and want to do it naturally.
          </p>
          <p className="text-lg md:text-xl text-white/95 leading-relaxed mb-6">
            You&apos;re tired of guessing, tired of generic advice, and ready for answers that actually fit your body. That&apos;s what we do: we scan, we listen, we explain what we&apos;re seeing, and we give you a personalized plan using nutrition, supplements, plant oils, and herbs. Then we walk it out with you.
          </p>
          <p className="text-lg md:text-xl text-white/95 leading-relaxed font-semibold">
            Book a health scan to begin, it&apos;s the simplest way to find out what your body needs.
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
                Start with a Health Scan
              </h3>
              <p className="text-brown">
                We start with a health scan to see what your body needs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-accent">2</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Understand
              </h3>
              <p className="text-brown">
                You get a written report and we explain our recommendations. You choose your path.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-accent">3</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Pick Services &amp; Begin Your Journey
              </h3>
              <p className="text-brown">
                Pick your services and start healing, with support the whole way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Highlights */}
      <section className="py-16 px-4 bg-background">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12 text-primary">
            Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="relative rounded-lg shadow-md hover:shadow-lg transition-shadow border border-taupe overflow-hidden min-h-80"
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
                    <p className="text-white/90 text-center text-sm leading-relaxed">{service.description}</p>
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
