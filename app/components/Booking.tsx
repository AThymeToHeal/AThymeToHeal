'use client';

import { useState, useEffect } from 'react';
import BookingModal from './BookingModal';
import type { ServiceType, ConsultantType } from '@/lib/airtable';

interface BookingProps {
  buttonText?: string;
  defaultConsultant?: ConsultantType;
  defaultServiceType?: ServiceType;
}

export default function Booking({
  buttonText = 'Book Your Consultation',
  defaultConsultant,
  defaultServiceType,
}: BookingProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  useEffect(() => {
    // Check if there's saved booking progress for THIS specific service type
    // Use service-type-specific key to avoid cross-contamination between different services
    const getCacheKey = () => {
      if (defaultServiceType) {
        // For specific service types, use dedicated cache key
        return `bookingProgress_${defaultServiceType.replace(/\s+/g, '')}`;
      }
      // For generic booking buttons (no pre-selected service), use general key
      return 'bookingProgress_General';
    };

    const cacheKey = getCacheKey();
    const savedData = localStorage.getItem(cacheKey);

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Only show "Resume" if it's an incomplete booking (not completed/success)
        const isIncomplete = parsed.step && parsed.step !== 'success';
        setHasSavedProgress(isIncomplete);
      } catch {
        // Invalid cache data, ignore
        setHasSavedProgress(false);
      }
    } else {
      setHasSavedProgress(false);
    }
  }, [isModalOpen, defaultServiceType]); // Re-check when modal closes or service type changes

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-block px-8 py-3 bg-primary text-secondary font-semibold rounded-md hover:bg-primary/90 transition-colors text-lg"
      >
        {hasSavedProgress ? '📝 Resume Your Booking' : buttonText}
      </button>
      {hasSavedProgress && (
        <p className="text-sm text-brown mt-2">
          You have a booking in progress. Click to continue where you left off.
        </p>
      )}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultConsultant={defaultConsultant}
        defaultServiceType={defaultServiceType}
      />
    </>
  );
}
