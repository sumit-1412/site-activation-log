import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { activationApi, ApiError, isUnauthorized, stateFromDoc, USE_API } from '../api/client';
import { useAuth } from './AuthContext';
import { DOC_NAME, MS_DOC } from '../data/docs';
import { PHASES } from '../data/phases';
import { flatMilestones } from '../lib/selectors';
import { blankState, demoState } from '../lib/state';
import { pickPocFor } from '../lib/selectors';
import { appNavigate } from '../lib/navigation';
import { displayNameFromUser, humblxPocName } from '../lib/user';
import { buzz, todayISO } from '../lib/utils';
import { ROUTES } from '../routes/paths';
import type {
  ActivationState,
  DocStatus,
  HospitalInfo,
  HospitalSummary,
  MilestoneStatus,
  MsFilter,
  Poc,
  Visit,
} from '../types';

export type DbStatus = 'checking' | 'connected' | 'disconnected' | 'local';

interface AppContextValue {
  state: ActivationState;
  loaded: boolean;
  dbStatus: DbStatus;
  dbError: string | null;
  bootError: { title: string; message: string; hint?: string } | null;
  retryConnection: () => void;
  msFilter: MsFilter;
  senderName: string;
  nudgePoc: number;
  toast: string | null;
  statusModal: { open: boolean; milestoneId: string | null; note: string; date: string };
  visitModalOpen: boolean;
  pocModalOpen: boolean;
  openPhases: Set<number>;
  setupPocs: Partial<Poc>[];
  hospitals: HospitalSummary[];
  currentHospitalId: string | null;
  setMsFilter: (f: MsFilter) => void;
  setNudgePoc: (i: number) => void;
  showToast: (msg: string) => void;
  togglePhase: (id: number) => void;
  openPhaseForMilestone: (milestoneId: string) => void;
  openStatusModal: (milestoneId: string) => void;
  closeStatusModal: () => void;
  updateStatusDraft: (patch: Partial<{ note: string; date: string }>) => void;
  setVisitModalOpen: (open: boolean) => void;
  setPocModalOpen: (open: boolean) => void;
  applyStatus: (id: string, status: MilestoneStatus, note?: string, date?: string) => void;
  confirmStatusModal: (status: MilestoneStatus) => void;
  advanceDoc: (id: string, status: DocStatus) => void;
  saveDocLink: (id: string, link: string) => void;
  saveVisit: (visit: Omit<Visit, 'id'>) => void;
  saveInfo: (info: HospitalInfo) => void;
  addPoc: (poc: Poc) => void;
  sendNudge: (message: string) => void;
  copyNudge: (message: string) => void;
  quickNudge: (id: string, label?: string) => void;
  escalate: (id: string, label: string) => void;
  selectHospital: (id: string) => Promise<void>;
  createHospital: (info: HospitalInfo, pocs: Poc[]) => Promise<string | null>;
  updateHospital: (id: string, info: HospitalInfo, pocs: Poc[]) => Promise<string | null>;
  deleteHospital: (id: string) => Promise<void>;
  refreshHospitals: () => Promise<HospitalSummary[]>;
  loadDemo: () => Promise<void>;
  setSetupPocs: (pocs: Partial<Poc>[]) => void;
  resetSetupForm: () => void;
  addSetupPoc: () => void;
  removeSetupPoc: (i: number) => void;
  clientDone: (label: string) => void;
  nudgeDraft: string | null;
  clearNudgeDraft: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function pushActivity(state: ActivationState, txt: string): ActivationState {
  return {
    ...state,
    activity: [{ t: new Date().toISOString(), txt }, ...state.activity].slice(0, 40),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { authReady, authRequired, user, clearSession } = useAuth();
  const [state, setState] = useState<ActivationState>(blankState);
  const [loaded, setLoaded] = useState(false);
  const [msFilter, setMsFilter] = useState<MsFilter>('all');
  const [nudgePoc, setNudgePoc] = useState(0);
  const senderName = useMemo(() => displayNameFromUser(user), [user]);
  const [toast, setToast] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState({
    open: false,
    milestoneId: null as string | null,
    note: '',
    date: todayISO(),
  });
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [pocModalOpen, setPocModalOpen] = useState(false);
  const [openPhases, setOpenPhases] = useState<Set<number>>(new Set());
  const [setupPocs, setSetupPocs] = useState<Partial<Poc>[]>([{}]);
  const [nudgeDraft, setNudgeDraft] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<HospitalSummary[]>([]);
  const [currentHospitalId, setCurrentHospitalId] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<DbStatus>('checking');
  const [dbError, setDbError] = useState<string | null>(null);
  const [bootError, setBootError] = useState<{
    title: string;
    message: string;
    hint?: string;
  } | null>(null);

  const checkConnection = useCallback(async () => {
    setDbStatus('checking');
    setDbError(null);

    const health = await activationApi.health();
    if (!health.ok) {
      setDbStatus('disconnected');
      setDbError(health.error ?? 'MongoDB is not connected');
      setLoaded(true);
      return false;
    }

    setDbStatus(USE_API ? 'connected' : 'local');
    return true;
  }, []);

  const refreshHospitals = useCallback(async () => {
    const list = await activationApi.list();
    setHospitals(list);
    return list;
  }, []);

  const loadWorkspace = useCallback(async () => {
    setBootError(null);
    try {
      const list = await refreshHospitals();
      const current = list.find((h) => h.isCurrent);
      if (current) {
        setCurrentHospitalId(current._id);
        const s = await activationApi.get(current._id);
        setState(s);
      } else {
        setCurrentHospitalId(null);
        setState(blankState());
      }
    } catch (err) {
      if (isUnauthorized(err)) {
        clearSession();
        setDbStatus(USE_API ? 'connected' : 'local');
        setDbError(null);
        setBootError(null);
      } else if (err instanceof ApiError && err.status === 405) {
        setDbStatus(USE_API ? 'connected' : 'local');
        setBootError({
          title: 'API server needs a restart',
          message:
            'The backend is running an old version that does not support listing hospitals.',
          hint: 'Stop the old process and run npm run dev:api from the project root (or go run ./cmd/server in backend/). MongoDB is fine.',
        });
      } else if (err instanceof ApiError) {
        setDbStatus(USE_API ? 'connected' : 'local');
        setBootError({
          title: 'Could not load data',
          message: err.message,
          hint: 'Check that the Go API is running on port 8080 and try again.',
        });
      } else {
        setDbStatus('disconnected');
        setDbError('Failed to load data from the API');
      }
    } finally {
      setLoaded(true);
    }
  }, [clearSession, refreshHospitals]);

  const bootstrap = useCallback(async () => {
    if (!authReady) return;

    setLoaded(false);
    setBootError(null);
    const healthOk = await checkConnection();
    if (!healthOk) {
      setLoaded(true);
      return;
    }

    if (authRequired && !user) {
      setDbStatus(USE_API ? 'connected' : 'local');
      setDbError(null);
      setLoaded(true);
      return;
    }

    await loadWorkspace();
  }, [authReady, authRequired, user, checkConnection, loadWorkspace]);

  const retryConnection = useCallback(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const persist = useCallback(
    (next: ActivationState) => {
      setState(next);
      if (!currentHospitalId) return;
      void activationApi.save(next, currentHospitalId).then(() => {
        void refreshHospitals();
      }).catch((err) => {
        if (isUnauthorized(err)) {
          clearSession();
          showToast('Session expired — please sign in again');
          return;
        }
        setDbStatus('disconnected');
        setDbError('Failed to save — MongoDB may be disconnected');
        showToast('Save failed — check MongoDB connection');
      });
    },
    [currentHospitalId, clearSession, showToast, refreshHospitals]
  );

  const togglePhase = useCallback((id: number) => {
    setOpenPhases((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const openPhaseForMilestone = useCallback((milestoneId: string) => {
    const phase = PHASES.find((p) => p.milestones.some((m) => m.id === milestoneId));
    if (phase) setOpenPhases((prev) => new Set(prev).add(phase.id));
    appNavigate(ROUTES.timeline);
  }, []);

  const applyStatus = useCallback(
    (id: string, status: MilestoneStatus, note?: string, date?: string) => {
      const next = structuredClone(state);
      const ms = next.milestones[id];
      ms.status = status;
      if (note !== undefined) ms.note = note;
      ms.date = date || todayISO();
      if (status === 'waiting') ms.sentAt = new Date().toISOString();

      let extra = '';
      const link = MS_DOC[id];
      if (link && (status === 'done' || (status === 'waiting' && link[1] === 'sent'))) {
        const [docId, step] = link;
        const doc = next.docs[docId];
        const today = todayISO();
        const order: DocStatus[] = ['not-sent', 'sent', 'received', 'approved'];
        if (order.indexOf(step as DocStatus) > order.indexOf(doc.status) || status === 'done') {
          doc.status = step as DocStatus;
          if (step === 'sent' && !doc.sentDate) doc.sentDate = today;
          if (step === 'received' && !doc.receivedDate) doc.receivedDate = today;
          if (step === 'approved') {
            if (!doc.sentDate) doc.sentDate = today;
            if (!doc.receivedDate) doc.receivedDate = today;
            doc.approvedDate = today;
          }
          extra = ` · ${DOC_NAME[docId]} doc updated`;
        }
      }

      const milestone = flatMilestones().find((m) => m.id === id);
      const withActivity = pushActivity(
        next,
        `${milestone?.label || id} → ${status === 'waiting' ? 'waiting on client' : status}`
      );
      persist(withActivity);
      buzz(status === 'done' ? 18 : 12);
      showToast(
        (status === 'done' ? 'Done' : status === 'waiting' ? 'Waiting on client' : 'Updated') +
          extra
      );
    },
    [persist, showToast, state]
  );

  const openStatusModal = useCallback(
    (milestoneId: string) => {
      const ms = state.milestones[milestoneId];
      setStatusModal({
        open: true,
        milestoneId,
        note: ms?.note || '',
        date: ms?.date || todayISO(),
      });
    },
    [state.milestones]
  );

  const closeStatusModal = useCallback(() => {
    setStatusModal((s) => ({ ...s, open: false, milestoneId: null }));
  }, []);

  const updateStatusDraft = useCallback((patch: Partial<{ note: string; date: string }>) => {
    setStatusModal((s) => ({ ...s, ...patch }));
  }, []);

  const confirmStatusModal = useCallback(
    (status: MilestoneStatus) => {
      if (!statusModal.milestoneId) return;
      applyStatus(statusModal.milestoneId, status, statusModal.note, statusModal.date);
      closeStatusModal();
    },
    [applyStatus, closeStatusModal, statusModal]
  );

  const advanceDoc = useCallback(
    (id: string, status: DocStatus) => {
      const next = structuredClone(state);
      const doc = next.docs[id];
      const today = todayISO();
      doc.status = status;
      if (status === 'sent') doc.sentDate = today;
      if (status === 'received') doc.receivedDate = today;
      if (status === 'approved') doc.approvedDate = today;
      persist(pushActivity(next, `${DOC_NAME[id] || 'Document'} → ${status}`));
      buzz(10);
      showToast('Document updated');
    },
    [persist, showToast, state]
  );

  const saveDocLink = useCallback(
    (id: string, link: string) => {
      const next = structuredClone(state);
      next.docs[id].link = link;
      persist(next);
    },
    [persist, state]
  );

  const saveVisit = useCallback(
    (visit: Omit<Visit, 'id'>) => {
      const next = structuredClone(state);
      next.visits.push({ ...visit, id: `v${Date.now()}` });
      persist(pushActivity(next, `${visit.type} visit logged — ${visit.outcome}`));
      buzz();
      showToast('Visit logged');
      setVisitModalOpen(false);
    },
    [persist, showToast, state]
  );

  const withHumblxPoc = useCallback(
    (info: HospitalInfo): HospitalInfo => ({
      ...info,
      poc: humblxPocName(info.poc, user),
    }),
    [user]
  );

  const saveInfo = useCallback(
    (info: HospitalInfo) => {
      const next = { ...state, info: withHumblxPoc(info) };
      persist(next);
      showToast('Details saved');
    },
    [persist, showToast, state, withHumblxPoc]
  );

  const addPoc = useCallback(
    (poc: Poc) => {
      const next = structuredClone(state);
      next.pocs.push(poc);
      persist(next);
      showToast('PoC added');
      setPocModalOpen(false);
    },
    [persist, showToast, state]
  );

  const sendNudge = useCallback(
    (message: string) => {
      if (!state.pocs.length) {
        showToast('Add a contact in Info first');
        return;
      }
      const poc = state.pocs[nudgePoc] || state.pocs[0];
      const phone = poc.phone || '';
      const next = pushActivity(
        {
          ...state,
          nudgeLogs: [
            ...state.nudgeLogs,
            { sender: senderName, time: new Date().toISOString(), to: poc.name || 'Client PoC' },
          ],
        },
        `Nudge sent by ${senderName} to ${poc.name || 'client'}`
      );
      persist(next);
      window.open(`https://wa.me/${phone ? `91${phone}` : ''}?text=${encodeURIComponent(message)}`, '_blank');
      showToast(`Opening WhatsApp — ${poc.name || 'client'}`);
    },
    [senderName, nudgePoc, persist, showToast, state]
  );

  const copyNudge = useCallback(
    (message: string) => {
      void navigator.clipboard.writeText(message).then(() => showToast('Copied to clipboard'));
    },
    [showToast]
  );

  const quickNudge = useCallback(
    (id: string, label?: string) => {
      setNudgePoc(pickPocFor(state, id));
      appNavigate(ROUTES.nudge);
      if (label) {
        const to = state.pocs[pickPocFor(state, id)]?.name?.split(' ')[0];
        setNudgeDraft(
          `Hi${to ? ` ${to}` : ''},\n\nHope you're well! This is ${senderName} from Humblx.\n\nQuick follow-up — we're waiting on:\n\n• ${label}\n\nPlease let us know once done or if you need any help.\n\nThank you!\n${senderName}\nHumblx`
        );
      }
    },
    [senderName, state]
  );

  const escalate = useCallback(
    (id: string, label: string) => {
      setNudgePoc(pickPocFor(state, id));
      appNavigate(ROUTES.nudge);
      const to = state.pocs[pickPocFor(state, id)]?.name?.split(' ')[0];
      setNudgeDraft(
        `Hi${to ? ` ${to}` : ''},\n\nThis is ${senderName} from Humblx. Following up on an item that's now past our agreed turnaround for the ${state.info.name} onboarding:\n\n• ${label}\n\nThis is currently holding up the next phase. Could you prioritise it today, or point me to who can? Happy to hop on a quick call if that's easier.\n\nThank you,\n${senderName}\nHumblx`
      );
      showToast(`Escalation drafted — from ${senderName}`);
    },
    [senderName, showToast, state]
  );

  const selectHospital = useCallback(
    async (id: string) => {
      const doc = await activationApi.select(id);
      setCurrentHospitalId(id);
      setState(stateFromDoc(doc));
      await refreshHospitals();
      showToast(`Switched to ${doc.info.name || 'hospital'}`);
    },
    [refreshHospitals, showToast]
  );

  const createHospital = useCallback(
    async (info: HospitalInfo, pocs: Poc[]): Promise<string | null> => {
      if (!info.name.trim()) return 'Hospital name is required';
      if (!pocs.length || !pocs[0].name?.trim()) return 'At least one contact name is required';
      if (!pocs[0].phone?.trim()) return 'Primary contact phone is required';
      const next = { ...blankState(), setupDone: true, info: withHumblxPoc(info), pocs };
      const doc = await activationApi.create(next);
      const id = doc._id!;
      setCurrentHospitalId(id);
      setState(stateFromDoc(doc));
      await refreshHospitals();
      showToast(`${info.name} added — tracking started`);
      return null;
    },
    [refreshHospitals, showToast, withHumblxPoc]
  );

  const updateHospital = useCallback(
    async (id: string, info: HospitalInfo, pocs: Poc[]): Promise<string | null> => {
      if (!info.name.trim()) return 'Hospital name is required';
      if (!pocs.length || !pocs[0].name?.trim()) return 'At least one contact name is required';
      if (!pocs[0].phone?.trim()) return 'Primary contact phone is required';
      const next = { ...state, setupDone: true, info: withHumblxPoc(info), pocs };
      await activationApi.save(next, id);
      if (id === currentHospitalId) setState(next);
      await refreshHospitals();
      showToast('Hospital details saved');
      return null;
    },
    [currentHospitalId, refreshHospitals, showToast, state, withHumblxPoc]
  );

  const deleteHospital = useCallback(
    async (id: string) => {
      await activationApi.delete(id);
      const list = await refreshHospitals();
      if (id === currentHospitalId) {
        const next = list.find((h) => h.isCurrent) ?? list[0];
        if (next) {
          await selectHospital(next._id);
        } else {
          setCurrentHospitalId(null);
          setState(blankState());
          appNavigate(ROUTES.hospitals);
        }
      }
      showToast('Hospital removed');
    },
    [currentHospitalId, refreshHospitals, selectHospital, showToast]
  );

  const loadDemo = useCallback(async () => {
    const next = demoState(senderName);
    const doc = await activationApi.create(next);
    setCurrentHospitalId(doc._id!);
    setState(stateFromDoc(doc));
    await refreshHospitals();
    showToast('Demo hospital created');
  }, [refreshHospitals, showToast, senderName]);

  const resetSetupForm = useCallback(() => setSetupPocs([{}]), []);

  const addSetupPoc = useCallback(() => setSetupPocs((p) => [...p, {}]), []);
  const removeSetupPoc = useCallback(
    (i: number) =>
      setSetupPocs((p) => {
        const next = p.filter((_, idx) => idx !== i);
        return next.length ? next : [{}];
      }),
    []
  );

  const clientDone = useCallback(
    (label: string) => {
      const lead = state.info.poc.trim() || 'Humblx team';
      const msg = encodeURIComponent(
        `Hi ${lead},\n\nWe've completed: ${label}\n\nPlease proceed with the next step.\n\nThanks!`
      );
      window.open(`https://wa.me/?text=${msg}`, '_blank');
      showToast('Opening WhatsApp…');
    },
    [showToast, state.info.poc]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      loaded,
      dbStatus,
      dbError,
      bootError,
      retryConnection,
      msFilter,
      senderName,
      nudgePoc,
      toast,
      statusModal,
      visitModalOpen,
      pocModalOpen,
      openPhases,
      setupPocs,
      hospitals,
      currentHospitalId,
      setMsFilter,
      setNudgePoc,
      showToast,
      togglePhase,
      openPhaseForMilestone,
      openStatusModal,
      closeStatusModal,
      updateStatusDraft,
      setVisitModalOpen,
      setPocModalOpen,
      applyStatus,
      confirmStatusModal,
      advanceDoc,
      saveDocLink,
      saveVisit,
      saveInfo,
      addPoc,
      sendNudge,
      copyNudge,
      quickNudge,
      escalate,
      selectHospital,
      createHospital,
      updateHospital,
      deleteHospital,
      refreshHospitals,
      loadDemo,
      setSetupPocs,
      resetSetupForm,
      addSetupPoc,
      removeSetupPoc,
      clientDone,
      nudgeDraft,
      clearNudgeDraft: () => setNudgeDraft(null),
    }),
    [
      state,
      loaded,
      dbStatus,
      dbError,
      bootError,
      retryConnection,
      msFilter,
      senderName,
      nudgePoc,
      toast,
      statusModal,
      visitModalOpen,
      pocModalOpen,
      openPhases,
      setupPocs,
      hospitals,
      currentHospitalId,
      showToast,
      togglePhase,
      openPhaseForMilestone,
      openStatusModal,
      closeStatusModal,
      updateStatusDraft,
      applyStatus,
      confirmStatusModal,
      advanceDoc,
      saveDocLink,
      saveVisit,
      saveInfo,
      addPoc,
      sendNudge,
      copyNudge,
      quickNudge,
      escalate,
      selectHospital,
      createHospital,
      updateHospital,
      deleteHospital,
      refreshHospitals,
      loadDemo,
      resetSetupForm,
      addSetupPoc,
      removeSetupPoc,
      clientDone,
      nudgeDraft,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

/** Nudge message draft set by quickNudge / escalate */