import type { Metadata } from 'next';
import Image from 'next/image';
import Booking from '../components/Booking';

export const metadata: Metadata = {
  title: 'Health Business Coaching - A Thyme To Heal',
  description: 'Build a soul-led, sustainable health and wellness business rooted in integrity, rest, and alignment. Expert coaching for women transforming their healing stories into purposeful work.',
};

export default function HealthBusinessCoachingPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-secondary py-16 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-accent">
            Soul-Led Health Business Coaching
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            Transform your healing story into a sustainable, heart-centered business that honors rest, integrity, and real life
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-lg md:text-xl leading-relaxed text-brown mb-6">
              Have you walked through your own healing journey and sensed that your experience was meant to become something more? Do you feel called to build a business in the health and wellness space—but want to do it in a way that feels aligned, sustainable, and true?
            </p>
            <p className="text-lg md:text-xl leading-relaxed text-brown">
              You&apos;re in the right place.
            </p>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 px-4 bg-secondary">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12 text-primary">
            How We Support You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-background p-8 rounded-lg shadow-md border border-taupe">
              <h3 className="text-2xl font-serif font-bold mb-4 text-primary">
                Business Strategy & Foundation
              </h3>
              <p className="text-brown leading-relaxed">
                Build your business from the ground up with clarity and intention. We help you define your niche, understand your ideal clients, create sustainable offerings, and develop a business model that supports your life—not depletes it.
              </p>
            </div>

            <div className="bg-background p-8 rounded-lg shadow-md border border-taupe">
              <h3 className="text-2xl font-serif font-bold mb-4 text-primary">
                Soul-Led Brand Building
              </h3>
              <p className="text-brown leading-relaxed">
                Your brand should reflect the truth of who you are and the transformation you offer. We work together to craft messaging that resonates, build an authentic online presence, and create content that feels nourishing rather than draining.
              </p>
            </div>

            <div className="bg-background p-8 rounded-lg shadow-md border border-taupe">
              <h3 className="text-2xl font-serif font-bold mb-4 text-primary">
                Nervous System-Centered Growth
              </h3>
              <p className="text-brown leading-relaxed">
                Growing a business doesn&apos;t mean burning out. We prioritize nervous system regulation, sustainable pacing, and building work rhythms that honor your capacity. Success and rest are not opposites—they&apos;re partners.
              </p>
            </div>

            <div className="bg-background p-8 rounded-lg shadow-md border border-taupe">
              <h3 className="text-2xl font-serif font-bold mb-4 text-primary">
                Integrity & Ethics
              </h3>
              <p className="text-brown leading-relaxed">
                Build a business rooted in honesty, transparency, and ethical practices. We help you navigate the wellness space with integrity—creating offerings that truly serve, pricing that honors your value, and marketing that feels aligned.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-8 text-primary">
            Our Approach
          </h2>
          <div className="space-y-6 text-brown text-lg leading-relaxed">
            <p>
              We build slowly and intentionally. There are no quick fixes or overnight success formulas here—just honest, grounded work that creates something sustainable and real.
            </p>
            <p>
              We focus on alignment over hustle. Your business should feel like an extension of your values, not a compromise of them. We help you create work that supports your wellbeing rather than demanding you sacrifice it.
            </p>
            <p>
              We honor the journey. Your healing story carries purpose, and we believe it can be stewarded into a business that feels rooted, nourishing, and true. We walk alongside you as you build something meaningful—one intentional step at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Placeholder */}
      <section className="py-16 px-4 bg-secondary">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12 text-primary">
            Client Stories
          </h2>
          <div className="bg-background p-8 rounded-lg shadow-md border border-taupe text-center">
            <p className="text-lg text-brown italic">
              &quot;Working with Illiana transformed not just my business, but my entire relationship with work. She helped me build something sustainable that honors rest and real life.&quot;
            </p>
            <p className="mt-4 text-primary font-semibold">— Past Client</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
            Ready to Build Your Soul-Led Business?
          </h2>
          <p className="text-lg mb-8 text-brown max-w-2xl mx-auto">
            Schedule a discovery call to explore how we can support you in creating a health and wellness business that feels rooted, sustainable, and true to who you are.
          </p>
          <Booking buttonText="Schedule a Discovery Call" defaultConsultant="Illiana" />
        </div>
      </section>
    </div>
  );
}
