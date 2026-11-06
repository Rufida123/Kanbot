import { isOneOf } from '@/shared/utils/isOneOf';

/** A URL param as one of the allowed values, or `null` (missing or hand-edited to nonsense). */
export function parseEnumParam<TValue extends string>(
  allowed: readonly TValue[],
  raw: string | null,
): TValue | null {
  return isOneOf(allowed, raw) ? raw : null;
}
