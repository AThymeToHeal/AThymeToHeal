'use client';

import { useState, useEffect, useRef } from 'react';
import TestimonialModal from './TestimonialModal';

interface Testimonial {
  name: string;
  text: string;
  rating?: number;
}

export default function TestimonialsCarousel() {
  // Data state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Visibility state
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Animation state
  const [showAnimation, setShowAnimation] = useState(false);

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonialsPerPage = 3;

  // Modal state
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // IntersectionObserver for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoaded) {
            setIsVisible(true);
            loadTestimonials();
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasLoaded]);

  // Fetch testimonials from API
  const loadTestimonials = async () => {
    if (hasLoaded) return;

    setIsLoading(true);
    setHasLoaded(true);

    try {
      const response = await fetch('/api/testimonials');
      if (!response.ok) throw new Error('Failed to fetch testimonials');
      const data = await response.json();
      setTestimonials(data);

      // Trigger animation after data loads
      setTimeout(() => setShowAnimation(true), 50);
    } catch (error) {
      console.error('Error loading testimonials:', error);
      setTestimonials([]); // Empty state on error
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate carousel data
  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage);
  const startIndex = currentIndex * testimonialsPerPage;
  const endIndex = startIndex + testimonialsPerPage;
  const currentTestimonials = testimonials.slice(startIndex, endIndex);

  // Carousel navigation
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  // Modal handlers
  const openModal = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedTestimonial(null), 300);
  };

  const showNavigation = testimonials.length > testimonialsPerPage;

  return (
    <>
      <div ref={sectionRef} className="relative">
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/20 p-6 rounded-lg animate-pulse">
                <div className="h-4 bg-white/40 rounded mb-4"></div>
                <div className="h-4 bg-white/40 rounded mb-4"></div>
                <div className="h-4 bg-white/40 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && testimonials.length === 0 && isVisible && (
          <div className="text-center py-12">
            <p className="text-white/80 text-lg">
              No testimonials available at this time.
            </p>
          </div>
        )}

        {/* Testimonials Display */}
        {!isLoading && testimonials.length > 0 && (
          <>
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
                  onClick={() => openModal(testimonial)}
                  className={`bg-white p-6 rounded-lg shadow-md border border-taupe cursor-pointer hover:shadow-lg transition-all duration-300 transform ${
                    showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
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
                  <p className="text-brown mb-4 italic line-clamp-3">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <p className="font-semibold text-primary mb-2">- {testimonial.name}</p>
                  <button className="text-primary hover:text-accent text-sm font-medium transition-colors">
                    Read more →
                  </button>
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
          </>
        )}
      </div>

      {/* Modal */}
      <TestimonialModal
        isOpen={isModalOpen}
        onClose={closeModal}
        testimonial={selectedTestimonial}
      />
    </>
  );
}
