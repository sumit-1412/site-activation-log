import { flatMilestones } from '../../lib/selectors';
import { useApp } from '../../context/AppContext';
import type { MilestoneStatus } from '../../types';
import { Modal } from '../ui/Modal';

const OPTIONS: { status: MilestoneStatus; label: string; hint?: string; color: string }[] = [
  { status: 'done', label: 'Done', color: 'bg-st-done' },
  { status: 'inprogress', label: 'In progress', hint: "we're on it", color: 'bg-st-prog' },
  { status: 'waiting', label: 'Waiting on Client', hint: 'starts SLA clock', color: 'bg-st-wait' },
  { status: 'blocked', label: 'Blocked', color: 'bg-st-blocked' },
  { status: 'pending', label: 'Pending', color: 'bg-st-pending' },
];

export function StatusModal() {
  const { statusModal, closeStatusModal, updateStatusDraft, confirmStatusModal } = useApp();
  const milestone = flatMilestones().find((m) => m.id === statusModal.milestoneId);

  return (
    <Modal open={statusModal.open} onClose={closeStatusModal}>
      <h2 className="mb-4 font-display text-[17px] font-bold tracking-tight">{milestone?.label || 'Update Status'}</h2>
      <div className="flex flex-col gap-1.5">
        {OPTIONS.map((o) => (
          <button
            key={o.status}
            type="button"
            onClick={() => confirmStatusModal(o.status)}
            className="flex w-full items-center gap-2.5 rounded-app-sm border border-line bg-surface px-3.5 py-3 text-left text-[13px] active:bg-surface2"
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${o.color}`} />
            {o.label}
            {o.hint && <span className="ml-auto text-[11px] text-ink3">{o.hint}</span>}
          </button>
        ))}
      </div>
      <div className="mt-3.5 [&_.fld]:w-full [&_.fld]:rounded-[9px] [&_.fld]:border [&_.fld]:border-line [&_.fld]:px-3 [&_.fld]:py-[11px] [&_.fld]:text-[13px] [&_.fld]:outline-none [&_.fld:focus]:border-accent">
        <label className="mb-1 block text-[11px] font-medium text-ink2">Note (optional)</label>
        <input className="fld" value={statusModal.note} onChange={(e) => updateStatusDraft({ note: e.target.value })} placeholder="e.g. Sent template on WhatsApp" />
      </div>
      <div className="mt-3">
        <label className="mb-1 block text-[11px] font-medium text-ink2">Date</label>
        <input className="fld w-full rounded-[9px] border border-line px-3 py-[11px] text-[13px] outline-none focus:border-accent" type="date" value={statusModal.date} onChange={(e) => updateStatusDraft({ date: e.target.value })} />
      </div>
      <button type="button" onClick={closeStatusModal} className="mt-2 w-full rounded-app-sm border border-line bg-transparent py-3 text-[13px] text-ink2">Cancel</button>
    </Modal>
  );
}
