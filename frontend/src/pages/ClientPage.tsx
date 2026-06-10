import { PHASES } from '../data/phases';
import { MS_TEMPLATES } from '../data/docs';
import { TEMPLATES } from '../data/templates';
import { useApp } from '../context/AppContext';
import { calcProgress, getClientWaiting } from '../lib/selectors';
import { fmtDate } from '../lib/utils';
import { downloadTemplate } from '../lib/templates';
import { IconCheck, IconCheckOk, IconClock, IconDash, IconDl, IconSpinner } from '../components/icons';

export function ClientPage() {
  const { state, clientDone, showToast } = useApp();
  const pct = calcProgress(state);
  const todos = getClientWaiting(state);
  const C = 402;
  const offset = C - (C * pct) / 100;

  const statuses = PHASES.map((p) => {
    const done = p.milestones.filter((m) => state.milestones[m.id].status === 'done').length;
    const waitingClient = p.milestones.some((m) => m.owner === 'client' && state.milestones[m.id].status === 'waiting');
    const any = p.milestones.some((m) => state.milestones[m.id].status !== 'pending');
    if (done === p.milestones.length) return 'done' as const;
    if (waitingClient) return 'waiting' as const;
    if (any || done > 0) return 'progress' as const;
    return 'idle' as const;
  });

  const labels = { done: 'Complete', progress: 'In Progress', waiting: 'Waiting on You', idle: 'Not Started' };

  return (
    <div>
      <div className="mt-2 text-center sm:mt-4">
        <div className="font-display text-[21px] font-bold tracking-tight">{state.info.name}</div>
        <div className="mt-1 text-xs text-ink2">Onboarding with Humblx</div>
      </div>

      <div className="relative mx-auto my-5 h-[150px] w-[150px]">
        <svg width="150" height="150" className="-rotate-90">
          <circle cx="75" cy="75" r="64" fill="none" stroke="var(--color-line2)" strokeWidth="10" />
          <circle cx="75" cy="75" r="64" fill="none" stroke="var(--color-accent)" strokeWidth="10" strokeLinecap="round" strokeDasharray="402" strokeDashoffset={offset} className="transition-[stroke-dashoffset] duration-700" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-display text-[38px] font-bold leading-none tracking-tighter text-accent">{pct}%</div>
          <div className="mt-0.5 text-[10px] uppercase tracking-widest text-ink3">Complete</div>
        </div>
      </div>

      <div className="mb-2 space-y-1 text-center text-[13px] text-ink2">
        {state.info.goliveDate ? (
          <div>Target go-live: <b className="font-semibold text-ink">{fmtDate(state.info.goliveDate)}</b></div>
        ) : null}
        {state.info.poc ? (
          <div>Your Humblx contact: <b className="font-semibold text-ink">{state.info.poc}</b></div>
        ) : null}
      </div>

      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-ink3">Pending From You</div>
      {todos.length ? (
        todos.map((t) => {
          const days = t.sentAt ? Math.floor((Date.now() - new Date(t.sentAt).getTime()) / 86400000) : null;
          const tpls = (MS_TEMPLATES[t.id] || []).filter((k) => TEMPLATES[k]?.kind === 'client');
          return (
            <div key={t.id} className="mb-2.5 w-full rounded-app border border-line bg-surface px-3.5 py-3 shadow-app sm:mb-3">
              <div className="mb-2 text-[13px] leading-snug text-ink">{t.label}</div>
              {days !== null && days > 0 && <div className="mb-2 text-[11px] font-medium text-amber">Waiting on you for {days} day{days > 1 ? 's' : ''}</div>}
              {tpls.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {tpls.map((k) => (
                    <button key={k} type="button" onClick={() => downloadTemplate(k, showToast)} className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface2 px-2.5 py-1.5 text-[11px] font-medium text-ink">
                      <IconDl className="h-3 w-3 stroke-accent" />
                      {TEMPLATES[k].name.replace(' Template', '').replace(' — Filled Example', ' (example)')}
                    </button>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => clientDone(t.label)} className="flex w-full items-center justify-center gap-1.5 rounded-[9px] border-none bg-accent py-2.5 text-xs font-semibold text-white">
                <IconCheck className="h-3.5 w-3.5 stroke-white" /> Done — Notify Humblx
              </button>
            </div>
          );
        })
      ) : (
        <div className="mb-2.5 w-full rounded-app border border-line bg-surface px-3.5 py-3 shadow-app">
          <div className="flex items-center gap-2 text-accent"><IconCheckOk className="h-4 w-4" /> Nothing pending from your side right now.</div>
        </div>
      )}

      {todos.length > 0 && (
        <p className="mb-3.5 text-center text-[11.5px] leading-snug text-ink3">
          Each pending item above can push your go-live date. Clearing them keeps you on track.
        </p>
      )}

      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-ink3">Where We Are</div>
      <div className="rounded-app border border-line bg-surface p-4 shadow-app sm:p-5">
        {PHASES.map((p, i) => {
          const s = statuses[i];
          const Icon = s === 'done' ? IconCheck : s === 'progress' ? IconSpinner : s === 'waiting' ? IconClock : IconDash;
          return (
            <div key={p.id} className="flex items-center gap-2.5 border-b border-line2 py-2.5 last:border-b-0">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] ${s === 'done' ? 'bg-accent-soft' : s === 'progress' ? 'bg-amber-soft' : s === 'waiting' ? 'bg-red-soft' : 'border border-line bg-surface2'}`}>
                <Icon className={`h-3 w-3 ${s === 'done' ? 'stroke-accent' : s === 'progress' ? 'stroke-amber' : s === 'waiting' ? 'stroke-red' : 'stroke-ink3'}`} />
              </span>
              <span className="flex-1 text-[13px] text-ink">{p.name}</span>
              <span className={`text-[11px] font-medium ${s === 'done' ? 'text-accent' : s === 'progress' ? 'text-amber' : s === 'waiting' ? 'text-red' : 'text-ink3'}`}>{labels[s]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
