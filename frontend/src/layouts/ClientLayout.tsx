import { Outlet } from 'react-router-dom';
import { SidebarNav } from '../components/layout/SidebarNav';
import { Topbar } from '../components/layout/Topbar';

export function ClientLayout() {
  return (
    <div className="min-h-dvh lg:pl-60">
      <SidebarNav />
      <div className="flex min-h-dvh flex-col">
        <Topbar />
        <main className="app-main mx-auto max-w-app flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
