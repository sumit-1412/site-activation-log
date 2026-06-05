import type { ActivationDocument, ActivationState } from '../types';
import { blankState, loadLocalState, saveLocalState } from '../lib/state';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * API client — uses localStorage until Go/MongoDB backend is connected.
 * Endpoints mirror planned REST API for activations collection.
 */
export const activationApi = {
  async get(id?: string): Promise<ActivationState> {
    if (!import.meta.env.VITE_API_URL) {
      return loadLocalState();
    }
    const path = id ? `${API_BASE}/activations/${id}` : `${API_BASE}/activations/current`;
    const res = await fetch(path);
    if (!res.ok) throw new Error('Failed to load activation');
    const doc = (await res.json()) as ActivationDocument;
    const { _id, createdAt, updatedAt, ...state } = doc;
    void _id;
    void createdAt;
    void updatedAt;
    return state;
  },

  async save(state: ActivationState, id?: string): Promise<void> {
    if (!import.meta.env.VITE_API_URL) {
      saveLocalState(state);
      return;
    }
    const path = id ? `${API_BASE}/activations/${id}` : `${API_BASE}/activations/current`;
    const res = await fetch(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    if (!res.ok) throw new Error('Failed to save activation');
  },

  async create(state: ActivationState): Promise<ActivationDocument> {
    if (!import.meta.env.VITE_API_URL) {
      saveLocalState(state);
      return { ...state, _id: 'local' };
    }
    const res = await fetch(`${API_BASE}/activations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    if (!res.ok) throw new Error('Failed to create activation');
    return res.json() as Promise<ActivationDocument>;
  },

  async reset(): Promise<ActivationState> {
    localStorage.removeItem('hx_sal_v4');
    if (import.meta.env.VITE_API_URL) {
      await fetch(`${API_BASE}/activations/current`, { method: 'DELETE' });
    }
    return blankState();
  },
};
