import { TODO_LIMITS } from '@/features/todos/config/limits';

/** Trims, drops empty labels, removes duplicates (case is kept) and keeps at most 10. */
export function normalizeLabels(labels: readonly string[]): string[] {
  const unique = new Set<string>();
  for (const label of labels) {
    const trimmed = label.trim();
    if (trimmed !== '') unique.add(trimmed);
  }
  return [...unique].slice(0, TODO_LIMITS.labelsMax);
}
