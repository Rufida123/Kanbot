const MAX_INITIALS = 2;

/** "Ada Lovelace" → "AL", "ada" → "A", "" → "?". */
export function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter((word) => word !== '')
    .slice(0, MAX_INITIALS)
    .map((word) => Array.from(word)[0] ?? '')
    .join('')
    .toUpperCase();
  return initials === '' ? '?' : initials;
}
