'use client';

import { useState, useEffect, useRef } from 'react';
import TestimonialModal from './TestimonialModal';

function SubmitTestimonialModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { setErrorMsg('Please select a star rating.'); return; }
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), text: text.trim(), rating }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Submission failed.');
      }
      setStatus('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-brown/60 hover:text-brown transition-colors text-2xl leading-none"
          aria-label="Close"
        >
          &times;
        </button>

        {status === 'success' ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">🌿</div>
            <h3 className="text-2xl font-semibold text-primary mb-2">Thank You!</h3>
            <p className="text-brown/80">Your testimonial has been submitted and will be reviewed before being published.</p>
            <button
              onClick={onClose}
              className="mt-6 bg-primary text-white px-6 py-2 rounded-full hover:bg-accent transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-semibold text-primary mb-6">Share Your Experience</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-brown mb-1" htmlFor="testimonial-name">Your Name</label>
                <input
                  id="testimonial-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={80}
                  placeholder="e.g. Jane S."
                  className="w-full border border-taupe rounded-lg px-4 py-2 text-brown focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brown mb-1" htmlFor="testimonial-text">Your Testimonial</label>
                <textarea
                  id="testimonial-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                  maxLength={1000}
                  rows={5}
                  placeholder="Tell us about your experience..."
                  className="w-full border border-taupe rounded-lg px-4 py-2 text-brown focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
                <p className="text-xs text-brown/50 text-right mt-1">{text.length}/1000</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-brown mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="text-3xl transition-colors focus:outline-none"
                      aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                    >
                      <span className={(hoveredRating || rating) >= star ? 'text-orange' : 'text-taupe'}>★</span>
                    </button>
                  ))}
                </div>
              </div>

              {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-primary text-white px-6 py-3 rounded-full hover:bg-accent transition-colors font-medium disabled:opacity-60"
              >
                {status === 'loading' ? 'Submitting...' : 'Submit Testimonial'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

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

function AllReviewsModal({ testimonials, onClose }: { testimonials: Testimonial[]; onClose: () => void }) {
  const rated = testimonials.filter((t) => t.rating && t.rating > 0);
  const avgRating = rated.length > 0
    ? rated.reduce((sum, t) => sum + (t.rating ?? 0), 0) / rated.length
    : null;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-taupe flex items-start justify-between flex-shrink-0">
          <div>
            <h3 className="text-2xl font-semibold text-primary mb-1">All Reviews</h3>
            {avgRating !== null && (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-primary">{avgRating.toFixed(1)}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-xl ${star <= Math.round(avgRating) ? 'text-orange' : 'text-taupe'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-brown/60 text-sm">({rated.length} rating{rated.length !== 1 ? 's' : ''})</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-brown/50 hover:text-brown transition-colors text-2xl leading-none ml-4"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto p-6 flex flex-col gap-5">
          {testimonials.map((t, i) => (
            <div key={i} className="border border-taupe rounded-lg p-5">
              {t.rating && t.rating > 0 && (
                <div className="flex mb-2">
                  {[...Array(t.rating)].map((_, j) => (
                    <span key={j} className="text-orange text-lg">★</span>
                  ))}
                </div>
              )}
              <p className="text-brown italic mb-3">&ldquo;{t.text}&rdquo;</p>
              <p className="font-semibold text-primary text-sm">— {t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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

  // View testimonial modal state
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Submit testimonial modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // All reviews modal state
  const [isAllReviewsOpen, setIsAllReviewsOpen] = useState(false);

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

    // Only show loading state if we don't have testimonials yet
    // This prevents hardcoded testimonials from disappearing during fetch
    const showLoadingState = testimonials.length === 0;
    if (showLoadingState) {
      setIsLoading(true);
    }
    setHasLoaded(true);

    try {
      const response = await fetch('/api/testimonials');
      if (!response.ok) throw new Error('Failed to fetch testimonials');
      const data = await response.json();

      // Only update if we got data
      if (data && data.length > 0) {
        setTestimonials(data);
      }
    } catch (error) {
      console.error('Error loading testimonials:', error);
      // Keep hardcoded testimonials as fallback - don't clear them
      // setTestimonials remains as INITIAL_TESTIMONIALS from useState initialization
    } finally {
      if (showLoadingState) {
        setIsLoading(false);
      }
    }
  };

  // Calculate carousel data
  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage);
  const startIndex = currentIndex * testimonialsPerPage;
  const endIndex = startIndex + testimonialsPerPage;
  const currentTestimonials = testimonials.slice(startIndex, endIndex);

  // Slide animation state: dir 1 = going forward (next), -1 = going back (prev)
  const [anim, setAnim] = useState<{ phase: 'idle' | 'out' | 'in'; dir: number }>({ phase: 'idle', dir: 1 });

  const navigate = (dir: 1 | -1) => {
    if (anim.phase !== 'idle') return;
    setAnim({ phase: 'out', dir });
    setTimeout(() => {
      setCurrentIndex((prev) => {
        const next = prev + dir;
        if (next < 0) return totalPages - 1;
        if (next >= totalPages) return 0;
        return next;
      });
      setAnim({ phase: 'in', dir });
      requestAnimationFrame(() => requestAnimationFrame(() => setAnim({ phase: 'idle', dir })));
    }, 220);
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

  const gridStyle: React.CSSProperties = {
    transition: 'transform 220ms ease, opacity 220ms ease',
    transform:
      anim.phase === 'out'
        ? `translateX(${anim.dir > 0 ? '-' : ''}50px)`
        : anim.phase === 'in'
          ? `translateX(${anim.dir > 0 ? '' : '-'}50px)`
          : 'translateX(0)',
    opacity: anim.phase === 'idle' ? 1 : 0,
  };

  return (
    <>
      <div ref={sectionRef} className="overflow-hidden">
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
            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={gridStyle}>
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

          </>
        )}
      </div>

      {/* Bottom controls: prev | buttons | next */}
      <div className="flex items-center justify-center gap-4 mt-10">
        {showNavigation && (
          <button
            onClick={() => navigate(-1)}
            className="bg-white hover:bg-sage/20 text-primary p-3 rounded-full shadow-lg transition-colors border-2 border-primary flex-shrink-0"
            aria-label="Previous testimonials"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <button
          onClick={() => setIsAllReviewsOpen(true)}
          className="bg-white/20 text-white border-2 border-white/60 px-6 py-3 rounded-full font-medium hover:bg-white hover:text-primary transition-colors shadow-md"
        >
          See All Reviews
        </button>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="bg-white text-primary border-2 border-primary px-6 py-3 rounded-full font-medium hover:bg-primary hover:text-white transition-colors shadow-md"
        >
          Give a Testimonial
        </button>

        {showNavigation && (
          <button
            onClick={() => navigate(1)}
            className="bg-white hover:bg-sage/20 text-primary p-3 rounded-full shadow-lg transition-colors border-2 border-primary flex-shrink-0"
            aria-label="Next testimonials"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* View Testimonial Modal */}
      <TestimonialModal
        isOpen={isModalOpen}
        onClose={closeModal}
        testimonial={selectedTestimonial}
      />

      {/* All Reviews Modal */}
      {isAllReviewsOpen && (
        <AllReviewsModal testimonials={testimonials} onClose={() => setIsAllReviewsOpen(false)} />
      )}

      {/* Submit Testimonial Modal */}
      {isSubmitModalOpen && <SubmitTestimonialModal onClose={() => setIsSubmitModalOpen(false)} />}
    </>
  );
}
