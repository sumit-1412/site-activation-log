import { PHASES } from '../data/phases';
import { MS_TEMPLATES } from '../data/docs';
import { useApp } from '../context/AppContext';
import { flatMilestones } from '../lib/selectors';
import { fmtDate } from '../lib/utils';
import { downloadTemplate } from '../lib/templates';
import type { MilestoneDef, MilestoneStatus } from '../types';
import {
  IconAlert,
  IconCheck,
  IconChev,
  IconClock,
  IconDash,
  IconSend,
  IconSpinner,
} from '../components/icons';
import { TemplateButton } from '../components/ui/TemplateButton';
import { PageHeader } from '../components/layout/PageHeader';
import { MilestoneRow } from '../components/timeline/MilestoneRow';
import { ROUTES } from '../routes/paths';

const FILTERS = [
  ['all', 'All'],
  ['ours', 'Our turn'],
  ['waiting', 'Waiting on client'],
  ['done', 'Done'],
] as const;

const STATUS_LABEL: Record<MilestoneStatus, string> = {
  pending: 'Pending',
  inprogress: 'In progress',
  waiting: 'Waiting',
  blocked: 'Blocked',
  done: 'Done',
};

function StatusIcon({ status }: { status: MilestoneStatus }) {
  const cls = 'h-2.5 w-2.5';
  if (status === 'done') return <IconCheck className={cls} />;
  if (status === 'inprogress') return <IconSpinner className={cls} />;
  if (status === 'waiting') return <IconClock className={cls} />;
  if (status === 'blocked') return <IconAlert className={cls} />;
  return <IconDash className={cls} />;
}

