import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ROUTES } from '../../routes/paths';
import { IconBack, IconBrand } from '../icons';
import { UserAccountMenu } from './UserAccountMenu';

export function Topbar() {
  const { state } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const isClient = location.pathname === ROUTES.client;
  const isHome = location.pathname === ROUTES.home;
  const isPortfolio = location.pathname === ROUTES.hospitals;
  const showMobileBack = !isHome && !isPortfolio && !location.pathname.startsWith('/hospitals');

  return (
    <header className="fixed inset-x-0 top-0 z-[1000] border-b border-line bg-bg/85 backdrop-blur-[14px] lg:left-60">
      <div className="mx-auto flex max-w-app items-center justify-between gap-3 px-4 py-[11px] pt-[calc(11px+env(safe-area-inset-top))] sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          {showMobileBack && (
            <button
              type="button"
              onClick={() => navigate(ROUTES.home)}
              aria-label="Back to home"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink2 lg:hidden"
            >
              <IconBack className="h-4 w-4" />
            </button>
          )}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-accent text-white">
              <IconBrand className="h-[13px] w-[13px] stroke-white" />
            </div>
            <div>
              <div className="font-display text-[15px] font-bold tracking-tight text-ink">Humblx</div>
              <div className="ml-px text-[10px] uppercase tracking-wide text-ink3">Activation Log</div>
            </div>
          </div>
          <div className="hidden min-w-0 lg:block">
            <div className="truncate font-display text-sm font-semibold text-ink">
              {isPortfolio ? 'Portfolio' : state.info.name || 'Humblx Activation'}
            </div>
            <div className="truncate text-[10px] text-ink3">
              {isClient ? 'Client view' : isPortfolio ? 'All hospital sites' : 'Internal cockpit'}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
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

          <UserAccountMenu />
        </div>
      </div>
    </header>
  );
}
