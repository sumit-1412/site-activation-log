import { Outlet } from 'react-router-dom';
import { Topbar } from '../components/layout/Topbar';

export function ClientLayout() {
  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-app pt-[calc(54px+env(safe-area-inset-top))]">
        <Outlet />
      </main>
    </>
  );
}
