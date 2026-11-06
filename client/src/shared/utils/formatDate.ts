import { DATE_LOCALE } from '@/shared/config/constants';

const DATE_FORMAT = new Intl.DateTimeFormat(DATE_LOCALE, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDateOnly(value: string): Date | null {
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
