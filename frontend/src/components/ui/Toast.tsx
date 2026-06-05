import { IconCheckOk } from '../icons';
import { useApp } from '../../context/AppContext';

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div
      className="fixed bottom-24 left-1/2 z-[3000] flex -translate-x-1/2 items-center gap-2 rounded-[10px] bg-ink px-4 py-2.5 text-[13px] text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)] transition-all"
      role="status"
    >
      <IconCheckOk className="h-3.5 w-3.5 stroke-accent" />
      <span>{toast}</span>
    </div>
  );
}
