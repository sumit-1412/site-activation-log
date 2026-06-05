import { Outlet } from 'react-router-dom';
import { BottomNav } from '../components/layout/BottomNav';
import { Topbar } from '../components/layout/Topbar';

export function InternalLayout() {
  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-app pt-[calc(54px+env(safe-area-inset-top))]">
        <Outlet />
        <BottomNav />
      </main>
    </>
  );
}
