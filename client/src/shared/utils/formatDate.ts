import { DATE_LOCALE } from '@/shared/config/constants';

const DATE_FORMAT = new Intl.DateTimeFormat(DATE_LOCALE, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A local `Date` (midnight) from `YYYY-MM-DD`, or `null` when it is not a real calendar date. */
export function parseDateOnly(value: string): Date | null {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  // A local date built from the parts: `new Date('2026-10-30')` is UTC midnight and shows the
  // previous day in time zones behind UTC.
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const isSameDay =
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day);
  return isSameDay ? date : null;
}

/** True for a real calendar date written as `YYYY-MM-DD` (the API's date-only format). */
export function isDateOnly(value: string): boolean {
  return parseDateOnly(value) !== null;
}

/** "Oct 30, 2026" from a `YYYY-MM-DD` string. Returns the input when it is not a valid date. */
export function formatDateOnly(value: string): string {
  const date = parseDateOnly(value);
  return date === null ? value : DATE_FORMAT.format(date);
}

/** "Oct 21, 2026" from an ISO 8601 timestamp. Returns an empty string when it is not a date. */
export function formatTimestamp(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : DATE_FORMAT.format(date);
}

const DATE_TIME_FORMAT = new Intl.DateTimeFormat(DATE_LOCALE, { dateStyle: 'medium', timeStyle: 'short' });

/** "Oct 21, 2026, 3:45 PM" from an ISO 8601 timestamp. Returns an empty string when it is not a date. */
export function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : DATE_TIME_FORMAT.format(date);
}

/** `YYYY-MM-DD` from a local date (never `toISOString`, which converts to UTC and can shift the day). */
export function toDateOnly(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Today in local time as `YYYY-MM-DD`. */
export function getTodayDateOnly(): string {
  return toDateOnly(new Date());
}

/** `value` plus `days` calendar days (local time). Returns the input when it is not a valid date. */
export function addDaysToDateOnly(value: string, days: number): string {
  const date = parseDateOnly(value);
  if (date === null) return value;
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + days);
  return toDateOnly(shifted);
}

const DAY_FORMAT = new Intl.DateTimeFormat(DATE_LOCALE, { month: 'short', day: 'numeric' });

/**
 * "Oct 20 – Nov 2". The year is added only when a date is not in the current year.
 * One date missing: the other one is shown alone. Both missing: an empty string.
 */
export function formatDateRange(startDate: string | null, endDate: string | null): string {
  const currentYear = new Date().getFullYear();
  const formatOne = (value: string | null): string => {
    if (value === null) return '';
    const date = parseDateOnly(value);
    if (date === null) return value;
    return date.getFullYear() === currentYear ? DAY_FORMAT.format(date) : DATE_FORMAT.format(date);
  };
  const start = formatOne(startDate);
  const end = formatOne(endDate);
  if (start !== '' && end !== '') return `${start} – ${end}`;
  return start !== '' ? start : end;
}
