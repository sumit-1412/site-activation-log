import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { useApp } from '../context/AppContext';
import { ROUTES } from '../routes/paths';
import {
  calcProgress,
  getNextActions,
  getOverdue,
  getWaiting,
} from '../lib/selectors';
import { fmtDate } from '../lib/utils';
import { IconCal, IconCheck, IconCheckOk, IconPin, IconSend } from '../components/icons';

export function HomePage() {
  const { state, setVisitModalOpen, quickNudge, escalate, applyStatus, openPhaseForMilestone } =
    useApp();

  const pct = calcProgress(state);
  const all = Object.values(state.milestones);
  const done = all.filter((m) => m.status === 'done').length;
  const waiting = all.filter((m) => m.status === 'waiting').length;
  const overdue = getOverdue(state);
  const amber = getWaiting(state).filter((w) => {
    const h = (Date.now() - new Date(w.sentAt || Date.now()).getTime()) / 3600000;
    return h > w.sla * 0.6 && h <= w.sla;
  });
  const next = getNextActions(state, 3);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Active hospital overview"
        backTo={ROUTES.hospitals}
      />
      <div className="mt-2 sm:mt-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-display text-[23px] font-bold leading-tight tracking-tight">{state.info.name || 'Unnamed hospital'}</div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {state.info.city && <Chip>{state.info.city}</Chip>}
              {state.info.beds ? <Chip>{state.info.beds} beds</Chip> : null}
              <Chip>{state.info.modules?.join(' · ') || 'No modules'}</Chip>
              {state.info.poc && <Chip>Lead: {state.info.poc}</Chip>}
            </div>
          </div>
          <div className="font-display text-[34px] font-bold leading-none tracking-tighter text-accent">
            {pct}<span className="text-[15px] font-medium text-ink3">%</span>
          </div>
        </div>
        <div className="mt-3.5 h-[5px] overflow-hidden rounded-full bg-line2">
          <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-ink2">
          <IconCal className="h-3.5 w-3.5 stroke-ink3" />
          {state.info.goliveDate ? (
            <span>Target go-live {fmtDate(state.info.goliveDate)}</span>
          ) : (
            <span className="text-ink3">Go-live date not set</span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 rounded-app border border-line bg-surface shadow-app sm:mt-6">
        <Stat n={done} label="Done" color="text-accent" />
        <Stat n={waiting} label="Waiting" color="text-amber" />
        <Stat n={overdue.length} label="Overdue" color="text-red" last />
      </div>

      <Block title="Needs Attention">
        {overdue.length === 0 && amber.length === 0 ? (
          <Clear msg="All clear — nothing breaching SLA right now." />
        ) : (
          <>
            {overdue.map((o) => {
              const id = getWaiting(state).find((w) => w.label === o.label)?.id;
              return (
                <AttnRow key={o.label} dot="red" title={o.label} sub={`Waiting ${Math.floor(o.hours / 24)}d ${o.hours % 24}h — SLA breached (${o.sla}h)`}>
                  {id && (
                    <button type="button" onClick={() => escalate(id, o.label)} className="flex shrink-0 items-center gap-1 rounded-lg border border-red bg-red px-2.5 py-1.5 text-[11px] font-semibold text-white">
                      <IconSend className="h-3 w-3" /> Firm nudge
                    </button>
                  )}
                </AttnRow>
              );
            })}
            {amber.map((w) => {
              const h = Math.floor((Date.now() - new Date(w.sentAt!).getTime()) / 3600000);
              return (
                <AttnRow key={w.id} dot="amber" title={w.label} sub={`Waiting ${h}h — approaching ${w.sla}h SLA`}>
                  <button type="button" onClick={() => quickNudge(w.id, w.label)} className="flex shrink-0 items-center gap-1 rounded-lg border border-[#e9d3a8] bg-amber-soft px-2.5 py-1.5 text-[11px] font-semibold text-amber">
                    <IconSend className="h-3 w-3" /> Nudge
                  </button>
                </AttnRow>
              );
            })}
          </>
        )}
      </Block>

      <Block title="Up Next">
        {next.length === 0 ? (
          <Clear msg="Every milestone is complete." />
        ) : (
          next.map((n) => {
            let d = '—';
            let cls = '';
            if (n.status === 'waiting' && n.sentAt) {
              const h = (Date.now() - new Date(n.sentAt).getTime()) / 3600000;
              d = `${Math.floor(h / 24)}d`;
              if (h > n.sla) cls = 'text-red';
              else if (h > n.sla * 0.6) cls = 'text-amber';
            }
            const act =
              n.owner === 'client' && n.status === 'waiting'
                ? { label: 'Nudge', cls: 'border-[#e9d3a8] bg-amber-soft text-amber', onClick: () => quickNudge(n.id, n.label) }
                : n.owner === 'client'
                  ? { label: 'Mark sent', cls: 'border-line bg-surface2 text-ink', onClick: () => applyStatus(n.id, 'waiting') }
                  : { label: 'Mark done', cls: 'border-accent-line bg-accent-soft text-accent', onClick: () => applyStatus(n.id, 'done') };

            return (
              <div key={n.id} className="flex flex-wrap items-center gap-2.5 border-b border-line2 px-3.5 py-[11px] last:border-b-0 active:bg-surface2">
                <button type="button" onClick={() => openPhaseForMilestone(n.id)} className={`shrink-0 rounded-[5px] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide ${n.owner === 'humblx' ? 'bg-slate-soft text-slate' : 'bg-amber-soft text-amber'}`}>
                  {n.owner === 'humblx' ? 'Humblx' : 'Client'}
                </button>
                <button type="button" onClick={() => openPhaseForMilestone(n.id)} className="min-w-0 flex-1 text-left text-[13px] text-ink">{n.label}</button>
                <span className={`shrink-0 font-mono text-[11px] text-ink3 ${cls}`}>{d}</span>
                <button type="button" onClick={act.onClick} className={`flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${act.cls}`}>
                  {act.label === 'Mark done' ? <IconCheck className="h-3 w-3" /> : <IconSend className="h-3 w-3" />}
                  {act.label}
                </button>
              </div>
            );
          })
        )}
      </Block>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <Link to={ROUTES.nudge} className="flex items-center justify-center gap-2 rounded-app-sm border border-accent bg-accent py-3 text-[13px] font-semibold text-white no-underline">
          <IconSend className="h-4 w-4" /> Send Nudge
        </Link>
        <button type="button" onClick={() => setVisitModalOpen(true)} className="flex items-center justify-center gap-2 rounded-app-sm border border-line bg-surface py-3 text-[13px] font-semibold text-ink">
          <IconPin className="h-4 w-4" /> Log Visit
        </button>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md border border-line bg-surface px-2 py-0.5 font-mono text-[10px] tracking-wide text-ink2">{children}</span>;
}
function Stat({ n, label, color, last }: { n: number; label: string; color: string; last?: boolean }) {
  return (
    <div className={`px-2 py-3 text-center ${last ? '' : 'border-r border-line2'}`}>
      <div className={`font-display text-[22px] font-bold leading-none tracking-tight ${color}`}>{n}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wide text-ink3">{label}</div>
    </div>
  );
}
function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-[18px] w-full">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink3">{title}</div>
      <div className="overflow-hidden rounded-app border border-line bg-surface shadow-app">{children}</div>
    </div>
  );
}
function Clear({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-4 text-[13px] text-ink2">
      <IconCheckOk className="h-4 w-4 shrink-0 stroke-accent" />
      <span>{msg}</span>
    </div>
  );
}
function AttnRow({ dot, title, sub, children }: { dot: 'red' | 'amber'; title: string; sub: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-line2 px-3.5 py-[11px] last:border-b-0">
      <span className={`h-[7px] w-[7px] shrink-0 rounded-full ${dot === 'red' ? 'bg-red shadow-[0_0_0_3px_var(--color-red-soft)]' : 'bg-amber shadow-[0_0_0_3px_var(--color-amber-soft)]'}`} />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] leading-snug text-ink">{title}</div>
        <div className="mt-0.5 text-[11px] text-ink2">{sub}</div>
      </div>
      {children}
    </div>
  );
}
