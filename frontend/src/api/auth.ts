import { apiBase } from '../config/urls';

const API_BASE = apiBase;
const TOKEN_KEY = 'hx_auth_token';

export interface AuthUser {
  email: string;
  name?: string;
  picture?: string;
  provider?: string;
}

export interface AuthStatus {
  required: boolean;
  google: boolean;
  password: boolean;
}

export function getAuthToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const authApi = {
  async status(): Promise<AuthStatus> {
    const res = await fetch(`${API_BASE}/auth/status`);
    if (!res.ok) return { required: false, google: false, password: false };
    return res.json() as Promise<AuthStatus>;
  },

  async login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error || 'Login failed');
    }
    return res.json() as Promise<{ token: string; user: AuthUser }>;
  },

  async loginWithGoogle(credential: string): Promise<{ token: string; user: AuthUser }> {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error || 'Google sign-in failed');
    }
    return res.json() as Promise<{ token: string; user: AuthUser }>;
  },

  async logout(): Promise<void> {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: authHeaders(),
    });
  },

  async me(): Promise<AuthUser> {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Session expired');
    return res.json() as Promise<AuthUser>;
  },
};
