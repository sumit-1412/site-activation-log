import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { activationApi } from '../api/client';
import { DOC_NAME, MS_DOC } from '../data/docs';
import { PHASES } from '../data/phases';
import { flatMilestones } from '../lib/selectors';
import { blankState, demoState } from '../lib/state';
import { pickPocFor } from '../lib/selectors';
import { appNavigate } from '../lib/navigation';
import { buzz, todayISO } from '../lib/utils';
import { ROUTES } from '../routes/paths';
import type {
  ActivationState,
  DocStatus,
  HospitalInfo,
  MilestoneStatus,
  MsFilter,
  Poc,
  Visit,
} from '../types';

interface AppContextValue {
  state: ActivationState;
  loaded: boolean;
  msFilter: MsFilter;
  currentSender: string;
  nudgePoc: number;
  toast: string | null;
  statusModal: { open: boolean; milestoneId: string | null; note: string; date: string };
  visitModalOpen: boolean;
  pocModalOpen: boolean;
  openPhases: Set<number>;
  setupPocs: Partial<Poc>[];
  showSetup: boolean;
  setMsFilter: (f: MsFilter) => void;
  setCurrentSender: (name: string) => void;
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
  startSetup: (info: HospitalInfo, pocs: Poc[]) => string | null;
  loadDemo: () => void;
  resetApp: () => void;
  continueTracking: () => void;
  setSetupPocs: (pocs: Partial<Poc>[]) => void;
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
  const [state, setState] = useState<ActivationState>(blankState);
  const [loaded, setLoaded] = useState(false);
  const [msFilter, setMsFilter] = useState<MsFilter>('all');
  const [currentSender, setCurrentSender] = useState('Puranjane');
  const [nudgePoc, setNudgePoc] = useState(0);
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
  const [setupDismissed, setSetupDismissed] = useState(false);

  const showSetup = !setupDismissed;

  useEffect(() => {
    activationApi.get().then((s) => {
      setState(s);
      setLoaded(true);
    });
  }, []);


  const persist = useCallback((next: ActivationState) => {
    setState(next);
    void activationApi.save(next);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

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

  const saveInfo = useCallback(
    (info: HospitalInfo) => {
      const next = { ...state, info };
      persist(next);
      showToast('Details saved');
    },
    [persist, showToast, state]
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
            { sender: currentSender, time: new Date().toISOString(), to: poc.name || 'Client PoC' },
          ],
        },
        `Nudge sent by ${currentSender} to ${poc.name || 'client'}`
      );
      persist(next);
      window.open(`https://wa.me/${phone ? `91${phone}` : ''}?text=${encodeURIComponent(message)}`, '_blank');
      showToast(`Opening WhatsApp — ${poc.name || 'client'}`);
    },
    [currentSender, nudgePoc, persist, showToast, state]
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
          `Hi${to ? ` ${to}` : ''},\n\nHope you're well! This is ${currentSender} from Humblx.\n\nQuick follow-up — we're waiting on:\n\n• ${label}\n\nPlease let us know once done or if you need any help.\n\nThank you!\n${currentSender}\nHumblx`
        );
      }
    },
    [currentSender, state]
  );

  const escalate = useCallback(
    (id: string, label: string) => {
      setCurrentSender('Samir');
      setNudgePoc(pickPocFor(state, id));
      appNavigate(ROUTES.nudge);
      const to = state.pocs[pickPocFor(state, id)]?.name?.split(' ')[0];
      setNudgeDraft(
        `Hi${to ? ` ${to}` : ''},\n\nThis is Samir from Humblx. Following up on an item that's now past our agreed turnaround for the ${state.info.name} onboarding:\n\n• ${label}\n\nThis is currently holding up the next phase. Could you prioritise it today, or point me to who can? Happy to hop on a quick call if that's easier.\n\nThank you,\nSamir\nHumblx`
      );
      showToast('Escalation drafted — from Samir');
    },
    [showToast, state]
  );

  const startSetup = useCallback(
    (info: HospitalInfo, pocs: Poc[]): string | null => {
      if (!info.name.trim()) return 'Hospital name is required';
      if (!pocs.length || !pocs[0].name?.trim()) return 'At least one contact name is required';
      if (!pocs[0].phone?.trim()) return 'Primary contact phone is required';
      const next = { ...state, setupDone: true, info, pocs };
      persist(next);
      setSetupDismissed(true);
      showToast('Setup complete — tracking started');
      return null;
    },
    [persist, showToast, state]
  );

  const loadDemo = useCallback(() => {
    const next = demoState();
    persist(next);
    setSetupDismissed(true);
    showToast('Demo data loaded');
  }, [persist, showToast]);

  const resetApp = useCallback(() => {
    void activationApi.reset().then((s) => {
      setState(s);
      setSetupPocs([{}]);
      setSetupDismissed(false);
      appNavigate(ROUTES.setup);
      showToast('Ready for a new hospital');
    });
  }, [showToast]);

  const continueTracking = useCallback(() => {
    setSetupDismissed(true);
    showToast('Continuing with saved data');
  }, [showToast]);

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
      const msg = encodeURIComponent(
        `Hi Humblx team,\n\nWe've completed: ${label}\n\nPlease proceed with the next step.\n\nThanks!`
      );
      window.open(`https://wa.me/?text=${msg}`, '_blank');
      showToast('Opening WhatsApp…');
    },
    [showToast]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      loaded,
      msFilter,
      currentSender,
      nudgePoc,
      toast,
      statusModal,
      visitModalOpen,
      pocModalOpen,
      openPhases,
      setupPocs,
      showSetup,
      setMsFilter,
      setCurrentSender,
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
      startSetup,
      loadDemo,
      resetApp,
      continueTracking,
      setSetupPocs,
      addSetupPoc,
      removeSetupPoc,
      clientDone,
      nudgeDraft,
      clearNudgeDraft: () => setNudgeDraft(null),
    }),
    [
      state,
      loaded,
      msFilter,
      currentSender,
      nudgePoc,
      toast,
      statusModal,
      visitModalOpen,
      pocModalOpen,
      openPhases,
      setupPocs,
      showSetup,
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
      startSetup,
      loadDemo,
      resetApp,
      continueTracking,
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