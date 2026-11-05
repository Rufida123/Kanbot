import { api, ApiError } from '@/shared/api/client';
import { AUTH_LOGIN_PATH, AUTH_ME_PATH, AUTH_REGISTER_PATH } from '@/shared/config/api';
import type {
  AuthResponse,
  LoginRequest,
  MeResponse,
  RegisterRequest,
  User,
} from '@/shared/types/api';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

function unexpectedResponse(): ApiError {
  return new ApiError({
    status: null,
    code: 'UNEXPECTED_RESPONSE',
    message: 'Something went wrong. Please try again.',
  });
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'name' in value &&
    typeof value.name === 'string' &&
    'email' in value &&
    typeof value.email === 'string'
  );
}

function assertAuthResponse(data: unknown): AuthResponse {
  if (
    typeof data === 'object' &&
    data !== null &&
    'token' in data &&
    typeof data.token === 'string' &&
    data.token !== '' &&
    'user' in data &&
    isUser(data.user)
  ) {
    return { token: data.token, user: data.user };
  }
  throw unexpectedResponse();
}

export async function register(body: RegisterRequest): Promise<AuthResponse> {
  return assertAuthResponse(await api.post<unknown>(AUTH_REGISTER_PATH, body));
}

export async function login(body: LoginRequest): Promise<AuthResponse> {
  return assertAuthResponse(await api.post<unknown>(AUTH_LOGIN_PATH, body));
}

export async function getMe(signal?: AbortSignal): Promise<User> {
  const data: MeResponse = await api.get<MeResponse>(AUTH_ME_PATH, { signal });
  if (!isUser(data?.user)) throw unexpectedResponse();
  return data.user;
}
