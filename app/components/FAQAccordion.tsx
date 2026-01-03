'use client';

import { useState, useEffect } from 'react';

interface FAQ {
  id?: string;
  question: string;
  answer: string;
  category: string;
  order?: number;
  clickCount?: number;
}

interface FAQAccordionProps {
  faqs: FAQ[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alphabetical');
  const [displayCount, setDisplayCount] = useState(5); // Show 5 FAQs initially

  // Build categories: Alphabetical, actual categories, Most Clicked
  const actualCategories = Array.from(new Set(faqs.map(faq => faq.category || 'General')));
  const categories = ['Alphabetical', ...actualCategories, 'Most Clicked'];

  // Filter and sort FAQs based on selected category
  const filteredAndSortedFAQs = (() => {
    // First filter by search
    const searchFiltered = faqs.filter(faq => {
      const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    // Then filter and sort by category
    if (selectedCategory === 'Alphabetical') {
      // Show all FAQs, sorted alphabetically
      return [...searchFiltered].sort((a, b) =>
        a.question.toLowerCase().localeCompare(b.question.toLowerCase())
      );
    } else if (selectedCategory === 'Most Clicked') {
      // Show all FAQs, sorted by click count
      return [...searchFiltered].sort((a, b) =>
        (b.clickCount || 0) - (a.clickCount || 0)
      );
    } else {
      // Show FAQs from selected category, sorted alphabetically
      return searchFiltered
        .filter(faq => (faq.category || 'General') === selectedCategory)
        .sort((a, b) => a.question.toLowerCase().localeCompare(b.question.toLowerCase()));
    }
  })();

  // Close accordion and reset display count when category or search changes
  useEffect(() => {
    setOpenIndex(null);
    setDisplayCount(5); // Reset to showing 5 FAQs
  }, [selectedCategory, searchTerm]);

  const toggleAccordion = async (index: number) => {
    const faq = filteredAndSortedFAQs[index];

    // Track click if FAQ has an ID (from Airtable)
    if (faq.id && openIndex !== index) {
      try {
        await fetch('/api/faq-clicks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ faqId: faq.id }),
        });
      } catch (error) {
        console.error('Failed to track FAQ click:', error);
        // Don't block the UI if tracking fails
      }
    }

    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 rounded-md border border-taupe bg-white text-brown focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brown/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-secondary'
                  : 'bg-secondary text-brown border border-taupe hover:bg-taupe/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        {filteredAndSortedFAQs.length > 0 ? (
          <>
            {filteredAndSortedFAQs.slice(0, displayCount).map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md border border-taupe overflow-hidden"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-secondary/50 transition-colors"
                >
                  <span className="font-semibold text-primary pr-8">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-accent transition-transform flex-shrink-0 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="px-6 py-4 bg-secondary/30 border-t border-taupe">
                    <p className="text-brown leading-relaxed">{faq.answer}</p>
                    <span className="inline-block mt-3 text-sm text-brown/60 italic">
                      Category: {faq.category}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Load More Button */}
            {displayCount < filteredAndSortedFAQs.length && (
              <div className="text-center pt-6">
                <button
                  onClick={() => setDisplayCount(prev => prev + 5)}
                  className="px-8 py-3 bg-primary text-secondary font-semibold rounded-md hover:bg-primary/90 transition-colors"
                >
                  Load More ({filteredAndSortedFAQs.length - displayCount} remaining)
                </button>
              </div>
            )}

            {/* Show All Loaded Message */}
            {displayCount >= filteredAndSortedFAQs.length && filteredAndSortedFAQs.length > 5 && (
              <div className="text-center pt-6">
                <p className="text-brown/60 text-sm">
                  Showing all {filteredAndSortedFAQs.length} FAQs
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-secondary rounded-lg border border-taupe">
            <p className="text-brown text-lg">No FAQs found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
