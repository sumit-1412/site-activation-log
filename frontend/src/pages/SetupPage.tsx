import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ROUTES } from '../routes/paths';
import type { HospitalInfo, Poc } from '../types';
import { IconBrand, IconPlus } from '../components/icons';

const MODULES = [
  { id: 'HK', label: 'Housekeeping' },
  { id: 'FM', label: 'Facility Mgmt' },
  { id: 'FB', label: 'Feedback' },
  { id: 'Desk', label: 'Desk Mgmt' },
];

export function SetupPage() {
  const {
    state,
    setupPocs,
    setSetupPocs,
    addSetupPoc,
    removeSetupPoc,
    startSetup,
    loadDemo,
    continueTracking,
  } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [beds, setBeds] = useState('');
  const [type, setType] = useState('Full Onboarding');
  const [mods, setMods] = useState<string[]>([]);
  const [start, setStart] = useState('');
  const [golive, setGolive] = useState('');
  const [err, setErr] = useState('');

  const suggestGoLive = (startDate: string) => {
    if (!startDate) return;
    const d = new Date(startDate);
    d.setDate(d.getDate() + 42);
    setGolive(d.toISOString().split('T')[0]);
  };

  const handleStart = () => {
    const info: HospitalInfo = {
      name,
      city,
      beds: parseInt(beds) || 0,
      modules: mods,
      type,
      poc: '',
      startDate: start,
      goliveDate: golive,
    };
    const pocs = setupPocs.map((p) => ({
      name: p.name || '',
      role: p.role || '',
      phone: p.phone || '',
      email: p.email || '',
    })) as Poc[];
    const error = startSetup(info, pocs);
    if (error) setErr(error);
    else {
      setErr('');
      navigate(ROUTES.home);
    }
  };

  return (
    <div className="mx-auto max-w-app px-4 pb-10 pt-[calc(24px+env(safe-area-inset-top))]">
      <div className="mb-5 flex gap-3">
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-accent text-white">
          <IconBrand className="h-4 w-4 stroke-white" />
        </div>
        <div>
          <h1 className="font-display text-[22px] font-bold leading-tight tracking-tight">Set up this onboarding</h1>
          <p className="mt-1 text-[12.5px] leading-snug text-ink2">
            Enter the hospital and contacts to start tracking. You can change all of this later.
          </p>
        </div>
      </div>

      {state.setupDone && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => {
              continueTracking();
              navigate(ROUTES.home);
            }}
            className="w-full rounded-app-sm bg-accent py-3.5 text-sm font-semibold text-white active:scale-[.98]"
          >
            Continue tracking →
          </button>
          <p className="mt-2.5 text-center text-[11.5px] text-ink3">or update the details below</p>
        </div>
      )}

      <div className="mb-3.5 rounded-app border border-line bg-surface p-4 shadow-app">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-widest text-ink3">Hospital</div>
        <Field label="Hospital name *">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. XYZ Hospital" />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="City">
            <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
          </Field>
          <Field label="Beds">
            <input className="input" type="number" value={beds} onChange={(e) => setBeds(e.target.value)} placeholder="e.g. 300" />
          </Field>
        </div>
        <Field label="Engagement type">
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option>Full Onboarding</option>
            <option>Pilot</option>
            <option>Expansion</option>
          </select>
        </Field>
        <Field label="Modules">
          <div className="grid grid-cols-2 gap-2">
            {MODULES.map((m) => (
              <label key={m.id} className="flex items-center gap-2 rounded-[9px] border border-line bg-surface p-2.5 text-[13px]">
                <input
                  type="checkbox"
                  checked={mods.includes(m.id)}
                  onChange={(e) =>
                    setMods(e.target.checked ? [...mods, m.id] : mods.filter((x) => x !== m.id))
                  }
                  className="h-4 w-4 accent-accent"
                />
                {m.label}
              </label>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Start date">
            <input
              className="input"
              type="date"
              value={start}
              onChange={(e) => {
                setStart(e.target.value);
                suggestGoLive(e.target.value);
              }}
            />
          </Field>
          <Field label="Target go-live">
            <input className="input" type="date" value={golive} onChange={(e) => setGolive(e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="mb-3.5 rounded-app border border-line bg-surface p-4 shadow-app">
        <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ink3">
          Client contacts
          <span className="rounded-[5px] bg-amber-soft px-1.5 py-0.5 font-sans text-[10px] font-semibold normal-case tracking-normal text-amber">
            at least one
          </span>
        </div>
        {setupPocs.map((p, i) => (
          <div key={i} className="relative mb-2.5 rounded-app-sm border border-line2 bg-surface2 p-3">
            {setupPocs.length > 1 && (
              <button
                type="button"
                onClick={() => removeSetupPoc(i)}
                className="absolute right-2 top-2 flex h-[26px] w-[26px] items-center justify-center rounded-[7px] border-none bg-transparent text-ink3 active:bg-red-soft active:text-red"
              >
                ×
              </button>
            )}
            <Field label={`Name${i === 0 ? ' *' : ''}`}>
              <input
                className="input"
                value={p.name || ''}
                onChange={(e) => {
                  const next = [...setupPocs];
                  next[i] = { ...next[i], name: e.target.value };
                  setSetupPocs(next);
                }}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Role">
                <input
                  className="input"
                  value={p.role || ''}
                  placeholder="e.g. Facility Head"
                  onChange={(e) => {
                    const next = [...setupPocs];
                    next[i] = { ...next[i], role: e.target.value };
                    setSetupPocs(next);
                  }}
                />
              </Field>
              <Field label={`Phone${i === 0 ? ' *' : ''}`}>
                <input
                  className="input"
                  type="tel"
                  value={p.phone || ''}
                  placeholder="10 digits"
                  onChange={(e) => {
                    const next = [...setupPocs];
                    next[i] = { ...next[i], phone: e.target.value };
                    setSetupPocs(next);
                  }}
                />
              </Field>
            </div>
            <Field label="Email (optional)">
              <input
                className="input"
                type="email"
                value={p.email || ''}
                onChange={(e) => {
                  const next = [...setupPocs];
                  next[i] = { ...next[i], email: e.target.value };
                  setSetupPocs(next);
                }}
              />
            </Field>
          </div>
        ))}
        <button
          type="button"
          onClick={addSetupPoc}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-app-sm border border-line bg-transparent py-3 text-[13px] font-semibold text-ink"
        >
          <IconPlus className="h-4 w-4" /> Add another contact
        </button>
      </div>

      {err && <p className="mb-3 text-[12.5px] text-red">{err}</p>}

      <button
        type="button"
        onClick={handleStart}
        className="w-full rounded-app-sm bg-accent py-3 text-sm font-semibold text-white active:bg-[#1a5e4f]"
      >
        {state.setupDone ? 'Save & continue' : 'Start tracking'}
      </button>
      <button
        type="button"
        onClick={() => {
          loadDemo();
          navigate(ROUTES.home);
        }}
        className="mt-3 w-full border-none bg-transparent text-[12.5px] text-ink3 underline underline-offset-2"
      >
        Or load demo data to explore the tool
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 [&_.input]:w-full [&_.input]:rounded-[9px] [&_.input]:border [&_.input]:border-line [&_.input]:bg-surface [&_.input]:px-3 [&_.input]:py-[11px] [&_.input]:text-[13px] [&_.input]:text-ink [&_.input]:outline-none [&_.input:focus]:border-accent">
      <label className="mb-1 block text-[11px] font-medium text-ink2">{label}</label>
      {children}
    </div>
  );
}
