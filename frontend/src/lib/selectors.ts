import { MS_ROLE } from '../data/docs';
import { PHASES } from '../data/phases';
import type { ActivationState, MilestoneDef, MilestoneStatus } from '../types';

export function flatMilestones(): MilestoneDef[] {
  return PHASES.flatMap((p) => p.milestones);
}

export function calcProgress(state: ActivationState): number {
  const all = Object.values(state.milestones);
  return Math.round((all.filter((m) => m.status === 'done').length / all.length) * 100);
}

export function getOverdue(state: ActivationState) {
  const now = Date.now();
  const results: { label: string; hours: number; sla: number }[] = [];
  flatMilestones().forEach((m) => {
    const ms = state.milestones[m.id];
    if (ms.status === 'waiting' && ms.sentAt) {
      const h = (now - new Date(ms.sentAt).getTime()) / 3600000;
      if (h > (m.sla || 48)) {
        results.push({ label: m.label, hours: Math.floor(h), sla: m.sla || 48 });
      }
    }
  });
  return results;
}

export function getWaiting(state: ActivationState) {
  const results: {
    id: string;
    label: string;
    sentAt: string | null;
    sla: number;
    owner: string;
  }[] = [];
  flatMilestones().forEach((m) => {
    const ms = state.milestones[m.id];
    if (ms.status === 'waiting') {
      results.push({
        id: m.id,
        label: m.label,
        sentAt: ms.sentAt,
        sla: m.sla || 48,
        owner: m.owner,
      });
    }
  });
  return results;
}

export function getClientWaiting(state: ActivationState) {
  return getWaiting(state).filter((w) => w.owner === 'client');
}

export function getNextActions(state: ActivationState, limit: number) {
  const results: {
    id: string;
    label: string;
    owner: string;
    status: MilestoneStatus;
    sentAt: string | null;
    sla: number;
  }[] = [];

  for (const m of flatMilestones()) {
    const ms = state.milestones[m.id];
    if (ms.status !== 'done') {
      results.push({
        id: m.id,
        label: m.label,
        owner: m.owner,
        status: ms.status,
        sentAt: ms.sentAt,
        sla: m.sla || 48,
      });
      if (results.length >= limit) return results;
    }
  }
  return results;
}

export function roleRegex(kind: string): RegExp {
  return kind === 'facility'
    ? /facilit|maint|admin/i
    : /hr|ops|operation|people|admin/i;
}

export function pickPocFor(state: ActivationState, id: string): number {
  const kind = MS_ROLE[id];
  if (kind && state.pocs.length) {
    const re = roleRegex(kind);
    const i = state.pocs.findIndex((p) => re.test(p.role || ''));
    if (i >= 0) return i;
  }
  return 0;
}
