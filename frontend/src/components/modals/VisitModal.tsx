import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { todayISO } from '../../lib/utils';
import { Modal } from '../ui/Modal';

const TEAM = ['Puranjane', 'Samir', 'Ujjwal', 'Srinivas'];

export function VisitModal() {
  const { visitModalOpen, setVisitModalOpen, saveVisit } = useApp();
  const [date, setDate] = useState(todayISO());
  const [type, setType] = useState('Site Survey');
  const [team, setTeam] = useState<string[]>([]);
  const [clientMet, setClientMet] = useState('');
  const [outcome, setOutcome] = useState('productive');
  const [nextAction, setNextAction] = useState('');
  const [nextOwner, setNextOwner] = useState('Humblx');
  const [nextDate, setNextDate] = useState('');

  const handleSave = () => {
    saveVisit({ date, type, team, clientMet, outcome, nextAction, nextOwner, nextDate });
    setClientMet('');
    setNextAction('');
    setNextDate('');
    setTeam([]);
  };

  return (
    <Modal open={visitModalOpen} onClose={() => setVisitModalOpen(false)}>
      <h2 className="mb-4 font-display text-[17px] font-bold tracking-tight">Log Visit</h2>
      <FormField label="Date"><input className="fld" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></FormField>
      <FormField label="Visit type">
        <select className="fld" value={type} onChange={(e) => setType(e.target.value)}>
          {['Site Survey', 'Installation', 'Training', 'Follow-up', 'Check-in', 'Other'].map((t) => <option key={t}>{t}</option>)}
        </select>
      </FormField>
      <FormField label="Humblx team present">
        <div className="grid grid-cols-2 gap-2">
          {TEAM.map((t) => (
            <label key={t} className="flex items-center gap-2 rounded-[9px] border border-line p-2.5 text-[13px]">
              <input type="checkbox" checked={team.includes(t)} onChange={(e) => setTeam(e.target.checked ? [...team, t] : team.filter((x) => x !== t))} className="accent-accent" />
              {t}
            </label>
          ))}
        </div>
      </FormField>
      <FormField label="Client person met"><input className="fld" value={clientMet} onChange={(e) => setClientMet(e.target.value)} placeholder="Name & role" /></FormField>
      <FormField label="Outcome">
        <select className="fld" value={outcome} onChange={(e) => setOutcome(e.target.value)}>
          <option value="productive">Productive</option>
          <option value="partial">Partial</option>
          <option value="ghost">Ghost (client absent)</option>
          <option value="rescheduled">Rescheduled</option>
        </select>
      </FormField>
      <FormField label="Next action"><input className="fld" value={nextAction} onChange={(e) => setNextAction(e.target.value)} placeholder="What happens next" /></FormField>
      <div className="grid grid-cols-2 gap-2">
        <FormField label="Owner">
          <select className="fld" value={nextOwner} onChange={(e) => setNextOwner(e.target.value)}><option>Humblx</option><option>Client</option></select>
        </FormField>
        <FormField label="By when"><input className="fld" type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} /></FormField>
      </div>
      <button type="button" onClick={handleSave} className="mt-1 w-full rounded-app-sm bg-accent py-3 text-sm font-semibold text-white">Save Visit</button>
      <button type="button" onClick={() => setVisitModalOpen(false)} className="mt-2 w-full rounded-app-sm border border-line bg-transparent py-3 text-[13px] text-ink2">Cancel</button>
    </Modal>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 [&_.fld]:w-full [&_.fld]:rounded-[9px] [&_.fld]:border [&_.fld]:border-line [&_.fld]:bg-surface [&_.fld]:px-3 [&_.fld]:py-[11px] [&_.fld]:text-[13px] [&_.fld]:outline-none [&_.fld:focus]:border-accent">
      <label className="mb-1 block text-[11px] font-medium text-ink2">{label}</label>
      {children}
    </div>
  );
}
