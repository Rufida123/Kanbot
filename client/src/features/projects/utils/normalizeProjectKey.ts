import { PROJECT_LIMITS } from '@/features/projects/config/limits';

const KEY_PATTERN = new RegExp(`^[A-Z]{${PROJECT_LIMITS.keyMin},${PROJECT_LIMITS.keyMax}}$`);

/** Typing aid: uppercase, letters only, at most the maximum length. "ka-n1" → "KAN". */
export function normalizeProjectKey(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, PROJECT_LIMITS.keyMax);
}

export function isProjectKeyValid(key: string): boolean {
  return KEY_PATTERN.test(key);
}
