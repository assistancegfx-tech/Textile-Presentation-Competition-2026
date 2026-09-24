/**
 * Centralized Date & Deadline Configuration for Textile Presentation Competition 2026
 */

// Registration closes on 30 September 2026 at 11:59:59 PM (Bangladesh Time, UTC+6)
export const REGISTRATION_DEADLINE_ISO = '2026-09-30T23:59:59+06:00';
export const REGISTRATION_DEADLINE_TIMESTAMP = new Date(REGISTRATION_DEADLINE_ISO).getTime();
export const REGISTRATION_DEADLINE_LABEL = '30 September 2026, 11:59 PM BST';
export const REGISTRATION_DEADLINE_SHORT = '30 September 2026';

// Main Event Date: 04 October 2026 at 09:00 AM BST
export const EVENT_DATE_ISO = '2026-10-04T09:00:00+06:00';
export const EVENT_DATE_LABEL = '4 October 2026, 9:00 AM BST';
export const EVENT_DATE_SHORT = '4 October 2026';
export const EVENT_VENUE = 'BTEC Auditorium';

/**
 * Checks if current time is past the registration deadline
 */
export const isRegistrationClosed = (): boolean => {
  return Date.now() >= REGISTRATION_DEADLINE_TIMESTAMP;
};

export interface CountdownTimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalMsRemaining: number;
}

/**
 * Calculates time remaining until registration deadline
 */
export const getTimeUntilRegistrationDeadline = (): CountdownTimeLeft => {
  const now = Date.now();
  const diff = REGISTRATION_DEADLINE_TIMESTAMP - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      totalMsRemaining: 0
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    totalMsRemaining: diff
  };
};
