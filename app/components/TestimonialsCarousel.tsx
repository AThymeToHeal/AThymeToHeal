'use client';

import { useState } from 'react';

interface Testimonial {
  name: string;
  text: string;
  rating?: number;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export default function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonialsPerPage = 3;

  // Calculate total pages
  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage);

  // Get current testimonials to display
  const startIndex = currentIndex * testimonialsPerPage;
  const endIndex = startIndex + testimonialsPerPage;
  const currentTestimonials = testimonials.slice(startIndex, endIndex);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  // Only show navigation if there are more than 3 testimonials
  const showNavigation = testimonials.length > testimonialsPerPage;

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      {showNavigation && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white hover:bg-sage/20 text-primary p-3 rounded-full shadow-lg transition-colors z-10 border-2 border-primary"
            aria-label="Previous testimonials"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white hover:bg-sage/20 text-primary p-3 rounded-full shadow-lg transition-colors z-10 border-2 border-primary"
            aria-label="Next testimonials"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {currentTestimonials.map((testimonial, index) => (
          <div
            key={startIndex + index}
            className="bg-white p-6 rounded-lg shadow-md border border-taupe"
          >
            {testimonial.rating && testimonial.rating > 0 && (
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-orange text-xl">
                    ★
                  </span>
                ))}
              </div>
            )}
            <p className="text-brown mb-4 italic">&ldquo;{testimonial.text}&rdquo;</p>
            <p className="font-semibold text-primary">- {testimonial.name}</p>
          </div>
        ))}
      </div>

      {/* Page Indicators */}
      {showNavigation && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-primary'
                  : 'bg-taupe hover:bg-primary/50'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
