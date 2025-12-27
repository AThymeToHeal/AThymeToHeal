'use client';

import { useEffect, useState } from 'react';

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  testimonial: {
    name: string;
    text: string;
    rating?: number;
  } | null;
}

export default function TestimonialModal({ isOpen, onClose, testimonial }: TestimonialModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle modal open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen && !isAnimating) return null;
  if (!testimonial) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className={`relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-transform duration-300 ${
          isOpen ? 'scale-100' : 'scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-taupe px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-primary">
            Client Testimonial
          </h2>
          <button
            onClick={onClose}
            className="text-brown hover:text-primary transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Rating */}
          {testimonial.rating && testimonial.rating > 0 && (
            <div className="flex justify-center">
              {[...Array(testimonial.rating)].map((_, i) => (
                <span key={i} className="text-orange text-2xl">
                  ★
                </span>
              ))}
            </div>
          )}

          {/* Full testimonial text */}
          <blockquote className="text-brown text-lg italic leading-relaxed">
            &ldquo;{testimonial.text}&rdquo;
          </blockquote>

          {/* Author */}
          <p className="font-semibold text-primary text-right">
            - {testimonial.name}
          </p>

          {/* Close button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-primary text-secondary font-semibold rounded-md hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
