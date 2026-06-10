import { useEffect, useState } from 'react';
import { USE_API } from '../../api/client';
import { useApp } from '../../context/AppContext';

export function DbStatusBar() {
  const { dbStatus } = useApp();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (USE_API && dbStatus === 'connected') {
      setVisible(true);
      const t = window.setTimeout(() => setVisible(false), 4000);
      return () => window.clearTimeout(t);
    }
    setVisible(false);
  }, [dbStatus]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[1100] bg-emerald-600/95 px-3 py-1.5 text-center text-[11px] font-medium text-white shadow-sm"
      role="status"
    >
      MongoDB connected
    </div>
  );
}
