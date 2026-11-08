/**
 * Small fuzzy matcher for the command palette: every query character must appear in the text in
 * order (case-insensitive). Higher score = better: consecutive runs and word starts score more,
 * gaps cost a little. Returns `null` when the text does not match.
 */
export function fuzzyScore(query: string, text: string): number | null {
  const needle = query.trim().toLocaleLowerCase();
  if (needle === '') return 0;
  const haystack = text.toLocaleLowerCase();
  let score = 0;
  let position = 0;
  let previous = -2;
  for (const char of needle) {
    const found = haystack.indexOf(char, position);
    if (found === -1) return null;
    const isWordStart = found === 0 || /[\s\-_/.:]/.test(haystack[found - 1] ?? '');
    score += 1;
    if (found === previous + 1) score += 3;
    if (isWordStart) score += 2;
    score -= Math.min(found - position, 5) * 0.1;
    previous = found;
    position = found + 1;
  }
  // An exact substring beats a scattered match.
  if (haystack.includes(needle)) score += 5;
  return score;
}

export function fuzzyFilter<T>(items: readonly T[], query: string, getText: (item: T) => string): T[] {
  if (query.trim() === '') return [...items];
  return items
    .map((item) => ({ item, score: fuzzyScore(query, getText(item)) }))
    .filter((entry): entry is { item: T; score: number } => entry.score !== null)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}
