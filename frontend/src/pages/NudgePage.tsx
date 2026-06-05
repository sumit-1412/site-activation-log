import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getClientWaiting, pickPocFor } from '../lib/selectors';
import { IconCheckOk, IconCopy, IconInbox, IconSend } from '../components/icons';

const SENDERS = ['Puranjane', 'Samir', 'Ujjwal'];

export function NudgePage() {
  const {
    state,
    currentSender,
    setCurrentSender,
    nudgePoc,
    setNudgePoc,
    nudgeDraft,
    clearNudgeDraft,
    sendNudge,
    copyNudge,
  } = useApp();

  const waiting = getClientWaiting(state);

  useEffect(() => {
    if (waiting.length) {
      const routed = waiting.map((w) => pickPocFor(state, w.id));
      setNudgePoc(routed.find((x) => x > 0) ?? routed[0] ?? 0);
    }
  }, [waiting.length, state.pocs, setNudgePoc]);

  const defaultMessage = useMemo(() => {
    if (!waiting.length) return 'No pending items from client at this time.';
    const to = state.pocs[nudgePoc]?.name?.split(' ')[0];
    let msg = `Hi${to ? ` ${to}` : ''},\n\nHope you're doing well! This is ${currentSender} from Humblx.\n\nWe're progressing well on the ${state.info.name} setup. To keep things moving, we need the following from your end:\n\n`;
    waiting.forEach((w, i) => {
      msg += `${i + 1}. ${w.label}\n`;
    });
    msg += `\nOnce we have these, we can proceed to the next phase right away. Feel free to reach out if you need any help.\n\nThank you!\n${currentSender}\nHumblx — ${state.info.name}`;
    return msg;
  }, [waiting, state.info.name, state.pocs, nudgePoc, currentSender]);

  const [message, setMessage] = useState(defaultMessage);

  useEffect(() => {
    if (nudgeDraft) {
      setMessage(nudgeDraft);
      clearNudgeDraft();
    } else {
      setMessage(defaultMessage);
    }
  }, [nudgeDraft, defaultMessage, clearNudgeDraft]);

  return (
    <div className="pb-24">
      <div className="mx-4 mt-4 rounded-app border border-line bg-surface p-4 shadow-app">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink3">Client-Pending Items</div>
        <div className="mb-3.5 overflow-hidden rounded-app-sm border border-line2">
          {!waiting.length ? (
            <div className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-accent">
              <IconCheckOk className="h-4 w-4" /> No pending client items
            </div>
          ) : (
            waiting.map((w) => {
              const d = w.sentAt ? Math.floor((Date.now() - new Date(w.sentAt).getTime()) / 86400000) : null;
              const ov = d !== null && d > Math.floor(w.sla / 24);
              return (
                <div key={w.id} className="flex items-center gap-2.5 border-b border-line2 px-3 py-2 last:border-b-0">
                  <span className={`h-[7px] w-[7px] shrink-0 rounded-full ${ov ? 'bg-red' : 'bg-amber'}`} />
                  <div className="min-w-0 flex-1 text-xs text-ink">{w.label}</div>
                  <div className={`font-mono text-[11px] ${ov ? 'text-red' : 'text-ink3'}`}>{d !== null ? `${d}d` : '—'}</div>
                </div>
              );
            })
          )}
        </div>

        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink3">Send To</div>
        {!state.pocs.length ? (
          <p className="mb-3 text-xs text-ink3">No contacts yet — add one in Info.</p>
        ) : (
          <div className="mb-3 flex flex-col gap-1.5">
            {state.pocs.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setNudgePoc(i)}
                className={`rounded-[9px] border px-3 py-2.5 text-left transition-colors ${nudgePoc === i ? 'border-accent bg-accent-soft' : 'border-line bg-surface2'}`}
              >
                <div className="text-[13px] font-semibold text-ink">{p.name}</div>
                <div className={`text-[11px] ${nudgePoc === i ? 'text-accent' : 'text-ink3'}`}>
                  {p.role}{p.phone ? ` · ${p.phone}` : ''}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink3">Sign Off As</div>
        <div className="mb-3 flex gap-1.5">
          {SENDERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setCurrentSender(s)}
              className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium ${currentSender === s ? 'border-ink bg-ink text-white' : 'border-line bg-surface2 text-ink2'}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-ink3">Message · editable</div>
        <textarea
          className="min-h-[200px] w-full resize-y rounded-app-sm border border-line bg-surface2 p-3 text-[13px] leading-normal text-ink outline-none focus:border-accent"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="mt-2.5 grid grid-cols-[1fr_auto] gap-2">
          <button type="button" onClick={() => sendNudge(message)} className="flex items-center justify-center gap-2 rounded-app-sm border border-accent bg-accent py-3 text-[13px] font-semibold text-white">
            <IconSend className="h-4 w-4" /> Open WhatsApp
          </button>
          <button type="button" onClick={() => copyNudge(message)} className="flex items-center justify-center rounded-app-sm border border-line bg-surface px-3 py-3">
            <IconCopy className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mx-4">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink3">Nudge History</div>
        {!state.nudgeLogs.length ? (
          <div className="rounded-app border border-line bg-surface px-6 py-8 text-center text-[13px] text-ink3 shadow-app">
            <IconInbox className="mx-auto mb-3 h-[34px] w-[34px] stroke-line" />
            <div>No nudges sent yet</div>
          </div>
        ) : (
          [...state.nudgeLogs].reverse().map((n, i) => (
            <div key={i} className="mb-1.5 rounded-lg border border-line2 bg-surface px-3 py-2 text-xs text-ink2">
              Sent by <b className="text-ink">{n.sender}</b> to {n.to} ·{' '}
              {new Date(n.time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
