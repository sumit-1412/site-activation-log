export function fmtDate(d: string | null | undefined): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function rel(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function buzz(ms = 14): void {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* ignore */
  }
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function daysAgoISO(days: number): string {
  return new Date(Date.now() - days * 24 * 3600000).toISOString().split('T')[0];
}
