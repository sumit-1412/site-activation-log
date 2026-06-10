import { DOCS, DOC_TEMPLATES } from '../data/docs';
import { useApp } from '../context/AppContext';
import { fmtDate } from '../lib/utils';
import { downloadTemplate } from '../lib/templates';
import type { DocState, DocStatus } from '../types';
import { IconCheck, IconExt } from '../components/icons';
import { PageHeader } from '../components/layout/PageHeader';
import { TemplateButton } from '../components/ui/TemplateButton';
import { ROUTES } from '../routes/paths';

const STEPS: { key: DocStatus; label: string; dk?: keyof DocState }[] = [
  { key: 'not-sent', label: 'Not Sent' },
  { key: 'sent', label: 'Sent', dk: 'sentDate' },
  { key: 'received', label: 'Received', dk: 'receivedDate' },
  { key: 'approved', label: 'Approved', dk: 'approvedDate' },
];

export function DocsPage() {
  const { state, advanceDoc, saveDocLink, showToast } = useApp();

  return (
    <div>
      <PageHeader title="Documents" subtitle="Document approval · 8 items" backTo={ROUTES.home} />
      <div className="page-grid-2">
      {DOCS.map((d) => {
        const doc = state.docs[d.id];
        const ci = STEPS.findIndex((s) => s.key === doc.status);
        const tpls = DOC_TEMPLATES[d.id] || [];

        return (
          <div key={d.id} className="rounded-app border border-line bg-surface p-3.5 shadow-app sm:p-4">
            <div className="mb-2.5 text-[13px] font-semibold text-ink">{d.name}</div>
            <div className="mb-2.5 flex flex-wrap items-center gap-1">
              {STEPS.map((s, i) => (
                <span key={s.key} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => advanceDoc(d.id, s.key)}
                    className={`flex items-center gap-1 rounded-[7px] border px-2 py-1 font-mono text-[10px] transition-colors ${
                      i <= ci ? 'border-accent-line bg-accent-soft text-accent' : i === ci + 1 ? 'border-ink bg-surface text-ink' : 'border-line bg-surface2 text-ink3'
                    }`}
                  >
                    {i <= ci && i > 0 && <IconCheck className="h-2.5 w-2.5" />}
                    {s.label}
                    {i <= ci && s.dk && doc[s.dk] && (
                      <span className="text-[9px] opacity-65">{fmtDate(doc[s.dk] as string)}</span>
                    )}
                  </button>
                  {i < STEPS.length - 1 && <span className="text-[13px] text-ink3">›</span>}
                </span>
              ))}
            </div>
            {tpls.length > 0 && (
              <div className="mb-2.5 flex flex-wrap gap-1.5">
                {tpls.map((k) => (
                  <TemplateButton key={k} templateKey={k} onDownload={() => downloadTemplate(k, showToast)} />
                ))}
              </div>
            )}
            <div className="flex gap-1.5">
              <input
                className="flex-1 rounded-lg border border-line bg-surface2 px-2.5 py-2 text-xs text-ink outline-none focus:border-accent"
                placeholder="Paste drive / email link…"
                value={doc.link || ''}
                onChange={(e) => saveDocLink(d.id, e.target.value)}
              />
              {doc.link && (
                <a href={doc.link} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface2">
                  <IconExt className="h-3.5 w-3.5 stroke-accent" />
                </a>
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
