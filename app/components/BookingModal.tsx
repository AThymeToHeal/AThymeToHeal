'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  detectUserTimezone,
  getTimezoneFriendlyName,
  convertFromMST,
  formatTimeForDisplay,
  getSupportedTimezones,
  isWeekend,
  isPast,
  getDateString,
  formatDateForDisplay,
} from '@/lib/timezone';
import type { TimeSlot, Consultation, ClientFormData } from '@/lib/airtable';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BookingStep = 'calendar' | 'timeSlots' | 'contactInfo' | 'success';

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  // Modal state
  const [isAnimating, setIsAnimating] = useState(false);
  const [step, setStep] = useState<BookingStep>('calendar');

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Timezone state
  const [userTimezone, setUserTimezone] = useState<string>('America/New_York');
  const [detectedTimezone, setDetectedTimezone] = useState<string>('America/New_York');
  const [manualTimezoneSelection, setManualTimezoneSelection] = useState(false);

  // Time slot state
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Fully booked dates state (for calendar indicators)
  const [fullyBookedDates, setFullyBookedDates] = useState<Set<string>>(new Set());
  const [isLoadingBookedDates, setIsLoadingBookedDates] = useState(false);
  const [cachedMonths, setCachedMonths] = useState<Map<string, string[]>>(new Map());

  // Client form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [healthGoals, setHealthGoals] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [healthConditions, setHealthConditions] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<string>('Email');
  const [bestTimeToContact, setBestTimeToContact] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize timezone detection and load saved data
  useEffect(() => {
    const detected = detectUserTimezone();
    setDetectedTimezone(detected);
    setUserTimezone(detected);

    // Load saved booking data from localStorage
    const savedData = localStorage.getItem('bookingProgress');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Restore step
        if (parsed.step) setStep(parsed.step);
        // Restore selected date
        if (parsed.selectedDate) setSelectedDate(new Date(parsed.selectedDate));
        // Restore selected time slot
        if (parsed.selectedTimeSlot) setSelectedTimeSlot(parsed.selectedTimeSlot);
        // Restore form data
        if (parsed.firstName) setFirstName(parsed.firstName);
        if (parsed.lastName) setLastName(parsed.lastName);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.healthGoals) setHealthGoals(parsed.healthGoals);
        if (parsed.dietaryRestrictions) setDietaryRestrictions(parsed.dietaryRestrictions);
        if (parsed.currentMedications) setCurrentMedications(parsed.currentMedications);
        if (parsed.healthConditions) setHealthConditions(parsed.healthConditions);
        if (parsed.preferredContactMethod) setPreferredContactMethod(parsed.preferredContactMethod);
        if (parsed.bestTimeToContact) setBestTimeToContact(parsed.bestTimeToContact);
        if (parsed.consent !== undefined) setConsent(parsed.consent);
        if (parsed.userTimezone) setUserTimezone(parsed.userTimezone);
      } catch (error) {
        console.error('Failed to restore booking data:', error);
      }
    }
  }, []);

  // Fetch fully booked dates for a month (with caching and retry)
  const loadBookedDatesForMonth = useCallback(
    async (date: Date, retryCount = 0) => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const cacheKey = `${year}-${month}`;

      // Check cache first
      if (cachedMonths.has(cacheKey)) {
        const cached = cachedMonths.get(cacheKey)!;
        setFullyBookedDates(new Set(cached));
        return;
      }

      setIsLoadingBookedDates(true);

      try {
        const response = await fetch(`/api/booked-dates?year=${year}&month=${month}`);
        if (!response.ok) {
          if (retryCount < 2) {
            setIsLoadingBookedDates(false);
            setTimeout(() => loadBookedDatesForMonth(date, retryCount + 1), 1000);
            return;
          }
          console.warn('Failed to fetch booked dates after retries');
          setFullyBookedDates(new Set());
          return;
        }
        const bookedDates: string[] = await response.json();

        setCachedMonths((prev) => new Map(prev).set(cacheKey, bookedDates));
        setFullyBookedDates(new Set(bookedDates));
      } catch (error) {
        if (retryCount < 2) {
          setIsLoadingBookedDates(false);
          setTimeout(() => loadBookedDatesForMonth(date, retryCount + 1), 1000);
          return;
        }
        console.warn('Error loading booked dates:', error);
        setFullyBookedDates(new Set());
      } finally {
        setIsLoadingBookedDates(false);
      }
    },
    [cachedMonths]
  );

  // Auto-save booking progress to localStorage
  useEffect(() => {
    if (isOpen) {
      const bookingProgress = {
        step,
        selectedDate: selectedDate?.toISOString(),
        selectedTimeSlot,
        firstName,
        lastName,
        email,
        phone,
        healthGoals,
        dietaryRestrictions,
        currentMedications,
        healthConditions,
        preferredContactMethod,
        bestTimeToContact,
        consent,
        userTimezone,
      };
      localStorage.setItem('bookingProgress', JSON.stringify(bookingProgress));
    }
  }, [
    step,
    selectedDate,
    selectedTimeSlot,
    firstName,
    lastName,
    email,
    phone,
    healthGoals,
    dietaryRestrictions,
    currentMedications,
    healthConditions,
    preferredContactMethod,
    bestTimeToContact,
    consent,
    userTimezone,
    isOpen,
  ]);

  // Handle modal open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
      loadBookedDatesForMonth(currentMonth);
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        // Only clear state when modal closes, NOT localStorage
        // This allows restoration on next open
      }, 300);

      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Calendar navigation
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(newMonth);
    loadBookedDatesForMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(newMonth);
    loadBookedDatesForMonth(newMonth);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Handle date selection
  const handleDateSelect = async (date: Date) => {
    const dateStr = getDateString(date);
    if (isWeekend(date) || isPast(date) || fullyBookedDates.has(dateStr)) return;

    setSelectedDate(date);
    setStep('timeSlots');
    await loadAvailableSlots(date);
  };

  // Load available time slots
  const loadAvailableSlots = async (date: Date, retryCount = 0) => {
    setIsLoadingSlots(true);

    try {
      const dateString = getDateString(date);
      const response = await fetch(`/api/availability?date=${dateString}`);
      if (!response.ok) {
        if (retryCount < 2) {
          setIsLoadingSlots(false);
          setTimeout(() => loadAvailableSlots(date, retryCount + 1), 1000);
          return;
        }
        console.warn('Failed to fetch availability after retries');
        setAvailableSlots([]);
        return;
      }
      const slots: TimeSlot[] = await response.json();
      setAvailableSlots(slots);
    } catch (error) {
      if (retryCount < 2) {
        setIsLoadingSlots(false);
        setTimeout(() => loadAvailableSlots(date, retryCount + 1), 1000);
        return;
      }
      console.warn('Error loading time slots:', error);
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
    setStep('contactInfo');
  };

  // Handle booking submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedDate || !selectedTimeSlot || !userTimezone) {
      setFormError('Please select a date and time slot');
      return;
    }

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (!consent) {
      setFormError('Please agree to the privacy policy to continue');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create booking
      const consultation: Consultation = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        bookingType: 'Free Consultation',
        dateBooked: getDateString(selectedDate),
        timeSlotStart: selectedTimeSlot.start,
        timeSlotEnd: selectedTimeSlot.end,
        userTimezone,
        userLocalTime: `${formatTimeForDisplay(
          convertFromMST(getDateString(selectedDate), selectedTimeSlot.start, userTimezone)
        )} - ${formatTimeForDisplay(
          convertFromMST(getDateString(selectedDate), selectedTimeSlot.end, userTimezone)
        )}`,
      };

      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consultation),
      });

      if (!bookingResponse.ok) {
        const error = await bookingResponse.json();
        throw new Error(error.error || 'Failed to create booking');
      }

      const bookingResult = await bookingResponse.json();

      // Create client record
      const clientData: ClientFormData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        healthGoals: healthGoals.trim(),
        dietaryRestrictions: dietaryRestrictions.trim(),
        currentMedications: currentMedications.trim(),
        healthConditions: healthConditions.trim(),
        preferredContactMethod,
        bestTimeToContact: bestTimeToContact.trim(),
        consent: true,
        bookedRecordId: bookingResult.id,
      };

      const clientResponse = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });

      if (!clientResponse.ok) {
        console.warn('Booking created but client record failed');
      }

      setStep('success');
      // Clear saved data after successful booking
      setTimeout(() => {
        clearSavedData();
      }, 100);
    } catch (error) {
      console.error('Error submitting booking:', error);
      setFormError(
        error instanceof Error
          ? error.message
          : 'Failed to complete booking. Please try again or contact us directly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user has entered any data
  const hasEnteredData = () => {
    return (
      selectedDate !== null ||
      selectedTimeSlot !== null ||
      firstName.trim() !== '' ||
      lastName.trim() !== '' ||
      email.trim() !== '' ||
      phone.trim() !== '' ||
      healthGoals.trim() !== '' ||
      dietaryRestrictions.trim() !== '' ||
      currentMedications.trim() !== '' ||
      healthConditions.trim() !== '' ||
      bestTimeToContact.trim() !== ''
    );
  };

  // Handle modal close with confirmation
  const handleClose = () => {
    if (step !== 'success' && hasEnteredData()) {
      const confirmed = window.confirm(
        "You have unsaved booking information. If you close now, your progress will be saved and you can continue later. Close anyway?"
      );
      if (!confirmed) return;
    }
    onClose();
  };

  // Clear saved data (only call after successful submission)
  const clearSavedData = () => {
    localStorage.removeItem('bookingProgress');
    setStep('calendar');
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setHealthGoals('');
    setDietaryRestrictions('');
    setCurrentMedications('');
    setHealthConditions('');
    setPreferredContactMethod('Email');
    setBestTimeToContact('');
    setConsent(false);
    setFormError(null);
  };

  // Handle back navigation
  const handleBack = () => {
    if (step === 'timeSlots') {
      setStep('calendar');
      setSelectedTimeSlot(null);
    } else if (step === 'contactInfo') {
      setStep('timeSlots');
    }
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative bg-white rounded-lg shadow-xl w-11/12 md:w-auto max-w-4xl max-h-[90vh] overflow-y-auto transition-transform duration-300 ${
          isOpen ? 'scale-100' : 'scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-taupe px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {step !== 'calendar' && step !== 'success' && (
              <button
                onClick={handleBack}
                className="text-brown hover:text-primary transition-colors"
                aria-label="Go back"
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
            )}
            <h2 className="text-2xl font-serif font-bold text-primary">
              {step === 'calendar' && 'Select a Date'}
              {step === 'timeSlots' && 'Choose Your Time'}
              {step === 'contactInfo' && 'Your Information'}
              {step === 'success' && 'Booking Confirmed!'}
            </h2>
          </div>
          <button
            onClick={handleClose}
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
        <div className="p-6">
          {/* Calendar Step */}
          {step === 'calendar' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 rounded-md hover:bg-sage/20 transition-colors"
                  aria-label="Previous month"
                >
                  <svg
                    className="w-5 h-5 text-primary"
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
                <h3 className="text-xl font-semibold text-primary">
                  {currentMonth.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
                <button
                  onClick={goToNextMonth}
                  className="p-2 rounded-md hover:bg-sage/20 transition-colors"
                  aria-label="Next month"
                >
                  <svg
                    className="w-5 h-5 text-primary"
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
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center font-semibold text-brown py-2">
                    {day}
                  </div>
                ))}
                {generateCalendarDays().map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const dateStr = getDateString(date);
                  const isToday = dateStr === getDateString(new Date());
                  const isSelected = selectedDate && dateStr === getDateString(selectedDate);
                  const isDisabled =
                    isWeekend(date) || isPast(date) || fullyBookedDates.has(dateStr);

                  return (
                    <button
                      key={dateStr}
                      onClick={() => !isDisabled && handleDateSelect(date)}
                      disabled={isDisabled}
                      className={`aspect-square rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-primary text-secondary'
                          : isToday
                          ? 'border-2 border-primary text-primary'
                          : isDisabled
                          ? 'text-brown/30 cursor-not-allowed line-through'
                          : 'hover:bg-sage/20 text-brown'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              {isLoadingBookedDates && (
                <p className="text-center text-brown text-sm">Loading availability...</p>
              )}
            </div>
          )}

          {/* Time Slots Step */}
          {step === 'timeSlots' && (
            <div className="space-y-6">
              <div className="bg-sage/10 p-4 rounded-md">
                <p className="text-brown font-medium">
                  {selectedDate && formatDateForDisplay(selectedDate)}
                </p>
              </div>

              {/* Timezone selector */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-brown">
                  Your Timezone
                </label>
                <select
                  value={userTimezone}
                  onChange={(e) => {
                    setUserTimezone(e.target.value);
                    setManualTimezoneSelection(true);
                  }}
                  className="w-full px-4 py-2 border border-taupe rounded-md text-brown focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {getSupportedTimezones().map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
                {!manualTimezoneSelection && (
                  <p className="text-xs text-brown/70">
                    Detected: {getTimezoneFriendlyName(detectedTimezone)}
                  </p>
                )}
              </div>

              {/* Time slots */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-brown">
                  Available Times (all times shown in {getTimezoneFriendlyName(userTimezone)})
                </label>
                {isLoadingSlots ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-center py-8 text-brown">
                    No available times for this date. Please select another date.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    {availableSlots.map((slot) => {
                      if (!slot.available) return null;

                      const displayStart = formatTimeForDisplay(
                        convertFromMST(
                          selectedDate ? getDateString(selectedDate) : '',
                          slot.start,
                          userTimezone
                        )
                      );
                      const displayEnd = formatTimeForDisplay(
                        convertFromMST(
                          selectedDate ? getDateString(selectedDate) : '',
                          slot.end,
                          userTimezone
                        )
                      );

                      return (
                        <button
                          key={`${slot.start}-${slot.end}`}
                          onClick={() => handleTimeSlotSelect(slot)}
                          className="px-4 py-3 border-2 border-primary rounded-md text-brown font-medium hover:bg-primary hover:text-secondary transition-colors"
                        >
                          {displayStart} - {displayEnd}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Info Step */}
          {step === 'contactInfo' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Booking summary */}
              <div className="bg-sage/10 p-4 rounded-md space-y-1">
                <p className="text-brown font-medium">
                  {selectedDate && formatDateForDisplay(selectedDate)}
                </p>
                <p className="text-brown">
                  {selectedTimeSlot &&
                    `${formatTimeForDisplay(
                      convertFromMST(
                        getDateString(selectedDate!),
                        selectedTimeSlot.start,
                        userTimezone
                      )
                    )} - ${formatTimeForDisplay(
                      convertFromMST(
                        getDateString(selectedDate!),
                        selectedTimeSlot.end,
                        userTimezone
                      )
                    )} ${getTimezoneFriendlyName(userTimezone)}`}
                </p>
              </div>

              {formError && (
                <div className="bg-orange/20 border border-orange rounded-md p-4">
                  <p className="text-brown font-medium">{formError}</p>
                </div>
              )}

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brown mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2 border border-taupe rounded-md text-brown focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2 border border-taupe rounded-md text-brown focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-taupe rounded-md text-brown focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-taupe rounded-md text-brown focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Health Context */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Health & Wellness Context</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brown mb-1">
                      Health Goals
                    </label>
                    <textarea
                      value={healthGoals}
                      onChange={(e) => setHealthGoals(e.target.value)}
                      rows={2}
                      placeholder="What are your main health and wellness goals?"
                      className="w-full px-4 py-2 border border-taupe rounded-md text-brown focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown mb-1">
                      Dietary Restrictions / Allergies
                    </label>
                    <textarea
                      value={dietaryRestrictions}
                      onChange={(e) => setDietaryRestrictions(e.target.value)}
                      rows={2}
                      placeholder="Any food allergies or dietary restrictions?"
                      className="w-full px-4 py-2 border border-taupe rounded-md text-brown focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown mb-1">
                      Current Medications / Supplements
                    </label>
                    <textarea
                      value={currentMedications}
                      onChange={(e) => setCurrentMedications(e.target.value)}
                      rows={2}
                      placeholder="List any medications or supplements you're currently taking"
                      className="w-full px-4 py-2 border border-taupe rounded-md text-brown focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown mb-1">
                      Health Conditions
                    </label>
                    <textarea
                      value={healthConditions}
                      onChange={(e) => setHealthConditions(e.target.value)}
                      rows={2}
                      placeholder="Any health conditions we should be aware of?"
                      className="w-full px-4 py-2 border border-taupe rounded-md text-brown focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Communication Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">
                  Communication Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brown mb-1">
                      Preferred Contact Method
                    </label>
                    <select
                      value={preferredContactMethod}
                      onChange={(e) => setPreferredContactMethod(e.target.value)}
                      className="w-full px-4 py-2 border border-taupe rounded-md text-brown focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="Email">Email</option>
                      <option value="Phone">Phone</option>
                      <option value="Text">Text Message</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brown mb-1">
                      Best Time to Contact
                    </label>
                    <input
                      type="text"
                      value={bestTimeToContact}
                      onChange={(e) => setBestTimeToContact(e.target.value)}
                      placeholder="e.g., Mornings, Afternoons, Evenings"
                      className="w-full px-4 py-2 border border-taupe rounded-md text-brown focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Consent */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-5 w-5 text-accent focus:ring-accent border-taupe rounded"
                  required
                />
                <label htmlFor="consent" className="text-sm text-brown">
                  I agree to the{' '}
                  <a href="/privacy-policy" className="text-primary underline" target="_blank">
                    privacy policy
                  </a>{' '}
                  and consent to A Thyme To Heal contacting me about my consultation. *
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-3 bg-primary text-secondary font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </form>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center space-y-6 py-8">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-sage/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-sage"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-primary mb-2">
                  Booking Confirmed!
                </h3>
                <p className="text-brown">
                  Thank you for scheduling your free consultation with A Thyme To Heal.
                </p>
                <p className="text-brown mt-2">
                  You'll receive a confirmation email shortly with all the details.
                </p>
              </div>
              <div className="bg-sage/10 p-4 rounded-md text-left max-w-md mx-auto">
                <p className="text-brown font-medium mb-2">Your Appointment:</p>
                <p className="text-brown">
                  {selectedDate && formatDateForDisplay(selectedDate)}
                </p>
                <p className="text-brown">
                  {selectedTimeSlot &&
                    `${formatTimeForDisplay(
                      convertFromMST(
                        getDateString(selectedDate!),
                        selectedTimeSlot.start,
                        userTimezone
                      )
                    )} - ${formatTimeForDisplay(
                      convertFromMST(
                        getDateString(selectedDate!),
                        selectedTimeSlot.end,
                        userTimezone
                      )
                    )} ${getTimezoneFriendlyName(userTimezone)}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-primary text-secondary font-semibold rounded-md hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
