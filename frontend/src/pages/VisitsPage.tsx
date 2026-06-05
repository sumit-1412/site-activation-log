import { useApp } from '../context/AppContext';
import { fmtDate } from '../lib/utils';
import { IconAlert, IconCal, IconPin, IconPlus } from '../components/icons';

const OUTCOME_LABELS: Record<string, string> = {
  productive: 'Productive',
  partial: 'Partial',
  ghost: 'Ghost',
  rescheduled: 'Rescheduled',
};

export function VisitsPage() {
  const { state, setVisitModalOpen } = useApp();
  const ghosts = state.visits.filter((v) => v.outcome === 'ghost' || v.outcome === 'rescheduled').length;

  return (
    <div className="pb-24">
      <button
        type="button"
        onClick={() => setVisitModalOpen(true)}
        className="mx-4 mt-4 flex w-[calc(100%-32px)] items-center justify-center gap-1.5 rounded-app-sm border-[1.5px] border-dashed border-line bg-transparent py-3 text-[13px] font-medium text-ink2 active:border-accent active:text-accent"
      >
        <IconPlus className="h-4 w-4" /> Log Visit
      </button>

      {ghosts >= 2 && (
        <div className="mx-4 mb-3 flex gap-2 rounded-app-sm border border-[#ecc9c2] bg-red-soft px-3 py-2.5 text-xs text-red">
          <IconAlert className="mt-0.5 h-4 w-4 shrink-0 stroke-red" />
          <div>{ghosts} ghost / rescheduled visits. Consider escalating or sending a formal nudge.</div>
        </div>
      )}

      {state.visits.length === 0 ? (
        <div className="px-6 py-12 text-center text-[13px] text-ink3">
          <IconPin className="mx-auto mb-3 h-[34px] w-[34px] stroke-line" />
          <div>No visits logged yet.<br />Tap &quot;Log Visit&quot; to add one.</div>
        </div>
      ) : (
        [...state.visits].reverse().map((v) => (
          <div key={v.id} className="mx-4 mb-2.5 rounded-app border border-line bg-surface p-3.5 shadow-app">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 font-mono text-[11px] text-ink2">
                <IconCal className="h-3 w-3 stroke-ink3" />
                {fmtDate(v.date)}
              </span>
              <span className={`rounded-md px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide badge-${v.outcome}`}>
                {OUTCOME_LABELS[v.outcome] || v.outcome}
              </span>
            </div>
            <div className="mb-2 text-xs text-ink2">{v.type || 'Visit'}</div>
            <div className="flex flex-wrap gap-1.5">
              {(v.team || []).map((t) => (
                <span key={t} className="rounded-[7px] border border-line2 bg-surface2 px-2 py-0.5 text-[11px] text-ink2">{t}</span>
              ))}
            </div>
            {v.clientMet && <div className="mt-2 text-[11px] text-ink2">Met: <b className="font-semibold text-ink">{v.clientMet}</b></div>}
            {v.nextAction && (
              <div className="mt-2.5 border-t border-line2 pt-2.5">
                <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-ink3">Next Action</div>
                <div className="text-xs text-ink">
                  {v.nextAction} — <b>{v.nextOwner}</b>
                  {v.nextDate ? ` by ${fmtDate(v.nextDate)}` : ''}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
