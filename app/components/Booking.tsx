'use client';

import { useState, useEffect } from 'react';
import BookingModal from './BookingModal';

interface BookingProps {
  buttonText?: string;
}

export default function Booking({ buttonText = 'Book Your Free Consultation' }: BookingProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  useEffect(() => {
    // Check if there's saved booking progress
    const savedData = localStorage.getItem('bookingProgress');
    setHasSavedProgress(!!savedData);
  }, [isModalOpen]); // Re-check when modal closes

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
      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
