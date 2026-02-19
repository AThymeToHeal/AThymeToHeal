'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  detectUserTimezone,
  getTimezoneFriendlyName,
  convertFromMST,
  formatTimeForDisplay,
  getSupportedTimezones,
  isPast,
  getDateString,
  formatDateForDisplay,
} from '@/lib/timezone';
import type {
  TimeSlot,
  Consultation,
  ClientFormData,
  ServiceType,
  ConsultantType,
} from '@/lib/airtable';
import { SERVICES } from '@/lib/airtable';
import MaintenanceBooking from './MaintenanceBooking';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultConsultant?: ConsultantType;
  defaultServiceType?: ServiceType;
  availableConsultants?: ConsultantType[];
}

type BookingStep = 'selection' | 'calendar' | 'timeSlots' | 'contactInfo' | 'success' | 'maintenance';

export default function BookingModal({
  isOpen,
  onClose,
  defaultConsultant,
  defaultServiceType,
  availableConsultants = ['Heidi Lynn', 'Illiana'], // Default to all consultants
}: BookingModalProps) {
  // Modal state
  const [isAnimating, setIsAnimating] = useState(false);
  const [step, setStep] = useState<BookingStep>(
    defaultConsultant && defaultServiceType ? 'calendar' : 'selection'
  );

  // Selection state
  const [selectedConsultant, setSelectedConsultant] = useState<ConsultantType | null>(
    defaultConsultant || null
  );
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(
    defaultServiceType || null
  );

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Timezone state
  const [userTimezone, setUserTimezone] = useState<string>('America/Denver');
  const [detectedTimezone, setDetectedTimezone] = useState<string>('America/Denver');
  const [manualTimezoneSelection, setManualTimezoneSelection] = useState(false);

  // Time slot state
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Fully booked dates state (for calendar indicators)
  const [fullyBookedDates, setFullyBookedDates] = useState<Set<string>>(new Set());
  const [isLoadingBookedDates, setIsLoadingBookedDates] = useState(false);
  const [cachedMonths, setCachedMonths] = useState<Map<string, { dates: string[]; timestamp: number }>>(new Map());

  // Available days of week state (from Airtable schedules)
  const [availableDaysOfWeek, setAvailableDaysOfWeek] = useState<Set<string>>(new Set());
  const [isLoadingAvailableDays, setIsLoadingAvailableDays] = useState(false);

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
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Maintenance mode detection
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(
    process.env.NEXT_PUBLIC_BOOKING_MAINTENANCE_MODE === 'true'
  );

  // Track if booking data verification failed (potential conflicts)
  const [bookingDataUnavailable, setBookingDataUnavailable] = useState(false);

  // Helper function to check if a date's day of week has any advisor availability
  const isDayUnavailable = useCallback((date: Date): boolean => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[date.getDay()];
    return !availableDaysOfWeek.has(dayOfWeek);
  }, [availableDaysOfWeek]);

  // Check if all remaining dates in the current month are fully booked
  const isRestOfMonthBooked = useMemo(() => {
    if (fullyBookedDates.size === 0 && !isLoadingBookedDates) {
      // No booked dates loaded yet or none booked — not fully booked
      return false;
    }

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();

    let hasRemainingDate = false;

    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month, day);

      // Skip past dates
      if (isPast(date)) continue;

      // Skip days when no consultant is available (e.g., Monday, Friday, Sunday)
      if (isDayUnavailable(date)) continue;

      // This is a valid remaining date — check if it's fully booked
      const dateStr = getDateString(date);
      if (!fullyBookedDates.has(dateStr)) {
        // Found at least one available date
        return false;
      }

      hasRemainingDate = true;
    }

    // If we found remaining dates and all were booked, the month is fully booked
    return hasRemainingDate;
  }, [fullyBookedDates, currentMonth, isLoadingBookedDates, isDayUnavailable]);

  // Helper function to get service-type-specific cache key
  const getCacheKey = useCallback(() => {
    // Determine the service type to use for cache key
    const serviceType = selectedServiceType || defaultServiceType;

    if (serviceType) {
      // For specific service types, use dedicated cache key (remove spaces)
      return `bookingProgress_${serviceType.replace(/\s+/g, '')}`;
    }
    // For generic booking (no pre-selected service), use general key
    return 'bookingProgress_General';
  }, [selectedServiceType, defaultServiceType]);

  // Create a stable consultant filter value for useEffect dependencies
  const consultantFilter = useMemo(() => {
    return availableConsultants.length === 1 ? availableConsultants[0] : null;
  }, [availableConsultants.join(',')]);

  // Auto-select consultant if only one is available
  useEffect(() => {
    if (consultantFilter && !selectedConsultant) {
      setSelectedConsultant(consultantFilter);
    }
  }, [consultantFilter, selectedConsultant]);

  // Fetch available days of week from Airtable schedules with caching
  useEffect(() => {
    if (!isOpen) return;

    const fetchAvailableDays = async () => {
      setIsLoadingAvailableDays(true);
      try {
        const cacheKey = `available_days_${consultantFilter || 'all'}`;

        // Check localStorage cache (24 hour expiry - schedules rarely change)
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            const isStale = Date.now() - timestamp > 24 * 60 * 60 * 1000; // 24 hours

            if (!isStale) {
              setAvailableDaysOfWeek(new Set(data));
              setIsLoadingAvailableDays(false);
              return;
            }
          }
        } catch (cacheError) {
          // Ignore cache errors
        }

        // If only one consultant is available, filter by that consultant
        const url = consultantFilter
          ? `/api/available-days?consultant=${encodeURIComponent(consultantFilter)}`
          : '/api/available-days';

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setAvailableDaysOfWeek(new Set(data.availableDays));

          // Cache the result
          try {
            localStorage.setItem(cacheKey, JSON.stringify({
              data: data.availableDays,
              timestamp: Date.now()
            }));
          } catch (storageError) {
            // Ignore storage errors
          }
        } else {
          console.error('Failed to fetch available days');
          // Default to all days if fetch fails
          setAvailableDaysOfWeek(new Set(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']));
        }
      } catch (error) {
        console.error('Error fetching available days:', error);
        // Default to all days if fetch fails
        setAvailableDaysOfWeek(new Set(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']));
      } finally {
        setIsLoadingAvailableDays(false);
      }
    };

    fetchAvailableDays();
  }, [isOpen, consultantFilter]);

  // Initialize timezone detection and load saved data
  useEffect(() => {
    const detected = detectUserTimezone();
    setDetectedTimezone(detected);
    setUserTimezone(detected);

    // Load saved booking data from localStorage (service-type-specific)
    const cacheKey = getCacheKey();
    const savedData = localStorage.getItem(cacheKey);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Restore selection first
        if (parsed.selectedConsultant) setSelectedConsultant(parsed.selectedConsultant);
        if (parsed.selectedServiceType) setSelectedServiceType(parsed.selectedServiceType);
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
        if (parsed.consent !== undefined) setConsent(parsed.consent);
        if (parsed.userTimezone) setUserTimezone(parsed.userTimezone);

        // Restore step only if valid - check if required selections are made
        if (parsed.step) {
          // If step requires consultant/service but they're not selected, reset to selection
          if (['calendar', 'timeSlots', 'contactInfo'].includes(parsed.step)) {
            if (!parsed.selectedConsultant || !parsed.selectedServiceType) {
              setStep('selection');
            } else {
              setStep(parsed.step);
            }
          } else {
            setStep(parsed.step);
          }
        }
      } catch (error) {
        console.error('Failed to restore booking data:', error);
      }
    }
  }, [getCacheKey]);

  // Fetch fully booked dates for a month (with caching and retry)
  const loadBookedDatesForMonth = useCallback(
    async (date: Date, retryCount = 0) => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const cacheKey = `${year}-${month}-${selectedConsultant || 'all'}-${selectedServiceType || 'default'}`;
      const CACHE_TTL = 2 * 60 * 1000; // 2 minutes (reduced from 5 for faster updates)

      // Check cache first with TTL validation
      const cached = cachedMonths.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setFullyBookedDates(new Set(cached.dates));
        return;
      }

      setIsLoadingBookedDates(true);

      try {
        const consultantParam = selectedConsultant
          ? `&consultant=${encodeURIComponent(selectedConsultant)}`
          : '';
        const serviceTypeParam = selectedServiceType
          ? `&serviceType=${encodeURIComponent(selectedServiceType)}`
          : '';
        const response = await fetch(`/api/booked-dates?year=${year}&month=${month}${consultantParam}${serviceTypeParam}`);
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

        setCachedMonths((prev) => new Map(prev).set(cacheKey, { dates: bookedDates, timestamp: Date.now() }));
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
    [cachedMonths, selectedConsultant, selectedServiceType]
  );

  // Auto-save booking progress to localStorage (service-type-specific)
  // Don't save when booking is complete (success step)
  useEffect(() => {
    if (isOpen && step !== 'success') {
      const bookingProgress = {
        step,
        selectedConsultant,
        selectedServiceType,
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
        consent,
        userTimezone,
      };
      const cacheKey = getCacheKey();
      localStorage.setItem(cacheKey, JSON.stringify(bookingProgress));
    }
  }, [
    step,
    selectedConsultant,
    selectedServiceType,
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
    consent,
    userTimezone,
    isOpen,
    getCacheKey,
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
    if (isDayUnavailable(date) || isPast(date) || fullyBookedDates.has(dateStr)) return;

    // Validate that consultant and service are selected before proceeding
    if (!selectedConsultant || !selectedServiceType) {
      setFormError('Please select a consultant and service type first');
      setStep('selection');
      return;
    }

    setSelectedDate(date);
    setStep('timeSlots');
    await loadAvailableSlots(date);
  };

  // Load available time slots with stale-while-revalidate caching
  // Shows cached data instantly, then refreshes in background if stale (>30s)
  const loadAvailableSlots = async (date: Date, retryCount = 0) => {
    if (!selectedServiceType || !selectedConsultant) {
      console.error('Service type and consultant must be selected');
      return;
    }

    const dateString = getDateString(date);
    const cacheKey = `availability_${dateString}_${selectedServiceType}_${selectedConsultant}`;

    // Stale-while-revalidate: show cached data immediately, refetch if stale
    let hasCachedData = false;
    let cacheIsFresh = false;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Show cached data immediately (no loading spinner)
        setAvailableSlots(data.slots);
        setBookingDataUnavailable(data.dataUnavailable || false);
        hasCachedData = true;
        // If cache is very fresh (<30s), skip refetch entirely
        cacheIsFresh = Date.now() - timestamp < 30 * 1000;
      }
    } catch (cacheError) {
      // Ignore cache errors, proceed with fetch
    }

    // If cache is fresh enough, no need to refetch
    if (cacheIsFresh) {
      setIsLoadingSlots(false);
      return;
    }

    // Only show loading spinner if we have no cached data to display
    if (!hasCachedData) {
      setIsLoadingSlots(true);
    }

    try {
      const response = await fetch(
        `/api/availability?date=${dateString}&serviceType=${encodeURIComponent(selectedServiceType)}&consultant=${encodeURIComponent(selectedConsultant)}`
      );
      if (!response.ok) {
        if (retryCount < 2) {
          setIsLoadingSlots(false);
          setTimeout(() => loadAvailableSlots(date, retryCount + 1), 1000);
          return;
        }
        console.warn('Failed to fetch availability after retries');
        if (!hasCachedData) setAvailableSlots([]);
        return;
      }

      // Check if booking data verification failed
      const dataUnavailable = response.headers.get('X-Booking-Data-Unavailable') === 'true';
      setBookingDataUnavailable(dataUnavailable);

      const slots: TimeSlot[] = await response.json();
      setAvailableSlots(slots);

      // Update cache with fresh data
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          data: { slots, dataUnavailable },
          timestamp: Date.now()
        }));
      } catch (storageError) {
        // Ignore storage errors (quota exceeded, private mode, etc.)
      }
    } catch (error) {
      if (retryCount < 2) {
        setIsLoadingSlots(false);
        setTimeout(() => loadAvailableSlots(date, retryCount + 1), 1000);
        return;
      }
      console.warn('Error loading time slots:', error);
      // Only clear slots if we have no cached fallback
      if (!hasCachedData) setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
    setStep('contactInfo');
  };

  // Invalidate all booking-related caches for a specific date
  // This ensures other users see updated availability immediately
  const invalidateBookingCaches = useCallback((date: Date, consultant: ConsultantType, serviceType: ServiceType) => {
    try {
      const dateString = getDateString(date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      // Clear all localStorage cache entries related to this booking
      const keysToRemove: string[] = [];

      // 1. Clear availability cache for this specific date/service/consultant
      keysToRemove.push(`availability_${dateString}_${serviceType}_${consultant}`);

      // 2. Clear availability for other consultant too (they might show this slot as "available with other")
      const otherConsultant: ConsultantType = consultant === 'Heidi Lynn' ? 'Illiana' : 'Heidi Lynn';
      keysToRemove.push(`availability_${dateString}_${serviceType}_${otherConsultant}`);

      // 3. Clear all service types for this date (in case user switches services)
      Object.keys(SERVICES).forEach((service) => {
        keysToRemove.push(`availability_${dateString}_${service}_${consultant}`);
        keysToRemove.push(`availability_${dateString}_${service}_${otherConsultant}`);
      });

      // 4. Clear booked dates cache for this month
      // Note: We can't clear the cachedMonths state here, but we can clear localStorage
      // The state will be refreshed on next mount or navigation

      // Remove all identified cache keys
      keysToRemove.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // Ignore individual removal errors
        }
      });

      // 5. Force refresh of booked dates cache by clearing the in-memory cache
      setCachedMonths(new Map());

      console.log(`Cache invalidated for booking on ${dateString} with ${consultant}`);
    } catch (error) {
      console.error('Error invalidating cache:', error);
      // Don't throw - cache invalidation failure shouldn't break booking flow
    }
  }, []);


  // Handle booking submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Check if maintenance mode is enabled or booking data is unavailable
    if (isMaintenanceMode || bookingDataUnavailable) {
      setStep('maintenance');
      return;
    }

    if (!selectedDate || !selectedTimeSlot || !userTimezone || !selectedConsultant || !selectedServiceType) {
      setFormError('Please complete all booking selections');
      return;
    }

    // Validate required fields
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setFormError('Please fill in all required fields (marked with *)');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    // Validate phone if contact method requires it
    if ((preferredContactMethod === 'Phone' || preferredContactMethod === 'Text') && !phone.trim()) {
      setFormError('Please provide a phone number for your preferred contact method');
      return;
    }

    // Validate phone format if provided
    if ((preferredContactMethod === 'Phone' || preferredContactMethod === 'Text') && phone.trim()) {
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        setFormError('Please enter a valid phone number with at least 10 digits');
        return;
      }
    }

    // Validate consent
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
        phone: phone.trim() || undefined,
        bookingType: 'Initial Consultation',
        serviceType: selectedServiceType,
        consultant: selectedConsultant,
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

        // Check for double-booking conflict (slot just taken by someone else)
        if (bookingResponse.status === 409 || error.code === 'SLOT_UNAVAILABLE') {
          // Invalidate cache and force user to reselect
          invalidateBookingCaches(selectedDate, selectedConsultant, selectedServiceType);
          setFormError(
            error.error ||
              'This timeslot was just booked by someone else. Please select a different time.'
          );
          // Reset to time slot selection to show updated availability
          setStep('timeSlots');
          setIsSubmitting(false);
          // Reload fresh availability data
          await loadAvailableSlots(selectedDate);
          return;
        }

        // Check for API rate limit or maintenance errors
        if (
          bookingResponse.status === 429 ||
          bookingResponse.status === 503 ||
          error.error?.includes('rate limit') ||
          error.error?.includes('API') ||
          error.error?.includes('Airtable')
        ) {
          // Switch to maintenance mode
          setIsMaintenanceMode(true);
          setStep('maintenance');
          return;
        }
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

      // CRITICAL: Invalidate all booking caches to ensure real-time availability updates
      // This prevents double-bookings by forcing fresh data on next availability check
      invalidateBookingCaches(selectedDate, selectedConsultant, selectedServiceType);

      setStep('success');
      // Clear saved data from localStorage after successful booking (service-type-specific)
      const cacheKey = getCacheKey();
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Error submitting booking:', error);

      // Check if error is API-related (rate limits, network issues, etc.)
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isAPIError =
        errorMessage.includes('rate limit') ||
        errorMessage.includes('API') ||
        errorMessage.includes('Airtable') ||
        errorMessage.includes('429') ||
        errorMessage.includes('fetch');

      if (isAPIError) {
        // Switch to maintenance mode for API errors
        setIsMaintenanceMode(true);
        setStep('maintenance');
      } else {
        setFormError(
          error instanceof Error
            ? error.message
            : 'Failed to complete booking. Please try again or contact us directly.'
        );
      }
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
      healthConditions.trim() !== ''
    );
  };

  // Handle modal close
  const handleClose = () => {
    // If closing from success step, reset the form
    if (step === 'success') {
      clearSavedData();
    }

    onClose();
  };

  // Clear saved data (only call after successful submission)
  const clearSavedData = () => {
    const cacheKey = getCacheKey();
    localStorage.removeItem(cacheKey);
    setStep(defaultConsultant && defaultServiceType ? 'calendar' : 'selection');
    setSelectedConsultant(defaultConsultant || null);
    setSelectedServiceType(defaultServiceType || null);
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
    setConsent(false);
    setFormError(null);
  };

  // Handle back navigation
  const handleBack = () => {
    if (step === 'calendar') {
      setStep('selection');
    } else if (step === 'timeSlots') {
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
            {step !== 'selection' && step !== 'success' && (
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
              {step === 'selection' && 'Book Your Appointment'}
              {step === 'calendar' && 'Select a Date'}
              {step === 'timeSlots' && 'Choose Your Time'}
              {step === 'contactInfo' && 'Your Information'}
              {step === 'success' && 'Booking Confirmed!'}
              {step === 'maintenance' && 'Booking Temporarily Unavailable'}
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
          {/* Selection Step */}
          {step === 'selection' && (
            <div className="space-y-8">
              {/* Consultant Selection - Only show if multiple consultants available */}
              {availableConsultants.length > 1 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary">Select Your Consultant</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableConsultants.map((consultant) => {
                      const consultantInfo = {
                        'Heidi Lynn': {
                          name: 'Heidi Lynn',
                          description: 'Experienced holistic health coach specializing in natural healing and autoimmune recovery',
                        },
                        'Illiana': {
                          name: 'Illiana',
                          description: 'Specializing in emotional healing, trauma release, and holistic wellness',
                        },
                      };
                      const info = consultantInfo[consultant];

                      return (
                        <button
                          key={consultant}
                          onClick={() => setSelectedConsultant(consultant)}
                          className={`p-6 border-2 rounded-lg transition-all text-left ${
                            selectedConsultant === consultant
                              ? 'border-primary bg-primary/10'
                              : 'border-taupe hover:border-primary/50'
                          }`}
                        >
                          <h4 className="text-lg font-semibold text-primary mb-2">{info.name}</h4>
                          <p className="text-sm text-brown">{info.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Service Type Selection */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary">Select Your Service</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.values(SERVICES).map((service) => (
                    <button
                      key={service.name}
                      onClick={() => setSelectedServiceType(service.name)}
                      className={`p-6 border-2 rounded-lg transition-all text-left ${
                        selectedServiceType === service.name
                          ? 'border-primary bg-primary/10'
                          : 'border-taupe hover:border-primary/50'
                      }`}
                    >
                      <h4 className="text-lg font-semibold text-primary mb-2">{service.name}</h4>
                      <p className="text-sm text-brown mb-4">{service.description}</p>
                      <div className="text-sm text-brown space-y-1">
                        <p className="font-medium">{service.duration} minutes</p>
                        <p className="text-2xl font-bold text-primary">
                          {service.price === 0 ? 'FREE' : `$${service.price}`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Continue Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    // Auto-select single consultant if not already selected
                    const consultant = selectedConsultant || (availableConsultants.length === 1 ? availableConsultants[0] : null);
                    if (consultant && selectedServiceType) {
                      if (!selectedConsultant) setSelectedConsultant(consultant);
                      setStep('calendar');
                    }
                  }}
                  disabled={(!selectedConsultant && availableConsultants.length > 1) || !selectedServiceType}
                  className="px-8 py-3 bg-primary text-secondary font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Calendar
                </button>
              </div>
            </div>
          )}

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
                    isDayUnavailable(date) || isPast(date) || fullyBookedDates.has(dateStr);

                  return (
                    <button
                      key={dateStr}
                      onClick={() => !isDisabled && handleDateSelect(date)}
                      disabled={isDisabled}
                      className={`aspect-square rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
                        isDisabled
                          ? 'text-brown/30 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-primary text-secondary'
                          : isToday
                          ? 'border-2 border-primary text-primary'
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
              {/* Warning banner when booking data verification fails */}
              {bookingDataUnavailable && (
                <div className="bg-orange/10 border-l-4 border-orange p-4 rounded-md">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">⚠️</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-primary mb-1">
                        Unable to Verify Existing Bookings
                      </h4>
                      <p className="text-sm text-brown">
                        We can&apos;t verify existing bookings at this time. You can still request a booking, but we&apos;ll need to manually confirm there are no conflicts. We&apos;ll email you confirmation shortly.
                      </p>
                    </div>
                  </div>
                </div>
              )}

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

                      // Selected advisor available - clickable, green
                      if (slot.available) {
                        return (
                          <button
                            key={`${slot.start}-${slot.end}`}
                            onClick={() => handleTimeSlotSelect(slot)}
                            className="px-4 py-3 border-2 border-primary rounded-md text-brown font-medium hover:bg-primary hover:text-secondary transition-colors"
                          >
                            {displayStart} - {displayEnd}
                          </button>
                        );
                      }

                      // Other advisor available - greyed out, not clickable
                      if (slot.availableWithOther && slot.otherConsultant) {
                        return (
                          <div
                            key={`${slot.start}-${slot.end}`}
                            className="px-4 py-3 border-2 border-taupe/50 rounded-md bg-taupe/10 text-brown/60 cursor-not-allowed relative"
                          >
                            <div className="text-sm font-medium line-through">
                              {displayStart} - {displayEnd}
                            </div>
                            <div className="text-xs mt-1 text-primary font-medium">
                              Available with {slot.otherConsultant}
                            </div>
                          </div>
                        );
                      }

                      // Completely unavailable - don't render
                      return null;
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
                      Phone Number (Optional)
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
                      Health Goals (Optional)
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
                      Dietary Restrictions / Allergies (Optional)
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
                      Current Medications / Supplements (Optional)
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
                      Health Conditions (Optional)
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
                      Preferred Contact Method *
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
                  Thank you for scheduling your consultation with A Thyme To Heal.
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
                onClick={handleClose}
                className="px-8 py-3 bg-primary text-secondary font-semibold rounded-md hover:bg-primary/90 transition-colors"
              >
                Reset Booking
              </button>
            </div>
          )}

          {/* Maintenance Mode Step */}
          {step === 'maintenance' && selectedDate && selectedTimeSlot && selectedConsultant && selectedServiceType && (
            <div className="space-y-6">
              <MaintenanceBooking
                consultant={selectedConsultant}
                serviceType={selectedServiceType}
                selectedDate={formatDateForDisplay(selectedDate)}
                timeSlot={selectedTimeSlot}
                userLocalTime={`${formatTimeForDisplay(
                  convertFromMST(getDateString(selectedDate), selectedTimeSlot.start, userTimezone)
                )} - ${formatTimeForDisplay(
                  convertFromMST(getDateString(selectedDate), selectedTimeSlot.end, userTimezone)
                )}`}
                userTimezone={getTimezoneFriendlyName(userTimezone)}
                firstName={firstName}
                lastName={lastName}
                email={email}
                phone={phone}
                healthGoals={healthGoals}
                dietaryRestrictions={dietaryRestrictions}
                currentMedications={currentMedications}
                healthConditions={healthConditions}
                preferredContactMethod={preferredContactMethod}
                warningTitle={
                  bookingDataUnavailable
                    ? 'Unable to Verify Booking Availability'
                    : 'Booking System Under Maintenance'
                }
                warningMessage={
                  bookingDataUnavailable
                    ? "We're unable to verify existing bookings at this time, which means there may be a scheduling conflict. Please copy your booking details below and email them to us. We'll check for conflicts and confirm your appointment as soon as possible."
                    : "Our online booking system is temporarily unavailable. Please copy your booking details below and send them to us via email. We'll confirm your appointment as soon as possible."
                }
              />

              <div className="flex justify-center pt-4">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 text-brown hover:text-primary transition-colors underline"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast notification for fully booked month — outside modal to avoid resizing */}
      {isRestOfMonthBooked && !isLoadingBookedDates && step === 'calendar' && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-11/12 max-w-md animate-fade-in-down">
          <div className="bg-white border border-orange shadow-lg rounded-lg px-4 py-3">
            <p className="text-sm font-semibold text-primary">
              All remaining dates this month are fully booked.
            </p>
            <p className="text-xs text-brown mt-1">
              Try the next month, or{' '}
              <a href="/contact" className="text-primary underline font-medium">
                contact us directly
              </a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
