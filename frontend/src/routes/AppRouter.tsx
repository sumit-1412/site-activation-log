import { Navigate, Route, Routes } from 'react-router-dom';
import { PocModal } from '../components/modals/PocModal';
import { StatusModal } from '../components/modals/StatusModal';
import { VisitModal } from '../components/modals/VisitModal';
import { NavigationBridge } from '../components/NavigationBridge';
import { Toast } from '../components/ui/Toast';
import { useApp } from '../context/AppContext';
import { ClientLayout } from '../layouts/ClientLayout';
import { InternalLayout } from '../layouts/InternalLayout';
import { ClientPage } from '../pages/ClientPage';
import { DocsPage } from '../pages/DocsPage';
import { HomePage } from '../pages/HomePage';
import { InfoPage } from '../pages/InfoPage';
import { NudgePage } from '../pages/NudgePage';
import { SetupPage } from '../pages/SetupPage';
import { TimelinePage } from '../pages/TimelinePage';
import { VisitsPage } from '../pages/VisitsPage';
import { ROUTES } from './paths';
import { SetupGuard } from './SetupGuard';

export function AppRouter() {
  const { loaded, showSetup } = useApp();

  if (!loaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-ink2">
        Loading…
      </div>
    );
  }

  return (
    <>
      <NavigationBridge />
      <Routes>
        <Route path={ROUTES.setup} element={<SetupPage />} />
        <Route element={<SetupGuard />}>
          <Route element={<InternalLayout />}>
            <Route path={ROUTES.home} element={<HomePage />} />
            <Route path={ROUTES.timeline} element={<TimelinePage />} />
            <Route path={ROUTES.visits} element={<VisitsPage />} />
            <Route path={ROUTES.docs} element={<DocsPage />} />
            <Route path={ROUTES.nudge} element={<NudgePage />} />
            <Route path={ROUTES.info} element={<InfoPage />} />
          </Route>
          <Route element={<ClientLayout />}>
            <Route path={ROUTES.client} element={<ClientPage />} />
          </Route>
        </Route>
        <Route
          path="/"
          element={<Navigate to={showSetup ? ROUTES.setup : ROUTES.home} replace />}
        />
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
      <StatusModal />
      <VisitModal />
      <PocModal />
      <Toast />
    </>
  );
}
