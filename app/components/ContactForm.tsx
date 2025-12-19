'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    newsletter: false,
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' && target instanceof HTMLInputElement
      ? target.checked
      : target.value;
    const name = target.name;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      // Submit contact form to Airtable
      const contactResponse = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          message: `Subject: ${formData.subject}\n\n${formData.message}`,
          source: 'Contact Page',
        }),
      });

      if (!contactResponse.ok) {
        const error = await contactResponse.json();
        throw new Error(error.error || 'Failed to submit form');
      }

      // If newsletter is checked, submit to newsletter API
      if (formData.newsletter) {
        await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            name: `${formData.firstName} ${formData.lastName}`,
            source: 'Contact Page',
          }),
        });
      }

      setStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        newsletter: false,
      });

      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-primary mb-2">
            First Name <span className="text-orange">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-md border border-taupe bg-white text-brown focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-primary mb-2">
            Last Name <span className="text-orange">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-md border border-taupe bg-white text-brown focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
          Email <span className="text-orange">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-md border border-taupe bg-white text-brown focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-primary mb-2">
          Phone Number (Optional)
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-md border border-taupe bg-white text-brown focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Subject Field */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-primary mb-2">
          Subject <span className="text-orange">*</span>
        </label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-md border border-taupe bg-white text-brown focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">Select a subject</option>
          <option value="consultation">Herbal Consultation</option>
          <option value="custom-blend">Custom Blend Inquiry</option>
          <option value="workshop">Workshop Information</option>
          <option value="wellness-coaching">Wellness Coaching</option>
          <option value="general">General Inquiry</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-primary mb-2">
          Message <span className="text-orange">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={6}
          className="w-full px-4 py-3 rounded-md border border-taupe bg-white text-brown focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
      </div>

      {/* Newsletter Checkbox */}
      <div className="flex items-start">
        <input
          type="checkbox"
          id="newsletter"
          name="newsletter"
          checked={formData.newsletter}
          onChange={handleChange}
          className="mt-1 h-4 w-4 text-accent focus:ring-accent border-taupe rounded"
        />
        <label htmlFor="newsletter" className="ml-3 text-sm text-brown">
          Yes, I would like to subscribe to the newsletter and receive wellness tips, herbal remedies, and exclusive offers.
        </label>
      </div>

      {/* Status Messages */}
      {status === 'success' && (
        <div className="p-4 rounded-md bg-sage/20 border border-sage">
          <p className="text-primary font-medium">
            Thank you for contacting us! We&apos;ll get back to you soon.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="p-4 rounded-md bg-orange/20 border border-orange">
          <p className="text-brown font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full px-8 py-3 bg-primary text-secondary font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'submitting' ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </form>
  );
}
