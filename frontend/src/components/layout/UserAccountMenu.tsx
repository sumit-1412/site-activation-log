import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { displayNameFromUser } from '../../lib/user';
import { IconLogOut } from '../icons';

interface UserAccountMenuProps {
  variant?: 'compact' | 'full';
}

export function UserAccountMenu({ variant = 'compact' }: UserAccountMenuProps) {
  const { user, logout, authRequired } = useAuth();
  const [open, setOpen] = useState(false);

  if (!authRequired || !user || user.email === 'local') return null;

  const displayName = displayNameFromUser(user);
  const initials = displayName.slice(0, 2).toUpperCase();

  if (variant === 'full') {
    return (
      <div className="rounded-app border border-line bg-surface p-4 shadow-app sm:p-5">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-ink3">Your account</div>
        <div className="flex items-center gap-3">
          {user.picture ? (
            <img src={user.picture} alt="" className="h-12 w-12 rounded-full border border-line object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft font-display text-sm font-bold text-accent">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-ink">{displayName}</div>
            <div className="truncate text-sm text-ink2">{user.email}</div>
            {user.provider && (
              <div className="mt-0.5 text-[10px] uppercase tracking-wide text-ink3">
                Signed in with {user.provider === 'google' ? 'Google' : user.provider}
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-app-sm border border-line bg-surface2 px-3 py-2.5 text-sm font-medium text-ink2 transition-colors hover:border-red hover:text-red"
        >
          <IconLogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-line bg-surface py-1 pl-1 pr-2 transition-colors hover:border-accent-line"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {user.picture ? (
          <img src={user.picture} alt="" className="h-7 w-7 rounded-md object-cover" />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-soft text-[10px] font-bold text-accent">
            {initials}
          </div>
        )}
        <span className="hidden max-w-[120px] truncate text-xs font-medium text-ink2 lg:inline">{displayName}</span>
      </button>

      {open && (
        <>
          <button type="button" className="fixed inset-0 z-[1002]" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+6px)] z-[1003] min-w-[220px] rounded-app border border-line bg-surface p-3 shadow-app">
            <div className="mb-2 border-b border-line2 pb-2">
              <div className="truncate text-sm font-semibold text-ink">{displayName}</div>
              <div className="truncate text-xs text-ink2">{user.email}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void logout();
              }}
              className="flex w-full items-center gap-2 rounded-app-sm px-2 py-2 text-sm text-ink2 transition-colors hover:bg-red-soft hover:text-red"
            >
              <IconLogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
