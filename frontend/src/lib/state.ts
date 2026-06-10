import { DOCS } from '../data/docs';
import { PHASES } from '../data/phases';
import type { ActivationState } from '../types';
import { daysAgoISO, todayISO } from './utils';

const STORAGE_KEY = 'hx_sal_v4';

export function blankState(): ActivationState {
  const milestones: ActivationState['milestones'] = {};
  PHASES.forEach((p) =>
    p.milestones.forEach((m) => {
      milestones[m.id] = { status: 'pending', date: null, note: '', sentAt: null };
    })
  );

  const docs: ActivationState['docs'] = {};
  DOCS.forEach((d) => {
    docs[d.id] = {
      status: 'not-sent',
      sentDate: null,
      receivedDate: null,
      approvedDate: null,
      link: '',
    };
  });

  const today = todayISO();
  return {
    setupDone: false,
    info: {
      name: '',
      city: '',
      beds: '',
      modules: [],
      type: 'Full Onboarding',
      poc: '',
      startDate: today,
      goliveDate: '',
    },
    milestones,
    docs,
    visits: [],
    pocs: [],
    staff: [],
    nudgeLogs: [],
    activity: [],
  };
}

export function demoState(humblxLead: string): ActivationState {
  const s = blankState();
  s.setupDone = true;
  const ago = daysAgoISO;
  const lead = humblxLead.trim() || 'Humblx Team';

  ['m1', 'm2', 'm3', 'm5', 'm6', 'm7'].forEach((id, i) => {
    s.milestones[id].status = 'done';
    s.milestones[id].date = ago(22 - i * 2);
  });
  s.milestones.m4.status = 'waiting';
  s.milestones.m4.sentAt = new Date(Date.now() - 6 * 24 * 3600000).toISOString();
  s.milestones.m8.status = 'waiting';
  s.milestones.m8.sentAt = new Date(Date.now() - 3 * 24 * 3600000).toISOString();
  s.milestones.m9.status = 'inprogress';
  s.docs.d2.status = 'sent';
  s.docs.d2.sentDate = ago(3);
  s.docs.d8.status = 'approved';
  s.docs.d8.sentDate = ago(20);
  s.docs.d8.receivedDate = ago(19);
  s.docs.d8.approvedDate = ago(18);
  s.info = {
    name: 'Demo Hospital',
    city: 'Gurugram',
    beds: 312,
    modules: ['HK', 'FM', 'Feedback'],
    type: 'Full Onboarding',
    poc: lead,
    startDate: ago(24),
    goliveDate: ago(-18),
  };
  s.pocs = [
    {
      name: 'Dr. Meenakshi Iyer',
      role: 'GM Operations',
      phone: '9818074421',
      email: 'meenakshi.iyer@demohospital.in',
    },
    { name: 'Harpreet Bedi', role: 'Facility Head', phone: '9871230558', email: '' },
  ];
  s.visits = [
    {
      id: 'v1',
      date: ago(20),
      type: 'Site Survey',
      team: [lead],
      clientMet: 'Dr. Meenakshi Iyer (GM Operations)',
      outcome: 'productive',
      nextAction: 'Send facility list template',
      nextOwner: 'Humblx',
      nextDate: ago(18),
    },
  ];
  s.nudgeLogs = [
    {
      sender: lead,
      time: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
      to: 'Dr. Meenakshi Iyer',
    },
  ];
  s.activity = [
    {
      t: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
      txt: 'Facility list marked waiting on client',
    },
    {
      t: new Date(Date.now() - 18 * 24 * 3600000).toISOString(),
      txt: 'Site survey logged — productive',
    },
  ];
  return s;
}

export function normalizeState(s: ActivationState): ActivationState {
  s.activity = s.activity || [];
  s.visits = s.visits || [];
  s.pocs = s.pocs || [];
  s.staff = s.staff || [];
  s.nudgeLogs = s.nudgeLogs || [];
  if (s.setupDone === undefined) s.setupDone = true;
  DOCS.forEach((d) => {
    if (!s.docs[d.id]) {
      s.docs[d.id] = {
        status: 'not-sent',
        sentDate: null,
        receivedDate: null,
        approvedDate: null,
        link: '',
      };
    }
  });
  return s;
}

export function loadLocalState(): ActivationState {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return normalizeState(JSON.parse(saved) as ActivationState);
    } catch {
      /* fall through */
    }
  }
  return blankState();
}

export function saveLocalState(state: ActivationState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
