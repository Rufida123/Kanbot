/** A whole number from text like "10". Returns `null` for anything else ("", "1.5", "-2", "1e3", "abc"). */
export function parseWholeNumber(value: string): number | null {
  const text = value.trim();
  if (!/^\d{1,9}$/.test(text)) return null;
  return Number(text);
}

export function isWholeNumberInRange(value: string, min: number, max: number): boolean {
  const number = parseWholeNumber(value);
  return number !== null && number >= min && number <= max;
}
