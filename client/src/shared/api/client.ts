import axios, { isAxiosError } from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { AUTH_LOGIN_PATH, REQUEST_TIMEOUT_MS } from '@/shared/config/api';
import { env } from '@/shared/config/env';
import { useSessionStore } from '@/shared/stores/sessionStore';
import type { ApiErrorBody, ErrorCode } from '@/shared/types/api';

export type ApiErrorCode = ErrorCode | 'NETWORK_ERROR' | 'TIMEOUT' | 'UNEXPECTED_RESPONSE';
export type ApiErrorDetail = { path: string; message: string };

const NETWORK_MESSAGE = 'Cannot reach the server. Is it running?';
const TIMEOUT_MESSAGE = 'The server took too long to respond. Try again.';
const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

export class ApiError extends Error {
  readonly status: number | null;
  readonly code: ApiErrorCode;
  readonly details: readonly ApiErrorDetail[];

  constructor(params: {
    status: number | null;
    code: ApiErrorCode;
    message: string;
    details?: readonly ApiErrorDetail[];
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.code = params.code;
    this.details = params.details ?? [];
  }

  /** Worth retrying automatically: the request may succeed later without changes. */
  get isRetryable(): boolean {
    return (
      this.code === 'NETWORK_ERROR' ||
      this.code === 'TIMEOUT' ||
      (this.status !== null && this.status >= 500)
    );
  }
}

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

/** Registered by `AuthBootstrap`. Called for every 401 except a failed login. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const { token } = useSessionStore.getState();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

function isApiErrorBody(data: unknown): data is ApiErrorBody {
  if (typeof data !== 'object' || data === null || !('error' in data)) return false;
  const { error } = data;
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    'message' in error &&
    typeof error.message === 'string'
  );
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (!isAxiosError(error)) {
    return new ApiError({ status: null, code: 'UNEXPECTED_RESPONSE', message: GENERIC_MESSAGE });
  }
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new ApiError({ status: null, code: 'TIMEOUT', message: TIMEOUT_MESSAGE });
  }
  if (!error.response) {
    return new ApiError({ status: null, code: 'NETWORK_ERROR', message: NETWORK_MESSAGE });
  }
  const { status, data } = error.response;
  if (isApiErrorBody(data)) {
    return new ApiError({
      status,
      code: data.error.code,
      message: data.error.message,
      details: data.error.details ?? [],
    });
  }
  // Proxy error pages, HTML, empty bodies: never show them to the user.
  return new ApiError({
    status,
    code: status >= 500 ? 'INTERNAL_ERROR' : 'UNEXPECTED_RESPONSE',
    message: GENERIC_MESSAGE,
  });
}

/**
 * A 401 only counts if it belongs to the session that is active now. A late 401
 * from a request sent with an older token (before a new login) must not log the
 * user out again.
 */
function belongsToCurrentSession(config: AxiosRequestConfig | undefined): boolean {
  const { token } = useSessionStore.getState();
  const sentAuthorization = config?.headers?.['Authorization'];
  return typeof sentAuthorization === 'string' && sentAuthorization === `Bearer ${token ?? ''}`;
}

function isLoginRequest(config: AxiosRequestConfig | undefined): boolean {
  return config?.url === AUTH_LOGIN_PATH;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error);
    const config = isAxiosError(error) ? error.config : undefined;
    if (apiError.status === 401 && !isLoginRequest(config) && belongsToCurrentSession(config)) {
      unauthorizedHandler?.();
    }
    return Promise.reject(apiError);
  },
);

/** Typed request helper. A 204 resolves to `undefined`. */
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  if (response.status === 204) return undefined as T;
  return response.data;
}

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'GET', url }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'POST', url, data }),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'PATCH', url, data }),
  delete: <T = void>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'DELETE', url }),
};

/** Maps `details[]` to `{ [field]: message }` (first message per field) for `setError`. */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  const result: Record<string, string> = {};
  for (const { path, message } of error.details) {
    if (path !== '' && !(path in result)) result[path] = message;
  }
  return result;
}
