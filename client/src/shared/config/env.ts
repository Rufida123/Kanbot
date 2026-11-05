function readApiUrl(): string {
  const value: unknown = import.meta.env.VITE_API_URL;
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      'VITE_API_URL is not set. Copy .env.example to .env and restart the dev server.',
    );
  }
  return value.trim().replace(/\/+$/, '');
}

export const env = {
  apiUrl: readApiUrl(),
} as const;
