/**
 * The ONE place where enhancement preferences are read and written (README → Enhancements).
 *
 * - NFR-7 still holds for the base app: it stores only the JWT (`tokenStorage.ts`).
 * - REQUIREMENTS §9 allows `localStorage` for enhancements that would need the backend, and
 *   AI_RULES says to save theme/language on the backend "where possible". The backend cannot
 *   change here, so this helper is the documented fallback.
 * - One versioned key. Every access is wrapped in try/catch; when storage is blocked the values
 *   live in memory for the current tab. Never store tokens, emails or AI answers elsewhere.
 */
export const PREFERENCES_KEY = 'kanbot:prefs:v1';
const PREFERENCES_VERSION = 1;

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'ar';
export type Density = 'comfortable' | 'compact';
export type SprintTemplate = { lengthDays: number; capacity: number };
export type StoredChatMessage = { role: 'user' | 'assistant'; content: string; sprintId?: string };
export type RecentItem = {
  kind: 'project' | 'todo' | 'sprint';
  id: string;
  projectId: string;
  title: string;
  path: string;
};

export type Preferences = {
  themeMode?: ThemeMode;
  language?: Language;
  density?: Density;
  /** WCAG 2.1.4: single-key shortcuts can be turned off (default: on). */
  singleKeyShortcuts?: boolean;
  sprintTemplate?: SprintTemplate;
  /** projectId → label name → palette key. */
  labelColors?: Record<string, Record<string, string>>;
  /** Per-user data (cleared on sign out): projectId → last messages. */
  chatHistory?: Record<string, StoredChatMessage[]>;
  /** Per-user data (cleared on sign out). */
  recentItems?: RecentItem[];
};

/** Keys that belong to the signed-in user and are removed on sign out. UI-only prefs stay. */
const USER_DATA_KEYS = ['chatHistory', 'recentItems'] as const satisfies readonly (keyof Preferences)[];

type Listener = () => void;
const listeners = new Set<Listener>();
let memory: Preferences = {};
let isLoaded = false;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function load(): Preferences {
  try {
    const raw = window.localStorage.getItem(PREFERENCES_KEY);
    if (raw === null) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed['version'] !== PREFERENCES_VERSION || !isRecord(parsed['data'])) return {};
    return parsed['data'] as Preferences;
  } catch {
    // Blocked storage or corrupted JSON: start clean, never crash.
    return {};
  }
}

function persist(): void {
  try {
    window.localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({ version: PREFERENCES_VERSION, data: memory }),
    );
  } catch {
    // Storage blocked or full: the in-memory copy keeps working until the tab closes.
  }
}

export function readPreferences(): Preferences {
  if (!isLoaded) {
    memory = load();
    isLoaded = true;
  }
  return memory;
}

export function getPreference<TKey extends keyof Preferences>(key: TKey): Preferences[TKey] {
  return readPreferences()[key];
}

export function setPreference<TKey extends keyof Preferences>(
  key: TKey,
  value: Preferences[TKey] | undefined,
): void {
  const next: Preferences = { ...readPreferences() };
  if (value === undefined) delete next[key];
  else next[key] = value;
  memory = next;
  persist();
  listeners.forEach((listener) => listener());
}

/** Sign out: removes per-user data (chat history, recent items). Theme and language stay. */
export function clearUserPreferences(): void {
  const next: Preferences = { ...readPreferences() };
  for (const key of USER_DATA_KEYS) delete next[key];
  memory = next;
  persist();
  listeners.forEach((listener) => listener());
}

export function subscribePreferences(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Test helper: forget the in-memory copy so the next read hits storage again. */
export function resetPreferencesCache(): void {
  memory = {};
  isLoaded = false;
}
