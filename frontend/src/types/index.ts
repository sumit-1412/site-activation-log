export type MilestoneStatus = 'pending' | 'inprogress' | 'waiting' | 'blocked' | 'done';
export type DocStatus = 'not-sent' | 'sent' | 'received' | 'approved';
export type Owner = 'humblx' | 'client';
export type MsFilter = 'all' | 'waiting' | 'ours' | 'done';

export interface MilestoneDef {
  id: string;
  label: string;
  owner: Owner;
  sla: number | null;
}

export interface Phase {
  id: number;
  name: string;
  milestones: MilestoneDef[];
}

export interface DocDefinition {
  id: string;
  name: string;
}

export interface MilestoneState {
  status: MilestoneStatus;
  date: string | null;
  note: string;
  sentAt: string | null;
}

export interface DocState {
  status: DocStatus;
  sentDate: string | null;
  receivedDate: string | null;
  approvedDate: string | null;
  link: string;
}

export interface HospitalInfo {
  name: string;
  city: string;
  beds: number | string;
  modules: string[];
  type: string;
  poc: string;
  startDate: string;
  goliveDate: string;
}

export interface Poc {
  name: string;
  role: string;
  phone: string;
  email: string;
}

export interface Visit {
  id: string;
  date: string;
  type: string;
  team: string[];
  clientMet: string;
  outcome: 'productive' | 'partial' | 'ghost' | 'rescheduled' | string;
  nextAction: string;
  nextOwner: string;
  nextDate: string;
}

export interface NudgeLog {
  sender: string;
  time: string;
  to: string;
}

export interface ActivityEntry {
  t: string;
  txt: string;
}

export interface ActivationState {
  setupDone: boolean;
  info: HospitalInfo;
  milestones: Record<string, MilestoneState>;
  docs: Record<string, DocState>;
  visits: Visit[];
  pocs: Poc[];
  staff: unknown[];
  nudgeLogs: NudgeLog[];
  activity: ActivityEntry[];
}

export interface TemplateAsset {
  name: string;
  file: string;
  mime: string;
  desc: string;
  kind: 'client' | 'internal';
  b64: string;
}

/** MongoDB document shape — ready for Go backend */
export interface ActivationDocument extends ActivationState {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}
