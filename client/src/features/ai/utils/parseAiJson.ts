/** Pulls the first JSON value out of an AI answer (it may be wrapped in ``` fences or prose). Untrusted. */
export function extractJson(text: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  const candidate = fenced?.[1] ?? text;
  const start = candidate.search(/[[{]/);
  if (start === -1) return null;
  const open = candidate[start];
  const close = open === '[' ? ']' : '}';
  const end = candidate.lastIndexOf(close);
  if (end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

export type Improvement = { title: string | null; description: string | null; criteria: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** `{ title, description, acceptanceCriteria: string[] }`. Anything else is rejected (returns `null`). */
export function parseImprovement(text: string): Improvement | null {
  const data = extractJson(text);
  if (!isRecord(data)) return null;
  const title = typeof data['title'] === 'string' && data['title'].trim() !== '' ? data['title'].trim() : null;
  const description = typeof data['description'] === 'string' && data['description'].trim() !== '' ? data['description'].trim() : null;
  const rawCriteria = data['acceptanceCriteria'];
  const criteria = Array.isArray(rawCriteria)
    ? rawCriteria.filter((item): item is string => typeof item === 'string' && item.trim() !== '').map((item) => item.trim())
    : [];
  return title === null && description === null && criteria.length === 0 ? null : { title, description, criteria };
}

/** `[{ id, points }]`: only known ids and allowed point values survive. */
export function parseEstimates(text: string, knownIds: ReadonlySet<string>, allowed: readonly number[]): Map<string, number> {
  const data = extractJson(text);
  const list = Array.isArray(data) ? data : isRecord(data) && Array.isArray(data['estimates']) ? data['estimates'] : [];
  const result = new Map<string, number>();
  for (const item of list) {
    if (!isRecord(item)) continue;
    const id = item['id'];
    const points = item['points'];
    if (typeof id === 'string' && knownIds.has(id) && typeof points === 'number' && allowed.includes(points)) result.set(id, points);
  }
  return result;
}
