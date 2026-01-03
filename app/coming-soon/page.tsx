'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ComingSoonFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  eta: string;
  status?: string;
  priority?: string;
  displayOrder?: number;
  isVisible?: boolean;
}

export default function ComingSoonPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [features, setFeatures] = useState<ComingSoonFeature[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  // Fallback features in case Airtable is unavailable
  const fallbackFeatures: ComingSoonFeature[] = [
    {
      id: '1',
      icon: '🛒',
      title: 'Online Store',
      description: 'Shop our full range of herbal products directly from our website with easy checkout and secure payment.',
      eta: 'Coming Q2 2025',
    },
    {
      id: '2',
      icon: '📱',
      title: 'Mobile App',
      description: 'Track your wellness journey, manage consultations, and access herbal guides on the go.',
      eta: 'Coming 2025',
    },
    {
      id: '3',
      icon: '📚',
      title: 'Member Resources',
      description: 'Exclusive access to herbal guides, video tutorials, seasonal recipes, and wellness tips.',
      eta: 'Coming Q3 2025',
    },
    {
      id: '4',
      icon: '📅',
      title: 'Online Booking',
      description: 'Schedule consultations and workshops directly through our website at your convenience.',
      eta: 'Coming Q1 2025',
    },
  ];

  // Fetch coming soon features from Airtable
  useEffect(() => {
    async function fetchFeatures() {
      try {
        const response = await fetch('/api/coming-soon');
        if (!response.ok) {
          throw new Error('Failed to fetch features');
        }
        const data = await response.json();
        setFeatures(data.length > 0 ? data : fallbackFeatures);
      } catch (error) {
        console.error('Error fetching coming soon features:', error);
        setFeatures(fallbackFeatures);
      } finally {
        setLoadingFeatures(false);
      }
    }

    fetchFeatures();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'Coming Soon Page',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }

      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error('Newsletter signup error:', error);
      setStatus('error');
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-secondary py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-6xl mb-6">🌿</div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-accent">
            Exciting Things Are Growing
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            We&apos;re constantly expanding our services and offerings to better serve your wellness journey.
          </p>
        </div>
      </section>

      {/* Upcoming Features */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12 text-primary">
            What&apos;s Coming Soon
          </h2>
          {loadingFeatures ? (
            <div className="text-center text-brown py-12">
              <div className="animate-pulse text-4xl mb-4">🌿</div>
              <p>Loading exciting features...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="bg-white p-8 rounded-lg shadow-md border border-taupe hover:shadow-lg transition-shadow"
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-semibold mb-3 text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-brown mb-4">{feature.description}</p>
                  <span className="inline-block px-4 py-2 bg-sage/20 text-primary font-medium rounded-md">
                    {feature.eta}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 px-4 bg-secondary">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-primary">
            Be the First to Know
          </h2>
          <p className="text-lg mb-8 text-brown">
            Subscribe to our newsletter to get notified when new features and products launch, plus receive exclusive wellness tips and special offers.
          </p>

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 rounded-md border border-taupe bg-white text-brown focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="px-8 py-3 bg-primary text-secondary font-semibold rounded-md hover:bg-primary/90 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {status === 'submitting' ? 'Subscribing...' : 'Notify Me'}
              </button>
            </div>

            {status === 'success' && (
              <div className="mt-4 p-4 rounded-md bg-sage/20 border border-sage max-w-md mx-auto">
                <p className="text-primary font-medium">
                  Thank you for subscribing! We&apos;ll keep you updated on all our exciting new features.
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="mt-4 p-4 rounded-md bg-orange/20 border border-orange max-w-md mx-auto">
                <p className="text-brown font-medium">
                  Something went wrong. Please try again.
                </p>
              </div>
            )}
          </form>

          {/* Social Media */}
          <div className="pt-8 border-t border-taupe">
            <p className="text-brown mb-4 font-medium">
              Follow us on social media for updates:
            </p>
            <div className="flex justify-center space-x-6">
              <a
                href="#"
                className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-accent hover:bg-primary/90 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-accent hover:bg-primary/90 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-accent hover:bg-primary/90 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Current Services */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
            Explore What We Offer Now
          </h2>
          <p className="text-lg mb-8 text-brown">
            While you wait for these exciting new features, explore our current services and discover how we can support your wellness journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/how-we-can-help-you"
              className="px-8 py-3 bg-primary text-secondary font-semibold rounded-md hover:bg-primary/90 transition-colors text-lg"
            >
              View Our Services
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 bg-transparent border-2 border-primary text-primary font-semibold rounded-md hover:bg-primary/10 transition-colors text-lg"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
