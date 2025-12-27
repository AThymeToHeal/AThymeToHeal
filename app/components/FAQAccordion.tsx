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

type SortOrder = 'alphabetical' | 'mostClicked' | 'byCategory';

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState<SortOrder>('alphabetical');

  const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category || 'General')))];

  // Sorting function
  const sortFAQs = (faqs: FAQ[], sortType: SortOrder): FAQ[] => {
    const sorted = [...faqs]; // Create copy to avoid mutation

    switch (sortType) {
      case 'alphabetical':
        return sorted.sort((a, b) =>
          a.question.toLowerCase().localeCompare(b.question.toLowerCase())
        );

      case 'mostClicked':
        return sorted.sort((a, b) =>
          (b.clickCount || 0) - (a.clickCount || 0)
        );

      case 'byCategory':
        return sorted.sort((a, b) =>
          (a.order || 999) - (b.order || 999)
        );

      default:
        return sorted;
    }
  };

  // First filter by search and category
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || (faq.category || 'General') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Then apply sorting
  const sortedAndFilteredFAQs = sortFAQs(filteredFAQs, sortOrder);

  // Close accordion when sort order changes
  useEffect(() => {
    setOpenIndex(null);
  }, [sortOrder]);

  const toggleAccordion = async (index: number) => {
    const faq = sortedAndFilteredFAQs[index];

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

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3">
          <label htmlFor="faq-sort" className="text-brown font-medium whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="faq-sort"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="px-4 py-2 rounded-md border border-taupe bg-white text-brown focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Sort FAQs by"
          >
            <option value="alphabetical">Alphabetical (A-Z)</option>
            <option value="mostClicked">Most Clicked</option>
            <option value="byCategory">By Category</option>
          </select>
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
        {sortedAndFilteredFAQs.length > 0 ? (
          sortedAndFilteredFAQs.map((faq, index) => (
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
          ))
        ) : (
          <div className="text-center py-12 bg-secondary rounded-lg border border-taupe">
            <p className="text-brown text-lg">No FAQs found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
