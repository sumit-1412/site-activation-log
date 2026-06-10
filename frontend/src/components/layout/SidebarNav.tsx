import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../routes/paths';
import { IconBrand } from '../icons';
import { NAV_ITEMS } from './navItems';
import { UserAccountMenu } from './UserAccountMenu';

export function SidebarNav() {
  const { authRequired, user } = useAuth();
  const { state } = useApp();

  return (
    <aside className="fixed inset-y-0 left-0 z-[1001] hidden w-60 flex-col border-r border-line bg-surface lg:flex">
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
          <IconBrand className="h-4 w-4 stroke-white" />
        </div>
        <div>
          <div className="font-display text-base font-bold tracking-tight text-ink">Humblx</div>
          <div className="text-[10px] uppercase tracking-wide text-ink3">Activation Log</div>
          {state.info.name && (
            <div className="mt-1 truncate text-[11px] font-medium text-accent">{state.info.name}</div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === ROUTES.home || item.to === ROUTES.hospitals}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-app-sm px-3 py-2.5 text-sm font-medium no-underline transition-colors ${
                isActive
                  ? 'bg-accent-soft text-accent'
                  : 'text-ink2 hover:bg-surface2 hover:text-ink'
              }`
            }
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="h-5 w-5 shrink-0">
              <path d={item.path} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {item.label}
          </NavLink>
        ))}
        <NavLink
          to={ROUTES.client}
          className={({ isActive }) =>
            `mt-2 flex items-center gap-3 rounded-app-sm border border-dashed px-3 py-2.5 text-sm font-medium no-underline transition-colors ${
              isActive
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-line text-ink2 hover:border-accent-line hover:bg-surface2'
            }`
          }
        >
          <span className="flex h-5 w-5 items-center justify-center text-xs">👁</span>
          Client view
        </NavLink>
      </nav>

      {authRequired && user && user.email !== 'local' && (
        <div className="border-t border-line p-4">
          <UserAccountMenu variant="full" />
        </div>
      )}
    </aside>
  );
}
