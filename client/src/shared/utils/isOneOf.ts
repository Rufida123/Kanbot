/** Narrows an unknown value to one of the allowed literals (runtime check for API data). */
export function isOneOf<TValue extends string | number>(
  allowed: readonly TValue[],
  value: unknown,
): value is TValue {
  return allowed.some((item) => item === value);
}
