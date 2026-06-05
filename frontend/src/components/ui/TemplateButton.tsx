import { TEMPLATES } from '../../data/templates';
import { IconDl } from '../icons';

export function TemplateButton({
  templateKey,
  small,
  onDownload,
}: {
  templateKey: string;
  small?: boolean;
  onDownload: () => void;
}) {
  const t = TEMPLATES[templateKey];
  if (!t) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDownload();
      }}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-accent-line bg-accent-soft font-semibold text-accent active:scale-[.97] ${
        small ? 'px-2.5 py-1.5 text-[11px]' : 'px-2.5 py-1.5 text-xs'
      }`}
    >
      <IconDl className="h-3 w-3 shrink-0" />
      {small ? 'Template' : t.name}
    </button>
  );
}
