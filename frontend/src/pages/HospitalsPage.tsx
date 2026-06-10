import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ROUTES } from '../routes/paths';
import { PageHeader } from '../components/layout/PageHeader';
import { IconPlus } from '../components/icons';
import type { HospitalSummary } from '../types';

type FilterKey = 'all' | 'active' | 'complete' | 'in-progress';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'in-progress', label: 'In progress' },
  { key: 'complete', label: 'Complete' },
];

function portfolioStats(hospitals: HospitalSummary[]) {
  const total = hospitals.length;
  const avgProgress = total
    ? Math.round(hospitals.reduce((sum, h) => sum + h.progress, 0) / total)
    : 0;
  const complete = hospitals.filter((h) => h.progress >= 100).length;
  const inProgress = hospitals.filter((h) => h.progress > 0 && h.progress < 100).length;
  const notStarted = hospitals.filter((h) => h.progress === 0).length;
  return { total, avgProgress, complete, inProgress, notStarted };
}

function matchesFilter(h: HospitalSummary, filter: FilterKey, currentHospitalId: string | null) {
  if (filter === 'active') return h._id === currentHospitalId || h.isCurrent;
  if (filter === 'complete') return h.progress >= 100;
  if (filter === 'in-progress') return h.progress > 0 && h.progress < 100;
  return true;
}

export function HospitalsPage() {
  const { hospitals, currentHospitalId, selectHospital } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const stats = useMemo(() => portfolioStats(hospitals), [hospitals]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return hospitals.filter((h) => {
      if (!matchesFilter(h, filter, currentHospitalId)) return false;
      if (!q) return true;
      return (
        (h.name || '').toLowerCase().includes(q) ||
        (h.city || '').toLowerCase().includes(q)
      );
    });
  }, [hospitals, query, filter, currentHospitalId]);

  const handleSelect = async (id: string) => {
    if (id !== currentHospitalId) {
      await selectHospital(id);
    }
  };

  const handleOpenDashboard = async (id: string) => {
    await selectHospital(id);
    navigate(ROUTES.home);
  };

  return (
    <div>
      <PageHeader
        title="Portfolio"
        subtitle={
          stats.total === 0
            ? 'Add hospitals to track onboarding across sites'
            : `${stats.total} site${stats.total === 1 ? '' : 's'} · pick one to work on`
        }
        showBack={false}
      />

      {stats.total > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <StatCard label="Sites" value={String(stats.total)} />
          <StatCard label="Avg progress" value={`${stats.avgProgress}%`} accent />
          <StatCard label="Complete" value={String(stats.complete)} />
          <StatCard label="In progress" value={String(stats.inProgress)} />
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or city…"
            className="min-w-[180px] flex-1 rounded-app-sm border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent sm:max-w-xs"
          />
          <div className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`rounded-app-sm border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  filter === f.key
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-line bg-surface text-ink2 hover:border-accent-line'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <Link
          to={ROUTES.hospitalNew}
          className="inline-flex shrink-0 items-center gap-2 rounded-app-sm bg-accent px-4 py-2.5 text-sm font-semibold text-white no-underline"
        >
          <IconPlus className="h-4 w-4" />
          Add hospital
        </Link>
      </div>

      {hospitals.length === 0 ? (
        <div className="rounded-app border border-dashed border-line bg-surface px-6 py-14 text-center shadow-app">
          <p className="text-sm text-ink2">No hospitals yet. Create one to start tracking milestones.</p>
          <Link
            to={ROUTES.hospitalNew}
            className="mt-4 inline-flex items-center gap-2 rounded-app-sm bg-accent px-5 py-2.5 text-sm font-semibold text-white no-underline"
          >
            <IconPlus className="h-4 w-4" />
            Add first hospital
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-app border border-line bg-surface px-6 py-10 text-center text-sm text-ink2 shadow-app">
          No hospitals match your search or filter.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((h) => {
            const isActive = h._id === currentHospitalId || h.isCurrent;
            return (
              <article
                key={h._id}
                className={`rounded-app border bg-surface p-4 shadow-app transition-all ${
                  isActive ? 'border-accent ring-2 ring-accent/20' : 'border-line'
                }`}
              >
                <button
                  type="button"
                  onClick={() => void handleSelect(h._id)}
                  className="w-full text-left"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-display text-lg font-bold text-ink">{h.name || 'Unnamed'}</div>
                      {h.city && <div className="mt-0.5 text-xs text-ink2">{h.city}</div>}
                    </div>
                    {isActive && (
                      <span className="shrink-0 rounded-md bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-line2">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${h.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-ink3">
                    <span>{h.progress}% complete</span>
                    <span>
                      {new Date(h.updatedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </button>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleOpenDashboard(h._id)}
                    className="flex-1 rounded-app-sm bg-accent px-3 py-2 text-xs font-semibold text-white"
                  >
                    Open dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.hospitalEdit(h._id))}
                    className="rounded-app-sm border border-line bg-surface2 px-3 py-2 text-xs font-medium text-ink2 hover:border-accent-line hover:text-accent"
                  >
                    Edit
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-app border border-line bg-surface px-3 py-3 text-center shadow-app sm:px-4">
      <div className={`font-display text-xl font-bold leading-none sm:text-2xl ${accent ? 'text-accent' : 'text-ink'}`}>
        {value}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wide text-ink3">{label}</div>
    </div>
  );
}
