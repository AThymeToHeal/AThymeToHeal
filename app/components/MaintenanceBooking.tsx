'use client';

import { useState } from 'react';
import type { ServiceType, ConsultantType } from '@/lib/airtable';
import { SERVICES } from '@/lib/airtable';

interface MaintenanceBookingProps {
  consultant: ConsultantType;
  serviceType: ServiceType;
  selectedDate: string;
  timeSlot: { start: string; end: string };
  userLocalTime: string;
  userTimezone: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  healthGoals?: string;
  dietaryRestrictions?: string;
  currentMedications?: string;
  healthConditions?: string;
  preferredContactMethod?: string;
  warningTitle?: string;
  warningMessage?: string;
}

export default function MaintenanceBooking({
  consultant,
  serviceType,
  selectedDate,
  timeSlot,
  userLocalTime,
  userTimezone,
  firstName,
  lastName,
  email,
  phone,
  healthGoals,
  dietaryRestrictions,
  currentMedications,
  healthConditions,
  preferredContactMethod,
  warningTitle = 'Booking System Under Maintenance',
  warningMessage = "Our online booking system is temporarily unavailable. Please copy your booking details below and send them to us via email. We'll confirm your appointment as soon as possible.",
}: MaintenanceBookingProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const serviceConfig = SERVICES[serviceType];
  const contactEmail = 'athyme4healing@gmail.com';

  // Format booking details as text
  const bookingDetailsText = `
BOOKING REQUEST

Service: ${serviceType}
Duration: ${serviceConfig.duration} minutes
Price: ${serviceConfig.price === 0 ? 'Complimentary' : `$${serviceConfig.price}`}
Consultant: ${consultant}

Date: ${selectedDate}
Time (MST): ${timeSlot.start} - ${timeSlot.end}
Time (Your Local Time): ${userLocalTime}
Your Timezone: ${userTimezone}

CONTACT INFORMATION:
Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone || 'Not provided'}
Preferred Contact: ${preferredContactMethod || 'Email'}

HEALTH INFORMATION:
Health Goals: ${healthGoals || 'Not provided'}
Dietary Restrictions: ${dietaryRestrictions || 'Not provided'}
Current Medications: ${currentMedications || 'Not provided'}
Health Conditions: ${healthConditions || 'Not provided'}
`.trim();

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bookingDetailsText);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy. Please select and copy the text manually.');
    }
  };

  // Create mailto link
  const emailSubject = encodeURIComponent(`Booking Request - ${serviceType}`);
  const emailBody = encodeURIComponent(bookingDetailsText);
  const mailtoLink = `mailto:${contactEmail}?subject=${emailSubject}&body=${emailBody}`;

  return (
    <div className="space-y-6">
      {/* Maintenance Notice */}
      <div className="bg-orange/20 border-2 border-orange rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="text-3xl">⚠️</div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-primary mb-2">
              {warningTitle}
            </h3>
            <p className="text-brown mb-4">
              {warningMessage}
            </p>
            <div className="bg-white/50 p-3 rounded-md">
              <p className="text-sm font-medium text-brown">
                Email us at:{' '}
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-primary hover:underline font-semibold"
                >
                  {contactEmail}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details Display */}
      <div className="bg-sage/10 border border-sage rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-primary mb-4">Your Booking Details</h3>

        <div className="space-y-3 text-sm">
          {/* Service Details */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-brown/70">Service:</p>
              <p className="font-semibold text-primary">{serviceType}</p>
            </div>
            <div>
              <p className="text-brown/70">Consultant:</p>
              <p className="font-semibold text-primary">{consultant}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-brown/70">Duration:</p>
              <p className="font-semibold text-brown">{serviceConfig.duration} minutes</p>
            </div>
            <div>
              <p className="text-brown/70">Price:</p>
              <p className="font-semibold text-brown">
                {serviceConfig.price === 0 ? 'Complimentary' : `$${serviceConfig.price}`}
              </p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="pt-3 border-t border-taupe">
            <p className="text-brown/70">Date:</p>
            <p className="font-semibold text-brown">{selectedDate}</p>
          </div>

          <div>
            <p className="text-brown/70">Time (Mountain Time):</p>
            <p className="font-semibold text-brown">
              {timeSlot.start} - {timeSlot.end}
            </p>
          </div>

          <div>
            <p className="text-brown/70">Time (Your Local Time):</p>
            <p className="font-semibold text-brown">{userLocalTime}</p>
          </div>

          {/* Contact Info */}
          <div className="pt-3 border-t border-taupe">
            <p className="text-brown/70">Name:</p>
            <p className="font-semibold text-brown">
              {firstName} {lastName}
            </p>
          </div>

          <div>
            <p className="text-brown/70">Email:</p>
            <p className="font-semibold text-brown">{email}</p>
          </div>

          {phone && (
            <div>
              <p className="text-brown/70">Phone:</p>
              <p className="font-semibold text-brown">{phone}</p>
            </div>
          )}

          {/* Health Info */}
          {(healthGoals || dietaryRestrictions || currentMedications || healthConditions) && (
            <div className="pt-3 border-t border-taupe">
              <p className="text-brown/70 mb-2">Health Information:</p>
              {healthGoals && (
                <div className="mb-2">
                  <p className="text-xs text-brown/70">Goals:</p>
                  <p className="text-brown">{healthGoals}</p>
                </div>
              )}
              {dietaryRestrictions && (
                <div className="mb-2">
                  <p className="text-xs text-brown/70">Dietary Restrictions:</p>
                  <p className="text-brown">{dietaryRestrictions}</p>
                </div>
              )}
              {currentMedications && (
                <div className="mb-2">
                  <p className="text-xs text-brown/70">Current Medications:</p>
                  <p className="text-brown">{currentMedications}</p>
                </div>
              )}
              {healthConditions && (
                <div className="mb-2">
                  <p className="text-xs text-brown/70">Health Conditions:</p>
                  <p className="text-brown">{healthConditions}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleCopy}
          className="w-full px-6 py-3 bg-primary text-secondary font-semibold rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span>{copyStatus === 'copied' ? 'Copied!' : 'Copy Booking Details'}</span>
        </button>

        <a
          href={mailtoLink}
          className="w-full px-6 py-3 bg-sage text-secondary font-semibold rounded-md hover:bg-sage/90 transition-colors flex items-center justify-center space-x-2 block text-center"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span>Send Email to {contactEmail}</span>
        </a>

        <p className="text-xs text-center text-brown/70 pt-2">
          Your booking details have been prepared. Click &quot;Send Email&quot; to open your email client with
          the details pre-filled, or &quot;Copy&quot; to paste them manually.
        </p>
      </div>
    </div>
  );
}