export function TimelinePage() {
  const {
    state,
    msFilter,
    setMsFilter,
    openPhases,
    togglePhase,
    quickNudge,
    showToast,
  } = useApp();

  const all = flatMilestones();

  const counts = {
    all: all.length,
    waiting: all.filter((m) => state.milestones[m.id].status === 'waiting' && m.owner === 'client').length,
    ours: all.filter((m) => m.owner === 'humblx' && state.milestones[m.id].status !== 'done').length,
    done: all.filter((m) => state.milestones[m.id].status === 'done').length,
  };

  const matchFilter = (m: MilestoneDef, status: MilestoneStatus) => {
    if (msFilter === 'all') return true;
    if (msFilter === 'waiting') return status === 'waiting' && m.owner === 'client';
    if (msFilter === 'ours') return m.owner === 'humblx' && status !== 'done';
    if (msFilter === 'done') return status === 'done';
    return true;
  };

  return (
    <div>
      <PageHeader
        title="Timeline"
        subtitle="Onboarding · 7 phases · 51 milestones"
        backTo={ROUTES.home}
      />
      <div className="mb-2.5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink3">
          Tap a step to update · swipe right = done · swipe left = waiting
        </div>
        <div className="mt-2 flex flex-wrap gap-2.5">
          {(['pending', 'inprogress', 'waiting', 'blocked', 'done'] as const).map((s) => (
            <span key={s} className="inline-flex items-center gap-1 text-[10px] text-ink2">
              <span className={`h-2 w-2 rounded-full bg-st-${s === 'inprogress' ? 'prog' : s === 'waiting' ? 'wait' : s === 'done' ? 'done' : s === 'blocked' ? 'blocked' : 'pending'}`} />
              {STATUS_LABEL[s]}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => setMsFilter(k)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              msFilter === k ? 'border-ink bg-ink text-white' : 'border-line bg-surface text-ink2'
            }`}
          >
            {l}
            <span className="ml-1 font-mono text-[10px] opacity-60">{counts[k]}</span>
          </button>
        ))}
      </div>

      <div id="phases-container">
        {PHASES.map((p) => {
          const done = p.milestones.filter((m) => state.milestones[m.id].status === 'done').length;
          const shown = p.milestones.filter((m) => matchFilter(m, state.milestones[m.id].status));
          if (!shown.length && msFilter !== 'all') return null;
          const isOpen = msFilter !== 'all' || openPhases.has(p.id);

          return (
            <div key={p.id} className={`mb-2.5 w-full overflow-hidden rounded-app border border-line bg-surface shadow-app sm:mb-3 ${isOpen ? 'open' : ''}`}>
              <button
                type="button"
                onClick={() => togglePhase(p.id)}
                className="flex w-full items-center gap-2.5 border-none bg-transparent px-3.5 py-3 text-left"
              >
                <span className="shrink-0 rounded-md border border-line bg-surface2 px-1.5 py-0.5 font-mono text-[10px] text-ink2">P{p.id}</span>
                <span className="flex-1 font-display text-sm font-semibold tracking-tight">{p.name}</span>
                <span className="font-mono text-[11px] text-ink3">{done}/{p.milestones.length}</span>
                <IconChev className={isOpen ? 'rotate-180' : undefined} />
              </button>
              {isOpen && (
                <div className="border-t border-line2">
                  {shown.map((m) => {
                    const ms = state.milestones[m.id];
                    let flag: React.ReactNode = null;
                    if (ms.status === 'waiting' && ms.sentAt) {
                      const h = (Date.now() - new Date(ms.sentAt).getTime()) / 3600000;
                      const sla = m.sla || 48;
                      if (h > sla) flag = <span className="rounded-[5px] bg-red-soft px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-red">Overdue</span>;
                      else if (h > sla * 0.6) flag = <span className="rounded-[5px] bg-amber-soft px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-amber">Near SLA</span>;
                    }
                    const tpls = MS_TEMPLATES[m.id] || [];

                    return (
                      <MilestoneRow key={m.id} milestoneId={m.id}>
                        <div className={`flex items-start gap-2.5 border-l-[3px] px-3.5 py-3 border-st-${ms.status === 'inprogress' ? 'prog' : ms.status === 'waiting' ? 'wait' : ms.status === 'blocked' ? 'blocked' : ms.status === 'done' ? 'done' : 'pending'}`}>
                          <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 bg-surface ${ms.status === 'done' ? 'border-st-done bg-st-done text-white' : ms.status === 'inprogress' ? 'border-st-prog bg-st-prog-soft' : ms.status === 'waiting' ? 'border-st-wait bg-st-wait-soft' : ms.status === 'blocked' ? 'border-st-blocked bg-st-blocked-soft' : 'border-st-pending'}`}>
                            {ms.status === 'done' && <IconCheck className="h-2.5 w-2.5 stroke-white" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-[13px] leading-snug ${ms.status === 'done' ? 'text-ink3 line-through decoration-line' : 'text-ink'}`}>{m.label}</div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              <span className={`rounded-[5px] px-1.5 py-0.5 font-mono text-[9px] uppercase ${m.owner === 'humblx' ? 'bg-slate-soft text-slate' : 'bg-amber-soft text-amber'}`}>
                                {m.owner === 'humblx' ? 'Humblx' : 'Client'}
                              </span>
                              <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9.5px] font-semibold bg-st-${ms.status === 'inprogress' ? 'prog' : ms.status === 'waiting' ? 'wait' : ms.status === 'blocked' ? 'blocked' : ms.status === 'done' ? 'done' : 'pending'}-soft text-st-${ms.status === 'inprogress' ? 'prog' : ms.status === 'waiting' ? 'wait' : ms.status === 'blocked' ? 'blocked' : ms.status === 'done' ? 'done' : 'pending'}`}>
                                <StatusIcon status={ms.status} />
                                {STATUS_LABEL[ms.status]}
                              </span>
                              {ms.status === 'waiting' && m.sla && <span className="font-mono text-[10px] text-ink3">SLA {m.sla}h</span>}
                              {ms.date && ms.status === 'done' && <span className="font-mono text-[10px] text-ink3">{fmtDate(ms.date)}</span>}
                              {flag}
                            </div>
                            {ms.note && <div className="mt-1 font-mono text-[10px] text-ink3">{ms.note}</div>}
                            {tpls.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {tpls.map((k) => (
                                  <TemplateButton key={k} templateKey={k} small onDownload={() => downloadTemplate(k, showToast)} />
                                ))}
                              </div>
                            )}
                            {ms.status === 'waiting' && m.owner === 'client' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  quickNudge(m.id, m.label);
                                }}
                                className="mt-2 inline-flex items-center gap-1 rounded-[7px] border border-accent-line bg-accent-soft px-2.5 py-1.5 text-[11px] text-accent"
                              >
                                <IconSend className="h-2.5 w-2.5" /> Quick nudge
                              </button>
                            )}
                          </div>
                        </div>
                      </MilestoneRow>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
