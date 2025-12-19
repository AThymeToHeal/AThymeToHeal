'use client';

import { useState } from 'react';

interface NewsletterSignupProps {
  source?: string;
  className?: string;
}

export default function NewsletterSignup({
  source = 'Homepage',
  className = ''
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to subscribe');
      }

      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error('Newsletter signup error:', error);
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      );
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="flex-1 px-4 py-3 rounded-md text-brown bg-secondary border border-taupe focus:outline-none focus:ring-2 focus:ring-accent"
          required
          disabled={status === 'submitting'}
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="px-8 py-3 bg-accent text-primary font-semibold rounded-md hover:bg-accent/90 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'submitting' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>

      {status === 'success' && (
        <div className="mt-4 p-4 rounded-md bg-sage/20 border border-sage max-w-md mx-auto">
          <p className="text-secondary font-medium text-center">
            Thank you for subscribing! Check your email for confirmation.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 p-4 rounded-md bg-orange/20 border border-orange max-w-md mx-auto">
          <p className="text-brown font-medium text-center">
            {errorMessage || 'Something went wrong. Please try again.'}
          </p>
        </div>
      )}
    </div>
  );
}
