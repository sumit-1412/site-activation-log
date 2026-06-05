import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/paths';
import { IconBrand } from '../icons';

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isClient = location.pathname === ROUTES.client;

  return (
    <header className="fixed inset-x-0 top-0 z-[1000] flex items-center justify-between border-b border-line bg-bg/85 px-4 py-[11px] pt-[calc(11px+env(safe-area-inset-top))] backdrop-blur-[14px]">
      <div className="flex items-center gap-2">
        <div className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-accent text-white">
          <IconBrand className="h-[13px] w-[13px] stroke-white" />
        </div>
        <div>
          <div className="font-display text-[15px] font-bold tracking-tight text-ink">Humblx</div>
          <div className="ml-px text-[10px] uppercase tracking-wide text-ink3">Activation Log</div>
        </div>
      </div>
      <div className="flex rounded-[9px] border border-line bg-surface2 p-0.5">
        <button
          type="button"
          onClick={() => navigate(ROUTES.home)}
          className={`rounded-[7px] border-none px-[11px] py-[5px] text-xs font-medium transition-colors ${
            !isClient ? 'bg-ink text-white' : 'bg-transparent text-ink2'
          }`}
        >
          Internal
        </button>
        <button
          type="button"
          onClick={() => navigate(ROUTES.client)}
          className={`rounded-[7px] border-none px-[11px] py-[5px] text-xs font-medium transition-colors ${
            isClient ? 'bg-ink text-white' : 'bg-transparent text-ink2'
          }`}
        >
          Client
        </button>
      </div>
    </header>
  );
}
