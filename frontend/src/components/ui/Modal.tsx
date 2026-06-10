import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end bg-ink/40 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="animate-sheet-up mx-auto max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-[22px] border-t border-line bg-surface px-[18px] pb-[calc(18px+env(safe-area-inset-bottom))] pt-[18px] sm:max-w-xl sm:rounded-app sm:border sm:pb-[18px] sm:shadow-app">
        <div className="mx-auto mb-3.5 h-1 w-9 rounded-full bg-line" />
        {children}
      </div>
    </div>
  );
}
