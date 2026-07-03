import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guides | A Thyme to Heal',
  description: 'Explore our herbal wellness guides, tips, and resources to support your natural health journey.',
};

export default function GuidesPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-secondary py-16 px-4">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-accent">
            Wellness Guides
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            Practical resources and tips to support your natural health journey.
          </p>
        </div>
      </section>

      {/* Coming Soon Content */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-2xl font-serif text-primary mb-4">🌿 Coming Soon</p>
          <p className="text-lg text-brown mb-8">
            We&apos;re putting together a collection of herbal wellness guides, seasonal tips, and
            how-to resources. Check back soon!
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 bg-primary text-secondary font-semibold rounded-md hover:bg-primary/90 transition-colors text-lg"
          >
            Get in Touch
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-secondary">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
            Have a Question?
          </h2>
          <p className="text-lg mb-8 text-brown">
            We&apos;re always happy to help. Reach out anytime.
          </p>
          <Link
            href="/faq"
            className="inline-block px-8 py-3 bg-primary text-secondary font-semibold rounded-md hover:bg-primary/90 transition-colors text-lg"
          >
            Visit Our FAQ
          </Link>
        </div>
      </section>
    </div>
  );
}
