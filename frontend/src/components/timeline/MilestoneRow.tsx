import { useRef, useState, type ReactNode } from 'react';
import { useApp } from '../../context/AppContext';
import { IconCheck, IconClock } from '../icons';

const TH = 66;

export function MilestoneRow({ milestoneId, children }: { milestoneId: string; children: ReactNode }) {
  const { applyStatus, openStatusModal } = useApp();
  const slideRef = useRef<HTMLDivElement>(null);
  const [revealDone, setRevealDone] = useState(false);
  const [revealWait, setRevealWait] = useState(false);
  const drag = useRef({ active: false, dragging: false, x0: 0, dx: 0 });

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    drag.current = { active: true, dragging: false, x0: e.clientX, dx: 0 };
    if (slideRef.current) slideRef.current.style.transition = 'none';
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active || !slideRef.current) return;
    drag.current.dx = e.clientX - drag.current.x0;
    if (Math.abs(drag.current.dx) > 6) drag.current.dragging = true;
    const c = Math.max(-110, Math.min(110, drag.current.dx));
    slideRef.current.style.transform = `translateX(${c}px)`;
    setRevealDone(c > TH);
    setRevealWait(c < -TH);
  };

  const end = () => {
    if (!drag.current.active || !slideRef.current) return;
    drag.current.active = false;
    slideRef.current.style.transition = 'transform .2s cubic-bezier(.4,0,.2,1)';
    setRevealDone(false);
    setRevealWait(false);

    if (!drag.current.dragging) {
      slideRef.current.style.transform = '';
      openStatusModal(milestoneId);
      return;
    }
    if (drag.current.dx > TH) {
      slideRef.current.style.transform = 'translateX(0)';
      applyStatus(milestoneId, 'done');
    } else if (drag.current.dx < -TH) {
      slideRef.current.style.transform = 'translateX(0)';
      applyStatus(milestoneId, 'waiting');
    } else {
      slideRef.current.style.transform = '';
    }
  };

  return (
    <div className="relative overflow-hidden border-b border-line2 touch-pan-y last:border-b-0">
      <div className={`absolute inset-y-0 left-0 z-[1] flex w-[88px] items-center gap-1 bg-accent-soft pl-3 text-[11px] font-semibold text-accent transition-opacity ${revealDone ? 'opacity-100' : 'opacity-0'}`}>
        <IconCheck className="h-3 w-3 shrink-0 stroke-accent" />
        <span>Done</span>
      </div>
      <div className={`absolute inset-y-0 right-0 z-[1] flex w-[88px] items-center justify-end gap-1 bg-amber-soft pr-3 text-[11px] font-semibold text-amber transition-opacity ${revealWait ? 'opacity-100' : 'opacity-0'}`}>
        <span>Waiting</span>
        <IconClock className="h-3 w-3 shrink-0 stroke-amber" />
      </div>
      <div
        ref={slideRef}
        className="relative z-[2] bg-surface will-change-transform"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerCancel={end}
      >
        {children}
      </div>
    </div>
  );
}
