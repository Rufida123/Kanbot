import { getPreference, setPreference } from '@/shared/lib/preferences';

/**
 * Label colours (enhancement 9). The backend only stores label strings, so the colour of a label is
 * kept in `preferences.ts` keyed by project id and label name (README: faked on the frontend).
 * Each palette entry is a hue used for a dot and a tinted border; label text stays `text.primary`,
 * so contrast never depends on the hue (WCAG AA in both themes).
 */
export const LABEL_PALETTE = ['red', 'orange', 'amber', 'green', 'teal', 'blue', 'indigo', 'pink', 'grey'] as const;
export type LabelColorKey = (typeof LABEL_PALETTE)[number];

export const LABEL_HUES: Record<LabelColorKey, string> = {
  red: '#EF4444',
  orange: '#F97316',
  amber: '#F59E0B',
  green: '#22C55E',
  teal: '#14B8A6',
  blue: '#3B82F6',
  indigo: '#6366F1',
  pink: '#EC4899',
  grey: '#9CA3AF',
};

export function isLabelColor(value: unknown): value is LabelColorKey {
  return LABEL_PALETTE.some((key) => key === value);
}

export function getLabelColors(projectId: string): Record<string, string> {
  return getPreference('labelColors')?.[projectId] ?? {};
}

export function getLabelColor(projectId: string, label: string): LabelColorKey | null {
  const value = getLabelColors(projectId)[label];
  return isLabelColor(value) ? value : null;
}

export function setLabelColor(projectId: string, label: string, color: LabelColorKey | null): void {
  const all = { ...(getPreference('labelColors') ?? {}) };
  const project = { ...(all[projectId] ?? {}) };
  if (color === null) delete project[label];
  else project[label] = color;
  all[projectId] = project;
  setPreference('labelColors', all);
}

/** Rename keeps the colour. Server-side renaming is done by the caller (todos are patched). */
export function renameLabelColor(projectId: string, from: string, to: string): void {
  const color = getLabelColor(projectId, from);
  setLabelColor(projectId, from, null);
  if (color !== null) setLabelColor(projectId, to, color);
}
