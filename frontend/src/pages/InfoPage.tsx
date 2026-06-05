import { useState } from 'react';
import { TEMPLATES } from '../data/templates';
import { useApp } from '../context/AppContext';
import { downloadTemplate } from '../lib/templates';
import { rel } from '../lib/utils';
import type { HospitalInfo, Poc } from '../types';
import { IconChat, IconDl, IconFile, IconMail, IconPhone, IconPlus } from '../components/icons';

const MODULES = [
  { id: 'HK', label: 'Housekeeping' },
  { id: 'FM', label: 'Facility Mgmt' },
  { id: 'FB', label: 'Feedback' },
  { id: 'Desk', label: 'Desk Mgmt' },
];

export function InfoPage() {
  const { state, saveInfo, setPocModalOpen, resetApp, showToast } = useApp();
  const [info, setInfo] = useState<HospitalInfo>(state.info);

  const handleSave = () => {
    saveInfo(info);
  };

  return (
    <div className="pb-24">
      <div className="mx-4 mt-4 mb-3 font-mono text-[10px] uppercase tracking-widest text-ink3">Hospital Details</div>
      <div className="mx-4 mb-4 rounded-app border border-line bg-surface p-4 shadow-app">
        <Field label="Hospital name">
          <input className="fld" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="City"><input className="fld" value={info.city} onChange={(e) => setInfo({ ...info, city: e.target.value })} /></Field>
          <Field label="Beds"><input className="fld" type="number" value={info.beds} onChange={(e) => setInfo({ ...info, beds: e.target.value })} /></Field>
        </div>
        <Field label="Engagement type">
          <select className="fld" value={info.type} onChange={(e) => setInfo({ ...info, type: e.target.value })}>
            <option>Full Onboarding</option><option>Pilot</option><option>Expansion</option>
          </select>
        </Field>
        <Field label="Humblx PoC">
          <input className="fld" value={info.poc} onChange={(e) => setInfo({ ...info, poc: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Start date"><input className="fld" type="date" value={info.startDate} onChange={(e) => setInfo({ ...info, startDate: e.target.value })} /></Field>
          <Field label="Target go-live"><input className="fld" type="date" value={info.goliveDate} onChange={(e) => setInfo({ ...info, goliveDate: e.target.value })} /></Field>
        </div>
        <Field label="Modules">
          <div className="grid grid-cols-2 gap-2">
            {MODULES.map((m) => (
              <label key={m.id} className="flex items-center gap-2 rounded-[9px] border border-line p-2.5 text-[13px]">
                <input type="checkbox" checked={info.modules.includes(m.id)} onChange={(e) => setInfo({ ...info, modules: e.target.checked ? [...info.modules, m.id] : info.modules.filter((x) => x !== m.id) })} className="accent-accent" />
                {m.label}
              </label>
            ))}
          </div>
        </Field>
        <button type="button" onClick={handleSave} className="w-full rounded-app-sm bg-accent py-3 text-sm font-semibold text-white">Save Details</button>
      </div>

      <div className="mx-4 mb-3 font-mono text-[10px] uppercase tracking-widest text-ink3">Client Points of Contact</div>
      <div className="mx-4 mb-4 rounded-app border border-line bg-surface p-4 shadow-app">
        {state.pocs.length === 0 ? (
          <p className="py-1.5 text-[13px] text-ink3">No PoCs added yet.</p>
        ) : (
          state.pocs.map((p, i) => <PocRow key={i} poc={p} />)
        )}
        <button type="button" onClick={() => setPocModalOpen(true)} className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-app-sm border border-line bg-transparent py-3 text-[13px] font-semibold text-ink">
          <IconPlus className="h-4 w-4" /> Add PoC
        </button>
      </div>

      <div className="mx-4 mb-3 font-mono text-[10px] uppercase tracking-widest text-ink3">Templates & Resources</div>
      <div className="mx-4 mb-4 rounded-app border border-line bg-surface p-4 shadow-app">
        {Object.keys(TEMPLATES).map((k) => {
          const t = TEMPLATES[k];
          const ext = t.file.split('.').pop()?.toUpperCase();
          return (
            <div key={k} className="flex items-center gap-3 border-b border-line2 py-2.5 last:border-b-0">
              <div className="relative flex h-10 w-[34px] shrink-0 items-center justify-center">
                <IconFile className="h-[34px] w-[30px] stroke-ink3" />
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-[3px] bg-accent px-0.5 font-mono text-[7px] font-medium text-white">{ext}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-ink">
                  {t.name}
                  <span className={`rounded-[5px] px-1.5 py-0.5 font-mono text-[8px] font-medium uppercase ${t.kind === 'internal' ? 'bg-slate-soft text-slate' : 'bg-amber-soft text-amber'}`}>
                    {t.kind === 'internal' ? 'Internal' : 'Send to client'}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] leading-snug text-ink3">{t.desc}</div>
              </div>
              <button type="button" onClick={() => downloadTemplate(k, showToast)} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-accent-line bg-accent-soft px-2.5 py-1.5 text-[11px] font-semibold text-accent">
                <IconDl className="h-3 w-3" /> Get
              </button>
            </div>
          );
        })}
        <p className="mt-3 border-t border-line2 pt-3 text-[11px] leading-snug text-ink3">
          Templates also appear inline on the Timeline and Docs screens, right where you send them.
        </p>
      </div>

      <div className="mx-4 mb-3 font-mono text-[10px] uppercase tracking-widest text-ink3">Recent Activity</div>
      <div className="mx-4 mb-4 rounded-app border border-line bg-surface p-4 shadow-app">
        {state.activity.slice(0, 12).map((e, i) => (
          <div key={i} className="flex items-center gap-2.5 border-b border-line2 py-2 last:border-b-0">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <div className="min-w-0 flex-1 text-[12.5px] text-ink">{e.txt}</div>
            <span className="shrink-0 font-mono text-[10px] text-ink3">{rel(e.t)}</span>
          </div>
        ))}
      </div>

      <div className="mx-4 rounded-app border border-line bg-surface p-4 shadow-app">
        <div className="mb-1 text-[13px] font-semibold">Start a new hospital</div>
        <p className="mb-2.5 text-[11.5px] leading-snug text-ink3">Clears this tracker and returns to setup. This can&apos;t be undone.</p>
        <button type="button" onClick={resetApp} className="w-full rounded-app-sm border border-[#ecc9c2] bg-transparent py-3 text-[13px] font-semibold text-red">
          Clear & start new
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 [&_.fld]:w-full [&_.fld]:rounded-[9px] [&_.fld]:border [&_.fld]:border-line [&_.fld]:bg-surface [&_.fld]:px-3 [&_.fld]:py-[11px] [&_.fld]:text-[13px] [&_.fld]:outline-none [&_.fld:focus]:border-accent">
      <label className="mb-1 block text-[11px] font-medium text-ink2">{label}</label>
      {children}
    </div>
  );
}

function PocRow({ poc }: { poc: Poc }) {
  const initials = poc.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="flex gap-2.5 border-b border-line2 py-2.5 last:border-b-0">
      <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-accent-soft font-display text-[13px] font-semibold text-accent">{initials}</div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold">{poc.name}</div>
        <div className="mb-1.5 text-[11px] text-ink3">{poc.role}</div>
        <div className="flex flex-wrap gap-1.5">
          <a href={`tel:${poc.phone}`} className="flex items-center gap-1 rounded-[7px] border border-line2 bg-surface2 px-2 py-1 text-[11px] text-ink2 no-underline"><IconPhone className="h-2.5 w-2.5" />{poc.phone}</a>
          <a href={`https://wa.me/91${poc.phone}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-[7px] border border-line2 bg-surface2 px-2 py-1 text-[11px] text-ink2 no-underline"><IconChat className="h-2.5 w-2.5" />WhatsApp</a>
          {poc.email && <a href={`mailto:${poc.email}`} className="flex items-center gap-1 rounded-[7px] border border-line2 bg-surface2 px-2 py-1 text-[11px] text-ink2 no-underline"><IconMail className="h-2.5 w-2.5" />Email</a>}
        </div>
      </div>
    </div>
  );
}
