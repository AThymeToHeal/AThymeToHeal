'use client';

import { useState, useEffect, useRef } from 'react';
import TestimonialModal from './TestimonialModal';

interface Testimonial {
  name: string;
  text: string;
  rating?: number;
}

// Hardcoded initial testimonials from Airtable for instant loading
// These are the first 3 approved testimonials and serve as fallback data
const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    name: 'Abby',
    text: 'The passion for health and wellbeing that Illiana and Heidi share is so contagious! They are both so patient and gracious to explain the step by step processes that have worked wonders in their own life as well as countless others.',
  },
  {
    name: 'Anna',
    text: 'Illiana and Heidi are the most compassionate and caring humans. They have helped guide me through my health issues, which have gotten so debilitating I\'m on medical leave, and with their assistance, I am finally starting to feel like I can live again. They never make me feel judged or guilty for my choices, only supported me as appropriate and provided education if something was not a good choice. Through the essential emotions sessions with Illiana, I have started processing things that I have never even figured out in regular therapy. I cannot recommend working with these two enough!',
  },
  {
    name: 'Heather',
    text: 'Since using the supplements Heidi recommended, I have felt an overall improvement in my health. I\'m feeling more vibrant and have more energy. I also feel that the supplements have helped me with menopause symptoms and have increased the vitality of my hair, nails, and skin.',
  },
];

export default function TestimonialsCarousel() {
  // Data state - initialize with hardcoded testimonials for instant display
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
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

  // Trigger animation for initial hardcoded testimonials on mount
  useEffect(() => {
    setTimeout(() => setShowAnimation(true), 50);
  }, []);

  // IntersectionObserver for lazy loading additional testimonials
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
      // Keep hardcoded testimonials as fallback - don't clear them
      // setTestimonials remains as INITIAL_TESTIMONIALS from useState initialization
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
        {/* Loading State - only show skeleton if we don't have any testimonials yet */}
        {isLoading && testimonials.length === 0 && (
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
