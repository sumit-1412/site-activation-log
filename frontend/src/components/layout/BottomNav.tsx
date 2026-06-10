import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../routes/paths';
import { NAV_ITEMS } from './navItems';

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[999] border-t border-line bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-[14px] lg:hidden">
      <div className="mx-auto flex max-w-app">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === ROUTES.home || item.to === ROUTES.hospitals}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 border-none bg-transparent px-0.5 py-2 no-underline transition-colors ${
                isActive ? 'text-accent' : 'text-ink3'
              }`
            }
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="h-5 w-5">
              <path d={item.path} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
