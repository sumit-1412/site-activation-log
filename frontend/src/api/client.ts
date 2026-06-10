import type { ActivationDocument, ActivationState, HospitalSummary } from '../types';
import { authHeaders } from './auth';
import { blankState, loadLocalState, normalizeState, saveLocalState } from '../lib/state';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
export const USE_API =
  import.meta.env.VITE_USE_API === 'true' || Boolean(import.meta.env.VITE_API_URL);

if (import.meta.env.DEV) {
  console.info(
    USE_API
      ? `[activation] API mode → ${API_BASE} (MongoDB via backend)`
      : '[activation] localStorage mode — set VITE_USE_API=true in frontend/.env'
  );
}

function mergeWithDefaults(partial: Partial<ActivationState>): ActivationState {
  const base = blankState();
  return normalizeState({
    ...base,
    ...partial,
    info: { ...base.info, ...partial.info },
    milestones: { ...base.milestones, ...partial.milestones },
    docs: { ...base.docs, ...partial.docs },
  });
}

export interface HealthResult {
  ok: boolean;
  mongodb?: 'connected' | 'disconnected' | 'local';
  error?: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function isUnauthorized(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401;
}

export function stateFromDoc(doc: ActivationDocument): ActivationState {
  const { _id, createdAt, updatedAt, ...state } = doc;
  void _id;
  void createdAt;
  void updatedAt;
  return mergeWithDefaults(state);
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(path, {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  });
}

/**
 * API client — uses localStorage unless VITE_USE_API=true or VITE_API_URL is set.
 */
export const activationApi = {
  async health(): Promise<HealthResult> {
    if (!USE_API) {
      return { ok: true, mongodb: 'local' };
    }
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = (await res.json()) as { status?: string; mongodb?: string; error?: string };
      if (res.ok && data.mongodb === 'connected') {
        return { ok: true, mongodb: 'connected' };
      }
      return {
        ok: false,
        mongodb: 'disconnected',
        error: data.error || 'MongoDB is not connected',
      };
    } catch {
      return {
        ok: false,
        mongodb: 'disconnected',
        error: 'Cannot reach API server — is the backend running on port 8080?',
      };
    }
  },

  async list(): Promise<HospitalSummary[]> {
    if (!USE_API) return [];
    const res = await apiFetch(`${API_BASE}/activations`);
    if (res.status === 401) throw new ApiError('Unauthorized', 401);
    if (!res.ok) throw new ApiError('Failed to list hospitals', res.status);
    return res.json() as Promise<HospitalSummary[]>;
  },

  async get(id?: string): Promise<ActivationState> {
    if (!USE_API) {
      return loadLocalState();
    }
    const path = id ? `${API_BASE}/activations/${id}` : `${API_BASE}/activations/current`;
    const res = await apiFetch(path);
    if (res.status === 404) {
      return blankState();
    }
    if (res.status === 401) {
      throw new ApiError('Session expired — please sign in again', 401);
    }
    if (!res.ok) throw new ApiError('Failed to load activation', res.status);
    const doc = (await res.json()) as ActivationDocument;
    return stateFromDoc(doc);
  },

  async select(id: string): Promise<ActivationDocument> {
    const res = await apiFetch(`${API_BASE}/activations/${id}/select`, { method: 'POST' });
    if (res.status === 401) throw new ApiError('Unauthorized', 401);
    if (!res.ok) throw new ApiError('Failed to select hospital', res.status);
    return res.json() as Promise<ActivationDocument>;
  },

  async save(state: ActivationState, id?: string): Promise<ActivationDocument | void> {
    if (!USE_API) {
      saveLocalState(state);
      return;
    }
    const path = id ? `${API_BASE}/activations/${id}` : `${API_BASE}/activations/current`;
    const res = await apiFetch(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    if (res.status === 401) throw new ApiError('Unauthorized', 401);
    if (!res.ok) throw new ApiError('Failed to save activation', res.status);
    return res.json() as Promise<ActivationDocument>;
  },

  async create(state: ActivationState): Promise<ActivationDocument> {
    if (!USE_API) {
      saveLocalState(state);
      return { ...state, _id: 'local' };
    }
    const res = await apiFetch(`${API_BASE}/activations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    if (res.status === 401) throw new ApiError('Unauthorized', 401);
    if (!res.ok) throw new ApiError('Failed to create hospital', res.status);
    return res.json() as Promise<ActivationDocument>;
  },

  async delete(id: string): Promise<void> {
    if (!USE_API) {
      localStorage.removeItem('hx_sal_v4');
      return;
    }
    const res = await apiFetch(`${API_BASE}/activations/${id}`, { method: 'DELETE' });
    if (res.status === 401) throw new ApiError('Unauthorized', 401);
    if (!res.ok && res.status !== 404) throw new ApiError('Failed to delete hospital', res.status);
  },
};
