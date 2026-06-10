import { useNavigate } from 'react-router-dom';
import { IconBack } from '../icons';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  showBack?: boolean;
}

export function PageHeader({ title, subtitle, backTo, showBack = true }: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) navigate(backTo);
    else navigate(-1);
  };

  return (
    <div className="mb-5 mt-4 flex items-start gap-3 sm:mt-6">
      {showBack && (
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-app-sm border border-line bg-surface text-ink2 transition-colors hover:border-accent-line hover:text-accent lg:hidden"
        >
          <IconBack className="h-5 w-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink2">{subtitle}</p>}
      </div>
    </div>
  );
}
