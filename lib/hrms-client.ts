'use client';

export type HrmsUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
};

type AuthResponse = { user: HrmsUser };

const configuredBase = process.env.NEXT_PUBLIC_HRMS_API_URL ?? 'https://hrms.blinto.co/api/v1';
const API_BASE = configuredBase.replace(/\/$/, '');

export class HrmsApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HrmsApiError';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    let message = 'The request failed.';
    try {
      const body = (await response.json()) as { message?: string };
      message = body.message ?? message;
    } catch {
      // Keep the generic message when the API returns no JSON body.
    }
    throw new HrmsApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function signIn(email: string, password: string): Promise<HrmsUser> {
  const session = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return session.user;
}

export async function currentUser(): Promise<HrmsUser | null> {
  try {
    return await request<HrmsUser>('/auth/me');
  } catch (error) {
    if (!(error instanceof HrmsApiError) || error.status !== 401) throw error;
  }

  try {
    await request('/auth/refresh', { method: 'POST' });
    return await request<HrmsUser>('/auth/me');
  } catch (error) {
    if (error instanceof HrmsApiError && (error.status === 401 || error.status === 403)) {
      return null;
    }
    throw error;
  }
}

export async function signOut(): Promise<void> {
  await request('/auth/logout', { method: 'POST' });
}

export async function listUsers(): Promise<HrmsUser[]> {
  const result = await request<HrmsUser[] | { data: HrmsUser[] }>('/users');
  return Array.isArray(result) ? result : result.data;
}
