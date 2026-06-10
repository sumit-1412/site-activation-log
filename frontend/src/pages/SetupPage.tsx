import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ROUTES } from '../routes/paths';
import { todayISO } from '../lib/utils';
import type { HospitalInfo, Poc } from '../types';
import { IconBack, IconBrand, IconPlus } from '../components/icons';

const MODULES = [
  { id: 'HK', label: 'Housekeeping' },
  { id: 'FM', label: 'Facility Mgmt' },
  { id: 'FB', label: 'Feedback' },
  { id: 'Desk', label: 'Desk Mgmt' },
];

export function SetupPage() {
  const {
    state,
    hospitals,
    setupPocs,
    setSetupPocs,
    addSetupPoc,
    removeSetupPoc,
    createHospital,
    updateHospital,
    selectHospital,
    currentHospitalId,
    loadDemo,
    senderName,
    resetSetupForm,
  } = useApp();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const existing = isEdit ? hospitals.find((h) => h._id === id) : null;

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [beds, setBeds] = useState('');
  const [type, setType] = useState('Full Onboarding');
  const [mods, setMods] = useState<string[]>([]);
  const [start, setStart] = useState('');
  const [golive, setGolive] = useState('');
  const [humblxPoc, setHumblxPoc] = useState(senderName);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      const today = todayISO();
      setName('');
      setCity('');
      setBeds('');
      setType('Full Onboarding');
      setMods([]);
      setStart(today);
      const d = new Date(today);
      d.setDate(d.getDate() + 42);
      setGolive(d.toISOString().split('T')[0]);
      setHumblxPoc(senderName);
      resetSetupForm();
    }
  }, [isEdit, senderName, resetSetupForm]);

  useEffect(() => {
    if (isEdit && id && id !== currentHospitalId) {
      void selectHospital(id).catch(() => setErr('Could not load hospital'));
    }
  }, [id, isEdit, currentHospitalId, selectHospital]);

  useEffect(() => {
    if (!isEdit) return;
    if (id !== currentHospitalId) return;
    const info = state.info;
    setName(info.name);
    setCity(info.city);
    setBeds(String(info.beds || ''));
    setType(info.type || 'Full Onboarding');
    setMods(info.modules || []);
    setStart(info.startDate);
    setGolive(info.goliveDate);
    setHumblxPoc(info.poc.trim() || senderName);
    if (state.pocs.length) setSetupPocs(state.pocs);
  }, [isEdit, id, currentHospitalId, state.info, state.pocs, setSetupPocs, senderName]);

  const suggestGoLive = (startDate: string) => {
    if (!startDate) return;
    const d = new Date(startDate);
    d.setDate(d.getDate() + 42);
    setGolive(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async () => {
    const info: HospitalInfo = {
      name,
      city,
      beds: parseInt(beds) || 0,
      modules: mods,
      type,
      poc: humblxPoc.trim() || senderName,
      startDate: start,
      goliveDate: golive,
    };
    const pocs = setupPocs.map((p) => ({
      name: p.name || '',
      role: p.role || '',
      phone: p.phone || '',
      email: p.email || '',
    })) as Poc[];

    setSaving(true);
    setErr('');
    try {
      const error = isEdit && id
        ? await updateHospital(id, info, pocs)
        : await createHospital(info, pocs);
      if (error) setErr(error);
      else navigate(ROUTES.home);
    } catch {
      setErr('Failed to save hospital');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Link
        to={ROUTES.hospitals}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink2 no-underline hover:text-accent"
      >
        <IconBack className="h-4 w-4" />
        All hospitals
      </Link>

      <div className="mb-5 flex gap-3">
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-accent text-white">
          <IconBrand className="h-4 w-4 stroke-white" />
        </div>
        <div>
          <h1 className="font-display text-[22px] font-bold leading-tight tracking-tight">
            {isEdit ? `Edit — ${existing?.name || 'Hospital'}` : 'Add new hospital'}
          </h1>
          <p className="mt-1 text-[12.5px] leading-snug text-ink2">
            Hospital details and client contacts. Each hospital has its own onboarding timeline.
          </p>
        </div>
      </div>

      <HospitalForm
        name={name} setName={setName}
        city={city} setCity={setCity}
        beds={beds} setBeds={setBeds}
        type={type} setType={setType}
        mods={mods} setMods={setMods}
        start={start} setStart={setStart}
        golive={golive} setGolive={setGolive}
        humblxPoc={humblxPoc} setHumblxPoc={setHumblxPoc}
        suggestGoLive={suggestGoLive}
        setupPocs={setupPocs}
        setSetupPocs={setSetupPocs}
        addSetupPoc={addSetupPoc}
        removeSetupPoc={removeSetupPoc}
      />

      {err && <p className="mb-3 text-[12.5px] text-red">{err}</p>}

      <button
        type="button"
        disabled={saving}
        onClick={() => void handleSubmit()}
        className="w-full rounded-app-sm bg-accent py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create & start tracking'}
      </button>

      {!isEdit && (
        <button
          type="button"
          onClick={() => {
            void loadDemo().then(() => navigate(ROUTES.home));
          }}
          className="mt-3 w-full border-none bg-transparent text-[12.5px] text-ink3 underline underline-offset-2"
        >
          Or load a sample hospital (uses your name as Humblx lead)
        </button>
      )}
    </div>
  );
}

function HospitalForm({
  name, setName, city, setCity, beds, setBeds, type, setType,
  mods, setMods, start, setStart,   golive, setGolive, humblxPoc, setHumblxPoc, suggestGoLive,
  setupPocs, setSetupPocs, addSetupPoc, removeSetupPoc,
}: {
  name: string; setName: (v: string) => void;
  city: string; setCity: (v: string) => void;
  beds: string; setBeds: (v: string) => void;
  type: string; setType: (v: string) => void;
  mods: string[]; setMods: (v: string[]) => void;
  start: string; setStart: (v: string) => void;
  golive: string; setGolive: (v: string) => void;
  humblxPoc: string; setHumblxPoc: (v: string) => void;
  suggestGoLive: (d: string) => void;
  setupPocs: Partial<Poc>[];
  setSetupPocs: (p: Partial<Poc>[]) => void;
  addSetupPoc: () => void;
  removeSetupPoc: (i: number) => void;
}) {
  return (
    <>
      <div className="mb-3.5 rounded-app border border-line bg-surface p-4 shadow-app">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-widest text-ink3">Hospital</div>
        <Field label="Hospital name *">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. City Care Hospital" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City">
            <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" />
          </Field>
          <Field label="Beds">
            <input className="input" type="number" value={beds} onChange={(e) => setBeds(e.target.value)} placeholder="200" />
          </Field>
        </div>
        <Field label="Onboarding type">
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option>Full Onboarding</option>
            <option>Module Add-on</option>
            <option>Re-activation</option>
          </select>
        </Field>
        <div className="mb-3">
          <div className="mb-1.5 text-[11px] font-medium text-ink2">Modules</div>
          <div className="flex flex-wrap gap-1.5">
            {MODULES.map((m) => {
              const on = mods.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMods(on ? mods.filter((x) => x !== m.id) : [...mods, m.id])}
                  className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    on ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-surface2 text-ink2'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start date">
            <input className="input" type="date" value={start} onChange={(e) => { setStart(e.target.value); suggestGoLive(e.target.value); }} />
          </Field>
          <Field label="Target go-live">
            <input className="input" type="date" value={golive} onChange={(e) => setGolive(e.target.value)} />
          </Field>
        </div>
        <Field label="Humblx lead">
          <input className="input" value={humblxPoc} onChange={(e) => setHumblxPoc(e.target.value)} placeholder="Your name" />
        </Field>
      </div>

      <div className="mb-3.5 rounded-app border border-line bg-surface p-4 shadow-app">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-widest text-ink3">Client contacts</div>
        {setupPocs.map((poc, i) => (
          <div key={i} className="mb-3 rounded-app-sm border border-line2 bg-surface2 p-3 last:mb-0">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-medium text-ink2">Contact {i + 1}</span>
              {setupPocs.length > 1 && (
                <button type="button" onClick={() => removeSetupPoc(i)} className="border-none bg-transparent text-[11px] text-red">Remove</button>
              )}
            </div>
            <Field label="Name *">
              <input className="input" value={poc.name || ''} onChange={(e) => { const n = [...setupPocs]; n[i] = { ...n[i], name: e.target.value }; setSetupPocs(n); }} />
            </Field>
            <Field label="Role">
              <input className="input" value={poc.role || ''} onChange={(e) => { const n = [...setupPocs]; n[i] = { ...n[i], role: e.target.value }; setSetupPocs(n); }} placeholder="IT Head" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone *">
                <input className="input" value={poc.phone || ''} onChange={(e) => { const n = [...setupPocs]; n[i] = { ...n[i], phone: e.target.value }; setSetupPocs(n); }} />
              </Field>
              <Field label="Email">
                <input className="input" type="email" value={poc.email || ''} onChange={(e) => { const n = [...setupPocs]; n[i] = { ...n[i], email: e.target.value }; setSetupPocs(n); }} />
              </Field>
            </div>
          </div>
        ))}
        <button type="button" onClick={addSetupPoc} className="mt-1 flex w-full items-center justify-center gap-2 rounded-app-sm border border-line bg-transparent py-3 text-[13px] font-semibold text-ink">
          <IconPlus className="h-4 w-4" /> Add another contact
        </button>
      </div>
    </>
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
