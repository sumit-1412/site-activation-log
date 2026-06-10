interface ConnectionErrorProps {
  title: string;
  message: string;
  hint?: string;
  onRetry: () => void;
}

export function ConnectionError({ title, message, hint, onRetry }: ConnectionErrorProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-2xl">
        ✕
      </div>
      <div>
        <h1 className="font-display text-lg font-bold text-ink">{title}</h1>
        <p className="mt-2 max-w-sm text-sm text-ink2">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white"
      >
        Retry
      </button>
      {hint && <p className="max-w-md text-xs text-ink3">{hint}</p>}
    </div>
  );
}
